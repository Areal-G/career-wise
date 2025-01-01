"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Check,
  FileUp,
  Loader2,
  Sparkles,
  UserRound,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toPublicProfile } from "@/lib/public-profile";
import { parseResume } from "@/ai/flows/parse-resume";
import { BRAND } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Role = "employee" | "employer";

const STEPS = ["Who are you?", "The basics", "Finishing touches"];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userProfile, loading } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role | null>(null);
  const [roleLocked, setRoleLocked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [form, setForm] = useState({
    headline: "",
    location: "",
    skills: "",
    companyName: "",
    about: "",
    education: "",
    employmentHistory: "",
    careerGoals: "",
  });

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Prefill from an existing profile (email sign-ups already picked a role).
  useEffect(() => {
    if (!userProfile) return;
    if (userProfile.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (userProfile.role === "employee" || userProfile.role === "employer") {
      setRole(userProfile.role);
      setRoleLocked(true);
      setStep((s) => (s === 0 ? 1 : s));
    }
    setForm((f) => ({
      ...f,
      headline: userProfile.headline || f.headline,
      location: userProfile.location || f.location,
      skills: userProfile.skills || f.skills,
      companyName: userProfile.companyName || f.companyName,
      about: userProfile.about || userProfile.companyOverview || f.about,
    }));
  }, [userProfile, router]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const home = role === "employer" ? "/employer/dashboard" : "/dashboard";

  const handleResume = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const uri = e.target?.result as string;
      if (!uri) return;
      setParsing(true);
      try {
        const parsed = await parseResume({ resumeDataUri: uri });
        setForm((f) => ({
          ...f,
          skills: f.skills || parsed.skills,
          education: parsed.education,
          employmentHistory: parsed.employmentHistory,
          careerGoals: parsed.careerGoals,
        }));
        toast({ title: "Resume imported", description: "We filled in your experience, education and skills." });
      } catch {
        toast({ title: "Couldn't read that file", description: "You can add details later from your profile.", variant: "destructive" });
      } finally {
        setParsing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const finish = async () => {
    if (!user || !role) return;
    setSaving(true);
    try {
      const ref = doc(db, "users", user.uid);
      const existing = await getDoc(ref);
      const name = user.displayName || user.email?.split("@")[0] || "New user";
      const [firstName, ...rest] = name.split(" ");
      const base = existing.exists()
        ? {}
        : { uid: user.uid, email: user.email || "", role, displayName: name, firstName, lastName: rest.join(" ") };

      const details: Record<string, string> =
        role === "employer"
          ? { companyName: form.companyName || name, location: form.location, about: form.about, headline: form.headline }
          : {
              headline: form.headline,
              location: form.location,
              skills: form.skills,
              ...(form.education && { education: form.education }),
              ...(form.employmentHistory && { employmentHistory: form.employmentHistory }),
              ...(form.careerGoals && { careerGoals: form.careerGoals }),
            };

      const data = { ...base, ...details, onboardedAt: new Date().toISOString() };
      await setDoc(ref, data, { merge: true });
      await setDoc(
        doc(db, "publicProfiles", user.uid),
        toPublicProfile({ ...(existing.data() || {}), ...data, uid: user.uid, role }),
        { merge: true }
      );
      router.replace(home);
    } catch (error) {
      console.error(error);
      toast({ title: "Could not save", description: "Please try again.", variant: "destructive" });
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const canNext = step === 0 ? !!role : step === 1 ? (role === "employer" ? !!form.companyName.trim() : !!form.headline.trim()) : true;

  return (
    <div className="relative flex h-screen justify-center overflow-y-auto overflow-x-hidden bg-background px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
      </div>

      <div className="relative my-auto w-full max-w-xl">
        <div className="mb-8 text-center">
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" /> Welcome to {BRAND.name}
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{STEPS[step]}</h1>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] border bg-card/80 p-6 shadow-xl backdrop-blur sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(
                    [
                      { value: "employee", icon: UserRound, title: "I'm looking for work", body: "Find roles, get a prep pack for each one, and track every application." },
                      { value: "employer", icon: Building2, title: "I'm hiring", body: "Post jobs, see ranked candidates with reasons, and run a visual pipeline." },
                    ] as const
                  ).map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      disabled={roleLocked}
                      onClick={() => setRole(o.value)}
                      className={cn(
                        "relative rounded-3xl border p-5 text-left transition-all hover:border-primary/60",
                        role === o.value && "border-primary bg-primary/5 ring-2 ring-primary/30"
                      )}
                    >
                      {role === o.value && (
                        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </span>
                      )}
                      <o.icon className="mb-3 h-7 w-7 text-primary" />
                      <p className="font-semibold">{o.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{o.body}</p>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && role === "employee" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="headline">Headline</Label>
                    <Input id="headline" placeholder="Frontend Engineer · React & TypeScript" value={form.headline} onChange={set("headline")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Lagos, Nigeria · open to remote" value={form.location} onChange={set("location")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills">Top skills</Label>
                    <Input id="skills" placeholder="React, TypeScript, Node.js, SQL" value={form.skills} onChange={set("skills")} />
                    <p className="text-xs text-muted-foreground">Comma separated. These power your match scores.</p>
                  </div>
                </div>
              )}

              {step === 1 && role === "employer" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company name</Label>
                    <Input id="company" placeholder="Northwind Labs" value={form.companyName} onChange={set("companyName")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headline">One-liner</Label>
                    <Input id="headline" placeholder="Developer tools for data teams" value={form.headline} onChange={set("headline")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Remote · HQ in Berlin" value={form.location} onChange={set("location")} />
                  </div>
                </div>
              )}

              {step === 2 && role === "employee" && (
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={parsing}
                    className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary/60 hover:bg-primary/5"
                  >
                    {parsing ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <FileUp className="h-8 w-8 text-primary" />}
                    <span className="font-medium">{parsing ? "Reading your resume…" : "Import from your resume"}</span>
                    <span className="text-sm text-muted-foreground">PDF or DOCX. We fill in experience, education and skills.</span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleResume(e.target.files[0])}
                  />
                  {form.employmentHistory && (
                    <div className="rounded-2xl bg-muted/50 p-4 text-sm">
                      <p className="mb-1 flex items-center gap-2 font-medium">
                        <Check className="h-4 w-4 text-brand-sage" /> Imported
                      </p>
                      <p className="line-clamp-3 text-muted-foreground">{form.employmentHistory}</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="goals">What are you aiming for next? (optional)</Label>
                    <Textarea id="goals" rows={3} placeholder="Senior frontend role at a product-led startup" value={form.careerGoals} onChange={set("careerGoals")} />
                  </div>
                </div>
              )}

              {step === 2 && role === "employer" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="about">About the company (optional)</Label>
                    <Textarea id="about" rows={4} placeholder="What you build, team size, how you work." value={form.about} onChange={set("about")} />
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl bg-muted/50 p-4 text-sm">
                    <Briefcase className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p className="text-muted-foreground">
                      Next up: post your first role. Candidates are ranked for it automatically, with the skills behind every score.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0 || (step === 1 && roleLocked) || saving}
              className="rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="rounded-full px-6">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} disabled={saving || parsing} className="rounded-full px-6">
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                {role === "employer" ? "Open my dashboard" : "Show me my matches"}
              </Button>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => (role ? finish() : router.replace("/dashboard"))}
          className="mx-auto mt-4 block text-sm text-muted-foreground hover:text-foreground"
          disabled={saving || !role}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
