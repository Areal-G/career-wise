import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { requireAuth } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase-admin";
import { isAiRateLimitError } from "@/lib/ai-rate-limit";
import { estimateYears, jobFromDoc, splitSkills } from "@/lib/career";
import type { DocumentData } from "firebase/firestore";

/**
 * "Prepare for this job": one request that builds a full application pack
 * (match score, skill gap, tailored cover letter, likely interview questions)
 * from the user's profile and a specific job, and saves it to their history.
 */
export async function POST(request: NextRequest) {
  try {
    const { response: authError, user } = await requireAuth(request);
    if (authError) return authError;
    if (!user || !adminDb) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const { jobId } = (await request.json()) as { jobId?: string };
    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const [jobSnap, profileSnap] = await Promise.all([
      adminDb.collection("opportunities").doc(jobId).get(),
      adminDb.collection("users").doc(user.uid).get(),
    ]);
    if (!jobSnap.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const job = jobFromDoc(jobSnap.id, jobSnap.data() as DocumentData);
    const profile = (profileSnap.data() || {}) as DocumentData;
    const skills = splitSkills(profile.skills);
    const history = String(profile.employmentHistory || "");
    const years = estimateYears(history);
    const name = profile.displayName || [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Candidate";
    const title = String(profile.headline || "").split(/[·|,]/)[0]?.trim() || "Professional";

    const [{ scoreJobMatch }, { analyzeSkillGap }, { generateCoverLetter }, { generateInterviewQuestions }] =
      await Promise.all([
        import("@/ai/flows/job-match"),
        import("@/ai/flows/skill-gap"),
        import("@/ai/flows/generate-cover-letter"),
        import("@/ai/flows/interview-prep"),
      ]);

    const [match, skillGap, coverLetter, interview] = await Promise.all([
      scoreJobMatch({
        userSkills: skills,
        userExperience: history || undefined,
        userEducation: profile.education || undefined,
        userLocation: profile.location || undefined,
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.skills,
        jobLocation: job.location || undefined,
        jobSalary: job.compensation || undefined,
      }),
      analyzeSkillGap({
        userSkills: skills,
        jobTitle: job.title,
        jobDescription: job.description,
        jobRequirements: job.skills,
        userExperience: history || undefined,
      } as Parameters<typeof analyzeSkillGap>[0]),
      generateCoverLetter({
        userInfo: {
          name,
          email: profile.email || user.email || "",
          currentTitle: title,
          experience: history || `${years} years of experience`,
          skills: skills.join(", "),
        },
        jobInfo: { title: job.title, company: job.company, description: job.description },
        tone: "professional",
        length: "medium",
      }),
      generateInterviewQuestions({
        role: job.title,
        company: job.company,
        experienceLevel: years >= 8 ? "senior" : years < 2 ? "entry" : "mid",
        questionType: "all",
        skills: job.skills,
        count: 6,
      }),
    ]);

    const pack = {
      job: { id: job.id, title: job.title, company: job.company, location: job.location },
      match,
      skillGap,
      coverLetter,
      interview,
      generatedAt: new Date().toISOString(),
    };

    const saved = await adminDb
      .collection("users")
      .doc(user.uid)
      .collection("aiResults")
      .add({
        tool: "prepare",
        title: `${job.title} at ${job.company}`,
        jobId: job.id,
        output: JSON.parse(JSON.stringify(pack)),
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ ...pack, id: saved.id });
  } catch (error) {
    if (isAiRateLimitError(error)) {
      return NextResponse.json(
        { error: "Too many AI requests. Please try again later.", retryAfter: error.retryAfterSeconds },
        { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } }
      );
    }
    console.error("Prepare pack failed:", error);
    const message = error instanceof Error ? error.message : "Failed to prepare for this job.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
