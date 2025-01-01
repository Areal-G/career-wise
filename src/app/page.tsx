"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BellRing,
  Building2,
  Check,
  FileText,
  Kanban,
  Loader2,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TestTube2,
  Timer,
  UserRound,
  WifiOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDemoLogin, type DemoRole } from "@/hooks/use-demo-login";
import { BRAND } from "@/lib/brand";
import { BrandWordmark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Three espresso shades so feature tiles read as a set without being identical.
const BROWN_TILES = ["bg-primary", "bg-brand-caramel", "bg-brand-mocha"];

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

function DemoButtons({ size = "lg", className }: { size?: "lg" | "default"; className?: string }) {
  const { start, pending } = useDemoLogin();
  const { toast } = useToast();
  const go = (role: DemoRole) =>
    start(role).catch((e) => toast({ title: "Demo unavailable", description: e?.message, variant: "destructive" }));
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row", className)}>
      <Button
        size={size}
        className="rounded-full px-6"
        disabled={pending !== null}
        onClick={() => go("employee")}
      >
        {pending === "employee" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRound className="mr-2 h-4 w-4" />}
        Try as a job seeker
      </Button>
      <Button size={size} variant="outline" className="rounded-full px-6" disabled={pending !== null} onClick={() => go("employer")}>
        {pending === "employer" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Building2 className="mr-2 h-4 w-4" />}
        Try as an employer
      </Button>
    </div>
  );
}

/* ---------- Product mock-ups (pure HTML, so they stay crisp and themeable) ---------- */

function PrepPackMock() {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative rounded-[2rem] border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-primary">Prep pack</p>
          <p className="font-semibold">Senior Frontend Engineer</p>
          <p className="text-sm text-muted-foreground">Northwind Labs · Remote</p>
        </div>
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 80 80" className="-rotate-90">
            <circle cx="40" cy="40" r={r} strokeWidth="8" className="fill-none stroke-muted" />
            <circle cx="40" cy="40" r={r} strokeWidth="8" strokeLinecap="round" className="fill-none stroke-brand-sage" strokeDasharray={c} strokeDashoffset={c * 0.14} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">86</span>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {["React", "TypeScript", "Next.js", "Testing"].map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-brand-sage/15 px-2.5 py-1 text-xs font-medium text-brand-sage">
            <Check className="h-3 w-3" />
            {s}
          </span>
        ))}
        <span className="rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground">GraphQL</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[
          [FileText, "Cover letter"],
          [MessageSquareText, "6 questions"],
          [Target, "Skill plan"],
        ].map(([Icon, label]) => {
          const I = Icon as typeof FileText;
          return (
            <div key={label as string} className="flex flex-col items-center gap-1 rounded-2xl bg-muted/60 p-3">
              <I className="h-4 w-4 text-primary" />
              {label as string}
            </div>
          );
        })}
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-full rounded-full bg-muted" />
        <div className="h-2 w-11/12 rounded-full bg-muted" />
        <div className="h-2 w-4/5 rounded-full bg-muted" />
      </div>
    </div>
  );
}

