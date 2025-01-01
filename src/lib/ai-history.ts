"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { DocumentData } from "firebase/firestore";

/** Friendly metadata for each AI endpoint. */
export const AI_TOOLS: Record<string, { name: string; href: string }> = {
  "career-path": { name: "Career path", href: "/ai-tools/career-path" },
  "cover-letter": { name: "Cover letter", href: "/ai-tools/cover-letter" },
  "email-templates": { name: "Email", href: "/ai-tools/email-templates" },
  "interview-prep": { name: "Interview prep", href: "/ai-tools/interview-prep" },
  linkedin: { name: "LinkedIn profile", href: "/ai-tools/linkedin" },
  "resume-builder": { name: "Resume", href: "/ai-tools/resume-builder" },
  "resume-match": { name: "Resume match", href: "/ai-tools/resume-match" },
  salary: { name: "Salary insights", href: "/ai-tools/salary" },
  "skill-gap": { name: "Skill gap", href: "/ai-tools/skill-gap" },
  prepare: { name: "Job prep pack", href: "/opportunities" },
};

export interface AiResultRecord {
  id: string;
  tool: string;
  title: string;
  jobId?: string | null;
  output: unknown;
  createdAt?: { toDate?: () => Date } | null;
}

/** Request bodies differ per tool; this only reads optional, well-known fields from them. */
type AnyBody = DocumentData;

function describe(tool: string, body: AnyBody): string {
  const p = (body?.payload ?? body) as AnyBody;
  const job = p.jobInfo ?? {};
  const role =
    p.targetRole || p.role || p.jobTitle || job.title || p.userInfo?.title || p.currentRole || "";
  const company = p.company || p.companyName || job.company || p.targetCompany || "";
  if (tool === "interview-prep" && body?.action === "evaluateAnswer") return `Answer feedback · ${role}`.trim();
  return [role, company && `at ${company}`].filter(Boolean).join(" ") || AI_TOOLS[tool]?.name || tool;
}

/** The job a tool was opened for (…?jobId=abc), so results group per job. */
function currentJobId(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("jobId");
}

/** Firestore rejects undefined; JSON round-trip drops it and keeps size sane. */
function sanitize(value: unknown): unknown {
  const json = JSON.stringify(value ?? null);
  return json.length > 200_000 ? { truncated: true } : JSON.parse(json);
}

export async function saveAiResult(tool: string, body: AnyBody, output: unknown, jobId = currentJobId()) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await addDoc(collection(db, "users", uid, "aiResults"), {
      tool,
      title: describe(tool, body).slice(0, 140),
      jobId: jobId ?? null,
      output: sanitize(output),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    // History is a convenience; never break the tool because of it.
    console.warn("Could not save AI result:", error);
  }
}

export function subscribeAiResults(
  uid: string,
  opts: { jobId?: string; limit?: number },
  cb: (items: AiResultRecord[]) => void
) {
  const base = collection(db, "users", uid, "aiResults");
  const q = opts.jobId
    ? query(base, where("jobId", "==", opts.jobId), orderBy("createdAt", "desc"), fsLimit(opts.limit ?? 20))
    : query(base, orderBy("createdAt", "desc"), fsLimit(opts.limit ?? 20));
  return onSnapshot(
    q,
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AiResultRecord, "id">) }))),
    () => cb([])
  );
}

export async function deleteAiResult(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "aiResults", id));
}
