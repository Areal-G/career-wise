import { describe, expect, it } from "vitest";
import { daysSince, needsFollowUp, normalizeStatus, statusLabel, toTrackerColumn } from "@/lib/application-status";

const DAY = 86_400_000;
const now = Date.UTC(2026, 10, 10);

describe("normalizeStatus", () => {
  it("maps legacy and lower-case values onto pipeline stages", () => {
    expect(normalizeStatus("pending")).toBe("Submitted");
    expect(normalizeStatus("under review")).toBe("Screening");
    expect(normalizeStatus("Approved")).toBe("Hired");
    expect(normalizeStatus("declined")).toBe("Rejected");
    expect(normalizeStatus(undefined)).toBe("Submitted");
  });
});

describe("toTrackerColumn", () => {
  it("puts each employer stage in the matching seeker column", () => {
    expect(toTrackerColumn("Submitted")).toBe("applied");
    expect(toTrackerColumn("Screening")).toBe("applied");
    expect(toTrackerColumn("Interview")).toBe("interview");
    expect(toTrackerColumn("Offer")).toBe("offer");
    expect(toTrackerColumn("Hired")).toBe("offer");
    expect(toTrackerColumn("Rejected")).toBe("rejected");
    expect(toTrackerColumn("Invited")).toBe("saved");
  });
});

describe("statusLabel", () => {
  it("uses friendly wording for seekers", () => {
    expect(statusLabel("Screening")).toBe("In review");
    expect(statusLabel("rejected")).toBe("Not selected");
  });
});

describe("daysSince", () => {
  it("accepts Dates, ISO strings, millis and Firestore timestamps", () => {
    expect(daysSince(new Date(now - 3 * DAY), now)).toBe(3);
    expect(daysSince(new Date(now - 2 * DAY).toISOString(), now)).toBe(2);
    expect(daysSince(now - 5 * DAY, now)).toBe(5);
    expect(daysSince({ toMillis: () => now - DAY }, now)).toBe(1);
    expect(daysSince({ seconds: (now - 4 * DAY) / 1000 }, now)).toBe(4);
    expect(daysSince(null, now)).toBeNull();
  });
});

describe("needsFollowUp", () => {
  it("nudges only waiting applications older than a week", () => {
    expect(needsFollowUp("Submitted", now - 8 * DAY, now)).toBe(true);
    expect(needsFollowUp("Screening", now - 7 * DAY, now)).toBe(true);
    expect(needsFollowUp("Submitted", now - 6 * DAY, now)).toBe(false);
    expect(needsFollowUp("Interview", now - 30 * DAY, now)).toBe(false);
    expect(needsFollowUp("Rejected", now - 30 * DAY, now)).toBe(false);
    expect(needsFollowUp("Submitted", undefined, now)).toBe(false);
  });
});