function RankingMock() {
  const rows = [
    ["Daniel Reyes", 92, ["React", "TypeScript", "Next.js"], ["Design systems"]],
    ["Hannah Kim", 81, ["React", "Accessibility"], ["Next.js"]],
    ["Kenji Watanabe", 74, ["TypeScript", "React"], ["Testing"]],
  ] as const;
  return (
    <div className="space-y-2 rounded-[2rem] border bg-card p-5 shadow-xl">
      {rows.map(([name, score, has, gap]) => (
        <div key={name} className="flex items-center gap-3 rounded-2xl border p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {name
              .split(" ")
              .map((p) => p[0])
              .join("")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {name} <span className="ml-1 text-primary">{score}%</span>
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {has.map((s) => (
                <span key={s} className="rounded-full bg-brand-sage/15 px-2 py-0.5 text-[10px] font-medium text-brand-sage">
                  {s}
                </span>
              ))}
              {gap.map((s) => (
                <span key={s} className="rounded-full border border-dashed px-2 py-0.5 text-[10px] text-muted-foreground">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <span className="hidden rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground sm:inline">Invite</span>
        </div>
      ))}
    </div>
  );
}

function PipelineMock() {
  const cols = [
    ["Applied", 4],
    ["Screening", 2],
    ["Interview", 3],
    ["Offer", 1],
  ] as const;
  return (
    <div className="grid grid-cols-4 gap-2 rounded-[2rem] border bg-card p-4 shadow-xl">
      {cols.map(([label, n]) => (
        <div key={label} className="rounded-2xl bg-muted/50 p-2">
          <p className="mb-2 text-[11px] font-medium text-muted-foreground">
            {label} · {n}
          </p>
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="mb-1.5 h-7 rounded-lg border bg-card" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ---------- Page ---------- */

export default function Landing() {
  const { user, role, loading } = useAuth();
  const appHref = role === "employer" ? "/employer/dashboard" : role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="h-screen overflow-y-auto overflow-x-hidden scroll-smooth bg-background text-foreground">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-transparent bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <BrandWordmark className="text-lg" />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#seekers" className="hover:text-foreground">For job seekers</a>
            <a href="#employers" className="hover:text-foreground">For employers</a>
            <a href="#engineering" className="hover:text-foreground">How it&apos;s built</a>
          </nav>
          {!loading && user ? (
            <Button asChild size="sm" className="rounded-full">
              <Link href={appHref}>
                Open app <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="rounded-full">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
                <Link href="/signup">Get started</Link>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-dots [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 md:pt-24 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> AI-assisted hiring, both sides of the table
            </span>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Land the job. <br />
              <span className="italic text-primary">Find the hire.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">{BRAND.tagline} Every match comes with the reasons behind it.</p>
            <DemoButtons className="mt-8" />
            <p className="mt-3 text-sm text-muted-foreground">No sign-up. Opens a guest account with realistic sample data.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 40, rotate: 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative mx-auto w-full max-w-md"
          >
            <PrepPackMock />
            <div className="absolute -bottom-6 -left-6 hidden items-center gap-2 rounded-2xl border bg-card px-4 py-3 text-sm shadow-xl sm:flex">
              <BellRing className="h-4 w-4 text-brand-crema" />
              No reply in 9 days. Time to follow up
            </div>
          </motion.div>
        </div>
      </section>

      {/* Seekers */}
      <section id="seekers" className="border-t bg-secondary/50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fade} className="mb-12 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">For job seekers</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">From &quot;this looks interesting&quot; to a ready application in one click.</h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: Search, title: "Find", body: "Jobs ranked by how well your skills actually overlap. A percentage you can trust, plus the skills behind it." },
              { icon: Sparkles, title: "Prepare", body: "One click builds a prep pack: match breakdown, tailored cover letter, a learning plan for gaps, and likely interview questions." },
              { icon: BellRing, title: "Track", body: "Applications move on their own as employers update them. Anything silent for a week gets a follow-up nudge and a drafted email." },
            ].map((f, i) => (
              <motion.div key={f.title} {...fade} transition={{ duration: 0.5, delay: i * 0.08 }} className="rounded-3xl border bg-card p-6">
                <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-background ${BROWN_TILES[i % 3]}`}>
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
          <motion.p {...fade} className="mt-6 text-sm text-muted-foreground">
            Also included: resume builder, resume ↔ job match, LinkedIn optimiser, salary insights, career-path planner. All of them start pre-filled from your profile, and every result is saved.
          </motion.p>
        </div>
      </section>

      {/* Employers */}
      <section id="employers" className="py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <motion.div {...fade}>
            <p className="mb-2 text-sm font-medium text-primary">For employers</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ranked candidates, with the reasons in plain sight.</h2>
            <ul className="mt-6 space-y-4">
              {[
                [Target, "Explainable ranking", "Every score shows which required skills a candidate covers and which they don't."],
                [Kanban, "Visual pipeline", "Drag candidates from Applied to Offer. They see the update on their tracker instantly."],
                [Timer, "A morning briefing", "New applicants, candidates waiting on a decision, and time-to-hire, all on one screen."],
              ].map(([Icon, title, body], i) => {
                const I = Icon as typeof Target;
                return (
                  <li key={title as string} className="flex gap-4">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-background ${BROWN_TILES[i % 3]}`}>
                      <I className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-medium">{title as string}</p>
                      <p className="text-sm text-muted-foreground">{body as string}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </motion.div>
          <motion.div {...fade} className="space-y-4">
            <RankingMock />
            <PipelineMock />
          </motion.div>
        </div>
      </section>

      {/* Engineering */}
      <section id="engineering" className="border-t bg-secondary/50 py-24">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div {...fade} className="mb-12 max-w-2xl">
            <p className="mb-2 text-sm font-medium text-primary">How it&apos;s built</p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">A production-shaped app, not a mock-up.</h2>
          </motion.div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [ShieldCheck, "Locked-down data", "Firestore security rules stop role escalation, billing tampering and cross-tenant reads. Admin rights are granted server-side only."],
              [WifiOff, "Runs fully offline", "Firebase emulators in Docker and a deterministic offline AI model, so the demo works without any API keys."],
              [Timer, "Shared rate limiting", "AI endpoints are throttled through a Firestore-backed limiter that holds across server instances."],
              [TestTube2, "Typed and tested", "Strict TypeScript at build time and unit tests on the matching, status and scoring logic."],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <motion.div key={title as string} {...fade} className="rounded-3xl border bg-card p-6">
                  <I className="mb-4 h-6 w-6 text-primary" />
                  <p className="font-semibold">{title as string}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body as string}</p>
                </motion.div>
              );
            })}
          </div>
          <motion.div {...fade} className="mt-8 flex flex-wrap gap-2">
            {["Next.js 15", "React 18", "TypeScript", "Firebase Auth", "Firestore", "Genkit", "Gemini", "Tailwind CSS", "shadcn/ui", "Framer Motion", "Vitest", "Docker"].map((t) => (
              <span key={t} className="rounded-full border bg-card px-3 py-1 text-sm text-muted-foreground">
                {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <motion.div {...fade} className="mx-auto max-w-4xl px-4">
          <div className="relative overflow-hidden rounded-[2.5rem] border bg-card px-6 py-14 text-center sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">See it with real-looking data.</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Jump in as Maya, a frontend engineer mid-search, or as the hiring team at Northwind Labs.
            </p>
            <DemoButtons className="mt-8 justify-center" />
          </div>
        </motion.div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <BrandWordmark />
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms</Link>
            <Link href="/login" className="hover:text-foreground">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
