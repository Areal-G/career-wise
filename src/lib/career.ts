import type { DocumentData } from "firebase/firestore";
/** Pure helpers shared by client hooks and server routes. */

export interface JobContext {
  id: string;
  title: string;
  company: string;
  description: string;
  skills: string[];
  location: string;
  employerId?: string;
  type?: string;
  compensation?: string;
}

export function splitSkills(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  return String(value || "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Rough years of experience from text like "Acme (2019–present)". */
export function estimateYears(history: string): number {
  const years = Array.from(history.matchAll(/(19|20)\d{2}/g)).map((m) => Number(m[0]));
  if (!years.length) return 0;
  const end = /present|current|now/i.test(history) ? new Date().getFullYear() : Math.max(...years);
  return Math.max(0, Math.min(40, end - Math.min(...years)));
}

export function jobFromDoc(id: string, data: DocumentData): JobContext {
  return {
    id,
    title: data.title || "",
    company: data.employerName || data.company || "",
    description: [
      data.description,
      data.rolesAndResponsibilities,
      data.skills ? `Required skills: ${splitSkills(data.skills).join(", ")}` : "",
      data.preferredQualifications,
    ]
      .filter(Boolean)
      .join("\n\n"),
    skills: splitSkills(data.skills),
    location: data.location || "",
    employerId: data.employerId,
    type: data.type,
    compensation: data.compensationAndBenefits,
  };
}


const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9+#]/g, "");

/** Which of the job's skills a candidate covers (case/punctuation-insensitive, "React" matches "React.js"). */
export function skillOverlap(candidateSkills: unknown, jobSkills: unknown) {
  const mine = splitSkills(candidateSkills).map(norm).filter(Boolean);
  const required = splitSkills(jobSkills);
  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of required) {
    const n = norm(skill);
    const hit = n && mine.some((m) => m === n || (m.length > 2 && n.length > 2 && (m.startsWith(n) || n.startsWith(m))));
    (hit ? matched : missing).push(skill);
  }
  const pct = required.length ? Math.round((matched.length / required.length) * 100) : 0;
  return { matched, missing, pct };
}
