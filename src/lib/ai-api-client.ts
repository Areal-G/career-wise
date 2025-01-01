"use client";

import { saveAiResult } from "@/lib/ai-history";

export async function postAiJson<T>(
  path: string,
  body: unknown,
  options: { save?: boolean; jobId?: string } = {}
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      typeof data?.error === "string" ? data.error : "Request failed. Please try again."
    );
  }

  // Keep a history of AI output per user (and per job when opened from one).
  if (options.save !== false) {
    const tool = path.replace(/^\/api\/ai\//, "").split(/[/?]/)[0];
    void saveAiResult(tool, (body ?? {}) as Record<string, unknown>, data, options.jobId);
  }

  return data as T;
}
