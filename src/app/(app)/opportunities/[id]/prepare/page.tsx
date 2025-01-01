"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  FileText,
  GraduationCap,
  History,
  Lightbulb,
  Loader2,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useSavedOpportunities } from "@/context/SavedOpportunitiesContext";
import { subscribeAiResults, type AiResultRecord } from "@/lib/ai-history";
import { jobFromDoc, type JobContext } from "@/lib/career";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { DocumentData } from "firebase/firestore";

// ---------- Types (mirrors /api/ai/prepare) ----------
type Recommendation = "strong-match" | "good-match" | "potential-match" | "not-recommended";
interface PrepPack {
  id?: string;
  job: { id: string; title: string; company: string; location?: string };
  match: {
    overallScore: number;
    breakdown: Record<"skills" | "experience" | "education" | "location", { score: number; notes?: string; matched?: string[]; missing?: string[] }>;
    recommendation: Recommendation;
    tips: string[];
    coverLetterFocus: string[];
  };
  skillGap: {
    overallMatch: number;
    missingSkills: Array<{ skill: string; priority: string; learningTime: string; resources: Array<{ name: string; type: string; provider?: string }> }>;
    experienceGaps: string[];
    recommendations: Array<{ action: string; priority: string; timeframe: string }>;
  };
  coverLetter: { coverLetter: string; keyPoints: string[]; matchedSkills: string[]; suggestions: string[] };
  interview: {
    questions: Array<{ id: string; question: string; type: string; difficulty: string; tips: string; sampleAnswer: string; followUps: string[] }>;
    generalTips: string[];
  };
  generatedAt: string;
}

const REC_COPY: Record<Recommendation, { label: string; tone: string }> = {
  "strong-match": { label: "Strong match", tone: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400" },
  "good-match": { label: "Good match", tone: "bg-accent text-accent-foreground border-primary/30" },
  "potential-match": { label: "Worth a shot", tone: "bg-brand-crema/15 text-brand-crema border-brand-crema/30" },
  "not-recommended": { label: "Stretch role", tone: "bg-destructive/10 text-destructive border-destructive/30" },
};

const BUILD_STEPS = ["Reading the job description", "Comparing it with your profile", "Writing your cover letter", "Predicting interview questions"];

function ScoreRing({ value, size = 148 }: { value: number; size?: number }) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, Math.round(value)));
  const color = v >= 80 ? "stroke-brand-sage" : v >= 65 ? "stroke-primary" : v >= 50 ? "stroke-brand-crema" : "stroke-destructive";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={12} className="fill-none stroke-muted" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={12}
          strokeLinecap="round"
          className={cn("fill-none transition-[stroke-dashoffset] duration-1000 ease-out", color)}
          strokeDasharray={c}
          strokeDashoffset={c - (v / 100) * c}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums tracking-tight">{v}</span>
        <span className="text-xs text-muted-foreground">match score</span>
      </div>
    </div>
  );
}

function Bar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Target }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-4 w-4" /> {label}
        </span>
        <span className="font-medium tabular-nums">{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width] duration-700" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-3xl border bg-card p-6", className)}>{children}</section>;
}

