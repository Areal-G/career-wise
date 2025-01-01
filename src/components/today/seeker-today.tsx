"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { BellRing, Briefcase, CalendarClock, MailPlus, MessageSquareText, Sparkles, Target } from "lucide-react";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useSavedOpportunities } from "@/context/SavedOpportunitiesContext";
import { daysSince, needsFollowUp, normalizeStatus, statusLabel } from "@/lib/application-status";
import { skillOverlap } from "@/lib/career";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyLine, Section, StatTile, TodaySkeleton, greeting } from "./shared";

interface Opp {
  id: string;
  title: string;
  employerName: string;
  location?: string;
  skills?: string;
  status?: string;
}
interface App {
  id: string;
  opportunityId: string;
  status: string;
  submittedAt?: unknown;
  updatedAt?: unknown;
}

export function SeekerToday() {
  const { user, userProfile } = useAuth();
  const { saved } = useSavedOpportunities();
  const [apps, setApps] = useState<App[] | null>(null);
  const [opps, setOpps] = useState<Opp[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [appSnap, oppSnap] = await Promise.all([
        getDocs(query(collection(db, "applications"), where("userId", "==", user.uid))),
        getDocs(query(collection(db, "opportunities"), orderBy("createdAt", "desc"), limit(60))),
      ]);
      setApps(appSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<App, "id">) })));
      setOpps(oppSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Opp, "id">) })));
    })().catch((e) => {
      console.error("Today view failed to load", e);
      setApps([]);
    });
  }, [user]);

  const view = useMemo(() => {
    const byId = new Map(opps.map((o) => [o.id, o]));
    const list = (apps ?? []).map((a) => ({ ...a, opp: byId.get(a.opportunityId), stage: normalizeStatus(a.status) }));
    const active = list.filter((a) => ["Submitted", "Screening", "Interview", "Offer"].includes(a.stage));
    const interviews = list.filter((a) => a.stage === "Interview" || a.stage === "Offer");
    const followUps = list.filter((a) => needsFollowUp(a.status, a.updatedAt ?? a.submittedAt));
    const applied = new Set(list.map((a) => a.opportunityId));
    const matches = opps
      .filter((o) => !applied.has(o.id) && (o.status ?? "Active") === "Active")
      .map((o) => ({ ...o, fit: skillOverlap(userProfile?.skills, o.skills) }))
      .filter((o) => o.fit.matched.length > 0)
      .sort((a, b) => b.fit.pct - a.fit.pct)
      .slice(0, 4);
    return { active, interviews, followUps, matches };
  }, [apps, opps, userProfile?.skills]);

  if (!apps) return <TodaySkeleton />;

  const first = (userProfile?.firstName || userProfile?.displayName || "").split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}
          {first && (
            <>
              ,{" "}
              <span className="italic text-primary">{first}</span>
            </>
          )}{" "}
          👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          {view.followUps.length + view.interviews.length > 0
            ? `You have ${view.interviews.length} interview${view.interviews.length === 1 ? "" : "s"} in progress and ${view.followUps.length} application${view.followUps.length === 1 ? "" : "s"} worth a follow-up.`
            : "Here's what's new for you today."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active applications" value={view.active.length} icon={Briefcase} href="/applications" />
        <StatTile label="Interviews & offers" value={view.interviews.length} icon={CalendarClock} tone="emerald" href="/applications" />
        <StatTile label="Need a follow-up" value={view.followUps.length} icon={BellRing} tone="amber" hint="No reply in 7+ days" href="/applications" />
        <StatTile label="Saved jobs" value={saved.length} icon={Target} tone="sky" href="/saved" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5 [&>*]:min-w-0">
        <Section title="New matches for you" icon={Sparkles} action={{ label: "Browse all", href: "/opportunities" }} className="lg:col-span-3">
          {view.matches.length === 0 ? (
            <EmptyLine>Add skills to your profile to see matched roles here.</EmptyLine>
          ) : (
            <ul className="space-y-2">
              {view.matches.map((o) => (
                <li key={o.id} className="flex items-center gap-3 rounded-2xl border p-3 transition-colors hover:border-primary/40">
                  <div
                    className={cn(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums",
                      o.fit.pct >= 75
                        ? "bg-brand-sage/15 text-brand-sage"
                        : o.fit.pct >= 50
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {o.fit.pct}%
                  </div>
                  <Link href={`/opportunities/${o.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium">{o.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {o.employerName}
                      {o.location ? ` · ${o.location}` : ""} · {o.fit.matched.slice(0, 3).join(", ")}
                    </p>
                  </Link>
                  <Button asChild size="sm" variant="outline" className="shrink-0 rounded-full border-primary/40 text-primary hover:bg-accent hover:text-accent-foreground">
                    <Link href={`/opportunities/${o.id}/prepare`}>
                      <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Prepare
                    </Link>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="space-y-6 lg:col-span-2">
          <Section title="Follow up" icon={BellRing}>
            {view.followUps.length === 0 ? (
              <EmptyLine>Nothing waiting on you. Nice.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.followUps.map((a) => (
                  <li key={a.id} className="rounded-2xl border border-brand-crema/30 bg-brand-crema/5 p-3">
                    <p className="truncate font-medium">{a.opp?.title ?? "Application"}</p>
                    <p className="text-sm text-muted-foreground">
                      {a.opp?.employerName} · {statusLabel(a.status)} for {daysSince(a.updatedAt ?? a.submittedAt)} days
                    </p>
                    <Button asChild size="sm" variant="ghost" className="-ml-2 mt-1 h-8 rounded-full text-brand-crema hover:text-brand-crema">
                      <Link href={`/ai-tools/email-templates?jobId=${a.opportunityId}&type=follow-up`}>
                        <MailPlus className="mr-1.5 h-3.5 w-3.5" /> Draft a follow-up email
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Interviews" icon={CalendarClock}>
            {view.interviews.length === 0 ? (
              <EmptyLine>No interviews yet. Prep packs help you get there.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.interviews.map((a) => (
                  <li key={a.id} className="flex items-center gap-3 rounded-2xl border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{a.opp?.title ?? "Application"}</p>
                      <p className="truncate text-sm text-muted-foreground">{a.opp?.employerName}</p>
                    </div>
                    <Badge variant={a.stage === "Offer" ? "default" : "secondary"}>{statusLabel(a.status)}</Badge>
                    <Button asChild size="icon" variant="ghost" className="h-8 w-8 rounded-full" title="Practise interview">
                      <Link href={`/ai-tools/interview-prep?jobId=${a.opportunityId}`}>
                        <MessageSquareText className="h-4 w-4" />
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}
