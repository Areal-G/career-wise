/**
 * Single source of truth for application statuses.
 *
 * Employers move applications through PIPELINE_STAGES; seekers see the same
 * application on their tracker board, mapped with toTrackerColumn().
 */

export const PIPELINE_STAGES = ["Submitted", "Screening", "Interview", "Offer", "Hired", "Rejected"] as const;
export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export type TrackerColumn = "saved" | "applied" | "interview" | "offer" | "rejected";

/** Normalise legacy/lower-case values ("pending", "approved", ...) to a pipeline stage. */
export function normalizeStatus(status?: string | null): PipelineStage | "Withdrawn" | "Invited" {
  const s = (status || "").trim().toLowerCase();
  switch (s) {
    case "screening":
    case "under review":
    case "reviewing":
      return "Screening";
    case "interview":
    case "interviewing":
      return "Interview";
    case "offer":
    case "offered":
      return "Offer";
    case "hired":
    case "accepted":
    case "approved":
      return "Hired";
    case "rejected":
    case "declined":
      return "Rejected";
    case "withdrawn":
      return "Withdrawn";
    case "invited":
      return "Invited";
    default:
      return "Submitted";
  }
}

export function toTrackerColumn(status?: string | null): TrackerColumn {
  switch (normalizeStatus(status)) {
    case "Interview":
      return "interview";
    case "Offer":
    case "Hired":
      return "offer";
    case "Rejected":
    case "Withdrawn":
      return "rejected";
    case "Invited":
      return "saved";
    default:
      return "applied"; // Submitted, Screening
  }
}

export const STATUS_LABEL: Record<string, string> = {
  Submitted: "Applied",
  Screening: "In review",
  Interview: "Interviewing",
  Offer: "Offer",
  Hired: "Hired",
  Rejected: "Not selected",
  Withdrawn: "Withdrawn",
  Invited: "Invited",
};

export function statusLabel(status?: string | null): string {
  return STATUS_LABEL[normalizeStatus(status)];
}

export const FOLLOW_UP_AFTER_DAYS = 7;

function toMillis(value: unknown): number | null {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const t = Date.parse(value);
    return Number.isNaN(t) ? null : t;
  }
  const maybe = value as { toMillis?: () => number; seconds?: number };
  if (typeof maybe.toMillis === "function") return maybe.toMillis();
  if (typeof maybe.seconds === "number") return maybe.seconds * 1000;
  return null;
}

/** Days since the application last moved, or null when unknown. */
export function daysSince(value: unknown, now = Date.now()): number | null {
  const ms = toMillis(value);
  return ms === null ? null : Math.floor((now - ms) / 86_400_000);
}

/** Applications still waiting after a week deserve a follow-up nudge. */
export function needsFollowUp(status: string | null | undefined, lastActivity: unknown, now = Date.now()): boolean {
  const stage = normalizeStatus(status);
  if (stage !== "Submitted" && stage !== "Screening") return false;
  const days = daysSince(lastActivity, now);
  return days !== null && days >= FOLLOW_UP_AFTER_DAYS;
}