export default function PreparePage() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const { saved, toggleSave } = useSavedOpportunities();

  const [job, setJob] = useState<JobContext | null>(null);
  const [rawJob, setRawJob] = useState<DocumentData | null>(null);
  const [pack, setPack] = useState<PrepPack | null>(null);
  const [history, setHistory] = useState<AiResultRecord[] | null>(null);
  const [building, setBuilding] = useState(false);
  const [step, setStep] = useState(0);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !user) return;
    getDoc(doc(db, "opportunities", id)).then((snap) => {
      if (!snap.exists()) return;
      setJob(jobFromDoc(snap.id, snap.data()));
      setRawJob({ id: snap.id, ...snap.data() });
    });
  }, [id, user]);

  // Previous packs for this job (newest first).
  useEffect(() => {
    if (!id || !user) return;
    return subscribeAiResults(user.uid, { jobId: id, limit: 10 }, (items) =>
      setHistory(items.filter((i) => i.tool === "prepare"))
    );
  }, [id, user]);

  // Show the latest saved pack automatically.
  useEffect(() => {
    if (pack || !history?.length) return;
    const latest = history[0].output as PrepPack;
    setPack(latest);
    setLetter(latest.coverLetter?.coverLetter ?? "");
  }, [history, pack]);

  const build = useCallback(async () => {
    if (!id) return;
    setBuilding(true);
    setError(null);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(BUILD_STEPS.length - 1, s + 1)), 900);
    try {
      const res = await fetch("/api/ai/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setPack(data);
      setLetter(data.coverLetter?.coverLetter ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      clearInterval(timer);
      setBuilding(false);
    }
  }, [id]);

  // First visit with no saved pack → build one straight away.
  useEffect(() => {
    if (history && history.length === 0 && !pack && !building && !error && role !== "employer") void build();
  }, [history, pack, building, error, build, role]);

  const isSaved = useMemo(() => saved.some((s) => s.id === id), [saved, id]);
  const rec = pack ? REC_COPY[pack.match.recommendation] ?? REC_COPY["good-match"] : null;
  const matched = pack?.match.breakdown.skills.matched ?? [];
  const missing = pack?.match.breakdown.skills.missing ?? [];

  const useLetter = () => {
    try {
      sessionStorage.setItem(`prep-cover-letter:${id}`, letter);
    } catch {}
  };

  const copyLetter = async () => {
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    toast({ title: "Copied", description: "Cover letter copied to clipboard." });
    setTimeout(() => setCopied(false), 1800);
  };

  const title = pack?.job.title ?? job?.title ?? "";
  const company = pack?.job.company ?? job?.company ?? "";

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild className="-ml-3">
          <Link href={`/opportunities/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to job
          </Link>
        </Button>
        {pack && !building && (
          <Button variant="outline" className="rounded-full" onClick={build}>
            <RefreshCw className="mr-2 h-4 w-4" /> Regenerate
          </Button>
        )}
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2rem] border bg-card p-6 sm:p-8">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Prep pack
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title || "Preparing…"}</h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              <span className="font-medium text-foreground">{company}</span>
              {(pack?.job.location || job?.location) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {pack?.job.location || job?.location}
                </span>
              )}
            </p>
            {pack && rec && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-3 py-1 text-sm font-medium", rec.tone)}>{rec.label}</span>
                <span className="text-sm text-muted-foreground">
                  {matched.length} of {matched.length + missing.length} key skills matched
                </span>
              </div>
            )}
          </div>
          {pack && !building && <ScoreRing value={pack.match.overallScore} />}
        </div>
      </div>

      {/* Building state */}
      {building && (
        <Panel className="flex flex-col items-center gap-6 py-14 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div>
            <h2 className="text-xl font-semibold">Building your prep pack</h2>
            <p className="text-sm text-muted-foreground">This takes a few seconds.</p>
          </div>
          <ol className="w-full max-w-sm space-y-2 text-left">
            {BUILD_STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-3 text-sm transition-opacity", i > step && "opacity-40")}>
                {i < step ? (
                  <CheckCircle2 className="h-4 w-4 text-brand-sage" />
                ) : i === step ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <span className="h-4 w-4 rounded-full border" />
                )}
                {s}
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {error && !building && (
        <Panel className="flex flex-col items-center gap-3 py-10 text-center">
          <TriangleAlert className="h-8 w-8 text-brand-crema" />
          <p className="font-medium">{error}</p>
          <Button onClick={build} className="rounded-full">
            Try again
          </Button>
        </Panel>
      )}

      {role === "employer" && (
        <Panel className="text-center text-muted-foreground">Prep packs are built for job seekers. Switch to a seeker account to try it.</Panel>
      )}

      {pack && !building && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Match breakdown */}
            <Panel>
              <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5 text-primary" /> How you match
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Bar label="Skills" value={pack.match.breakdown.skills.score} icon={Sparkles} />
                <Bar label="Experience" value={pack.match.breakdown.experience.score} icon={TrendingUp} />
                <Bar label="Education" value={pack.match.breakdown.education.score} icon={GraduationCap} />
                <Bar label="Location" value={pack.match.breakdown.location.score} icon={MapPin} />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-medium">You bring</p>
                  <div className="flex flex-wrap gap-2">
                    {matched.length ? (
                      matched.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 rounded-full border border-brand-sage/30 bg-brand-sage/10 px-3 py-1 text-xs font-medium text-brand-sage">
                          <Check className="h-3 w-3" /> {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">Add skills to your profile to see matches.</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">To strengthen</p>
                  <div className="flex flex-wrap gap-2">
                    {missing.length ? (
                      missing.map((s) => (
                        <span key={s} className="rounded-full border border-brand-crema/30 bg-brand-crema/10 px-3 py-1 text-xs font-medium text-brand-crema">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No gaps on the listed skills. 🎉</span>
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <Tabs defaultValue="letter" className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl p-1">
                <TabsTrigger value="letter" className="rounded-xl py-2">
                  <FileText className="mr-2 h-4 w-4" /> Cover letter
                </TabsTrigger>
                <TabsTrigger value="interview" className="rounded-xl py-2">
                  <MessageSquareText className="mr-2 h-4 w-4" /> Interview
                </TabsTrigger>
                <TabsTrigger value="plan" className="rounded-xl py-2">
                  <BookOpen className="mr-2 h-4 w-4" /> Skill plan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="letter" className="mt-4">
                <Panel>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Tailored cover letter</h3>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={copyLetter}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button size="sm" asChild className="rounded-full" onClick={useLetter}>
                        <Link href={`/opportunities/${id}/apply`}>
                          Apply with this letter <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <Textarea value={letter} onChange={(e) => setLetter(e.target.value)} className="min-h-[340px] rounded-2xl leading-relaxed [field-sizing:content]" />
                  {pack.coverLetter.suggestions?.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-muted/50 p-4">
                      <p className="mb-2 flex items-center gap-2 text-sm font-medium">
                        <Lightbulb className="h-4 w-4 text-brand-crema" /> Make it yours
                      </p>
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {pack.coverLetter.suggestions.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Panel>
              </TabsContent>

              <TabsContent value="interview" className="mt-4">
                <Panel>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold">Questions you&apos;re likely to get</h3>
                    <Button size="sm" variant="outline" asChild className="rounded-full">
                      <Link href={`/ai-tools/interview-prep?jobId=${id}`}>
                        Practise with feedback <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <Accordion type="single" collapsible className="w-full">
                    {pack.interview.questions.map((q) => (
                      <AccordionItem key={q.id} value={q.id}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <span className="flex flex-col gap-1.5 pr-4">
                            <span className="font-medium">{q.question}</span>
                            <span className="flex gap-2">
                              <Badge variant="secondary" className="capitalize">{q.type}</Badge>
                              <Badge variant="outline" className="capitalize">{q.difficulty}</Badge>
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Tip: </span>
                            {q.tips}
                          </p>
                          <div className="rounded-2xl bg-muted/50 p-4 leading-relaxed">{q.sampleAnswer}</div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </Panel>
              </TabsContent>

              <TabsContent value="plan" className="mt-4">
                <Panel className="space-y-4">
                  <h3 className="font-semibold">Close the gaps</h3>
                  {pack.skillGap.missingSkills.length === 0 && (
                    <p className="text-sm text-muted-foreground">You already cover the listed requirements — focus on telling great impact stories.</p>
                  )}
                  {pack.skillGap.missingSkills.map((m) => (
                    <div key={m.skill} className="rounded-2xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{m.skill}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant={m.priority === "critical" ? "destructive" : "secondary"} className="capitalize">
                            {m.priority}
                          </Badge>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {m.learningTime}
                          </span>
                        </div>
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                        {m.resources.map((r) => (
                          <li key={r.name}>
                            • {r.name}
                            {r.provider ? ` — ${r.provider}` : ""} <span className="text-xs capitalize opacity-70">({r.type})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div>
                    <p className="mb-2 text-sm font-medium">Next steps</p>
                    <ul className="space-y-2">
                      {pack.skillGap.recommendations.map((r) => (
                        <li key={r.action} className="flex items-start justify-between gap-3 rounded-2xl bg-muted/50 p-3 text-sm">
                          <span>{r.action}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{r.timeframe}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Panel className="space-y-3">
              <h3 className="font-semibold">Next steps</h3>
              <Button asChild size="lg" className="w-full rounded-full" onClick={useLetter}>
                <Link href={`/opportunities/${id}/apply`}>
                  Apply now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-full"
                onClick={() => rawJob && !isSaved && toggleSave(rawJob as { id: string })}
                disabled={isSaved}
              >
                {isSaved ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> On your tracker
                  </>
                ) : (
                  "Add to tracker"
                )}
              </Button>
            </Panel>

            <Panel>
              <h3 className="mb-3 flex items-center gap-2 font-semibold">
                <Lightbulb className="h-4 w-4 text-brand-crema" /> Quick wins
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {pack.match.tips.map((t) => (
                  <li key={t} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" /> {t}
                  </li>
                ))}
              </ul>
            </Panel>

            <Panel>
              <h3 className="mb-3 font-semibold">Go deeper</h3>
              <div className="grid gap-2 text-sm">
                {[
                  ["Salary insights", "/ai-tools/salary"],
                  ["Resume match", "/ai-tools/resume-match"],
                  ["Follow-up email", "/ai-tools/email-templates"],
                  ["LinkedIn for this role", "/ai-tools/linkedin"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    href={`${href}?jobId=${id}`}
                    className="flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {label} <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </Panel>

            {history && history.length > 1 && (
              <Panel>
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <History className="h-4 w-4" /> Earlier packs
                </h3>
                <ul className="space-y-2 text-sm">
                  {history.slice(0, 5).map((h) => (
                    <li key={h.id}>
                      <button
                        className={cn(
                          "w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted",
                          pack.id === h.id && "bg-muted"
                        )}
                        onClick={() => {
                          const p = { ...(h.output as PrepPack), id: h.id };
                          setPack(p);
                          setLetter(p.coverLetter?.coverLetter ?? "");
                        }}
                      >
                        {h.createdAt?.toDate?.().toLocaleString() ?? "Just now"} · {(h.output as PrepPack)?.match?.overallScore ?? "–"}%
                      </button>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
