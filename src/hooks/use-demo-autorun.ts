"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

/** Seeded guest accounts all have uids that start with "demo-". */
export function isDemoUser(uid?: string | null) {
  return !!uid && uid.startsWith("demo-");
}

/** Job the guest seeker's AI tools are pre-filled against when no ?jobId is given. */
export const DEMO_SAMPLE_JOB_ID = "job-nw-senior-fe";

/**
 * For the guest demo account only: runs the tool once, as soon as its form is
 * filled, so every LaunchPad page opens with a worked sample instead of an
 * empty state. Real users still press the button themselves.
 */
export function useDemoAutoRun(ready: boolean, run: () => unknown) {
  const { user } = useAuth();
  const done = useRef(false);
  const runRef = useRef(run);
  runRef.current = run;

  useEffect(() => {
    if (done.current || !ready || !isDemoUser(user?.uid)) return;
    done.current = true;
    void runRef.current();
  }, [ready, user?.uid]);
}
