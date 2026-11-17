"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { estimateYears, jobFromDoc, splitSkills, type JobContext } from "@/lib/career";
import type { DocumentData } from "firebase/firestore";

export { estimateYears, jobFromDoc, splitSkills };
export type { JobContext };

export interface CareerContext {
  ready: boolean;
  name: string;
  email: string;
  /** Best guess at the user's current title, e.g. "Frontend Engineer". */
  title: string;
  skills: string[];
  skillsText: string;
  location: string;
  experienceYears: number;
  experienceText: string;
  education: string;
  careerGoals: string;
  linkedin: string;
  job: JobContext | null;
}

/**
 * Everything the AI tools need to pre-fill their forms: the signed-in user's
 * profile, plus the job when a tool is opened with ?jobId=….
 */
export function useCareerContext(): CareerContext {
  const { user, userProfile, loading } = useAuth();
  const [jobId, setJobId] = useState<string | null | undefined>(undefined);
  const [job, setJob] = useState<JobContext | null>(null);
  const [jobLoading, setJobLoading] = useState(true);

  useEffect(() => {
    setJobId(new URLSearchParams(window.location.search).get("jobId"));
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (jobId === undefined) return;
    if (!jobId || !user) {
      setJob(null);
      setJobLoading(false);
      return;
    }
    setJobLoading(true);
    getDoc(doc(db, "opportunities", jobId))
      .then((snap) => {
        if (!cancelled) setJob(snap.exists() ? jobFromDoc(snap.id, snap.data()) : null);
      })
      .catch(() => !cancelled && setJob(null))
      .finally(() => !cancelled && setJobLoading(false));
    return () => {
      cancelled = true;
    };
  }, [jobId, user]);

  return useMemo(() => {
    const p = (userProfile || {}) as DocumentData;
    const history = String(p.employmentHistory || "");
    const headline = String(p.headline || "");
    const titleFromHistory = history.split("\n")[0]?.split(/[—–-]/)[0]?.trim() || "";
    const skills = splitSkills(p.skills);
    return {
      ready: !loading && !jobLoading,
      name: p.displayName || user?.displayName || [p.firstName, p.lastName].filter(Boolean).join(" "),
      email: p.email || user?.email || "",
      title: headline.split(/[·|,]/)[0]?.trim() || titleFromHistory,
      skills,
      skillsText: skills.join(", "),
      location: p.location || "",
      experienceYears: estimateYears(history),
      experienceText: history,
      education: p.education || "",
      careerGoals: p.careerGoals || "",
      linkedin: p.linkedinLink || "",
      job,
    };
  }, [userProfile, user, loading, jobLoading, job]);
}

/**
 * Runs `apply` once, as soon as the context is ready. Pages use it to fill
 * empty form fields without overwriting anything the user already typed.
 */
export function usePrefill(ctx: CareerContext, apply: (ctx: CareerContext) => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !ctx.ready) return;
    if (!ctx.name && !ctx.job) return; // profile not loaded yet
    done.current = true;
    apply(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx]);
}
