"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Briefcase, Hourglass, Plus, Timer, UserPlus, Users, Kanban, UserSearch } from "lucide-react";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { daysSince, needsFollowUp, normalizeStatus, statusLabel } from "@/lib/application-status";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyLine, Section, StatTile, TodaySkeleton, greeting } from "./shared";

interface Opp {
  id: string;
  title: string;
  status?: string;
}
interface App {
  id: string;
  opportunityId: string;
  userName: string;
  photoURL?: string;
  status: string;
  submittedAt?: unknown;
  updatedAt?: unknown;
}

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function EmployerToday() {
  const { user, userProfile } = useAuth();
  const [opps, setOpps] = useState<Opp[] | null>(null);
  const [apps, setApps] = useState<App[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const oppSnap = await getDocs(query(collection(db, "opportunities"), where("employerId", "==", user.uid)));
      const list = oppSnap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Opp, "id">) }));
      const ids = list.map((o) => o.id);
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += 30) chunks.push(ids.slice(i, i + 30));
      const snaps = await Promise.all(
        chunks.map((c) => getDocs(query(collection(db, "applications"), where("opportunityId", "in", c))))
      );
      setApps(snaps.flatMap((s) => s.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<App, "id">) }))));
      setOpps(list);
    })().catch((e) => {
      console.error("Today view failed to load", e);
      setOpps([]);
    });
  }, [user]);

  const view = useMemo(() => {
    const titles = new Map((opps ?? []).map((o) => [o.id, o.title]));
    const list = apps.map((a) => ({ ...a, job: titles.get(a.opportunityId) ?? "Role", stage: normalizeStatus(a.status) }));
    const fresh = list
      .filter((a) => a.stage === "Submitted" && (daysSince(a.submittedAt) ?? 99) <= 7)
      .sort((a, b) => (daysSince(a.submittedAt) ?? 0) - (daysSince(b.submittedAt) ?? 0));
    const stalled = list.filter((a) => needsFollowUp(a.status, a.updatedAt ?? a.submittedAt));
    const interviewing = list.filter((a) => a.stage === "Interview" || a.stage === "Offer");
    const hired = list.filter((a) => a.stage === "Hired");
    const hireDays = hired
      .map((a) => {
        const start = daysSince(a.submittedAt);
        const end = daysSince(a.updatedAt);
        return start !== null && end !== null ? Math.max(1, start - end) : null;
      })
      .filter((d): d is number => d !== null);
    const timeToHire = hireDays.length ? Math.round(hireDays.reduce((s, d) => s + d, 0) / hireDays.length) : null;
    const open = (opps ?? []).filter((o) => (o.status ?? "Active") === "Active");
    const perRole = open.map((o) => {
      const mine = list.filter((a) => a.opportunityId === o.id);
      return { ...o, total: mine.length, waiting: mine.filter((a) => a.stage === "Submitted").length };
    });
    return { fresh, stalled, interviewing, timeToHire, open, perRole };
  }, [opps, apps]);

  if (!opps) return <TodaySkeleton />;

  const name = userProfile?.companyName || userProfile?.displayName || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}
            {name && (
              <>
                ,{" "}
                <span className="italic text-primary">{name}</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {view.fresh.length} new applicant{view.fresh.length === 1 ? "" : "s"} this week · {view.stalled.length} waiting on a decision
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/employer/postings/new">
            <Plus className="mr-2 h-4 w-4" /> Post a job
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Open roles" value={view.open.length} icon={Briefcase} href="/employer/postings" />
        <StatTile label="New this week" value={view.fresh.length} icon={UserPlus} tone="sky" />
        <StatTile label="Waiting on you" value={view.stalled.length} icon={Hourglass} tone="amber" hint="No movement in 7+ days" />
        <StatTile
          label="Avg. time to hire"
          value={view.timeToHire !== null ? `${view.timeToHire}d` : "—"}
          icon={Timer}
          tone="emerald"
          hint={`${view.interviewing.length} in interview or offer`}
          href="/employer/analytics"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5 [&>*]:min-w-0">
        <Section title="Your roles" icon={Briefcase} action={{ label: "All postings", href: "/employer/postings" }} className="lg:col-span-3">
          {view.perRole.length === 0 ? (
            <EmptyLine>Post your first role to start receiving ranked candidates.</EmptyLine>
          ) : (
            <ul className="space-y-2">
              {view.perRole.map((r) => (
                <li key={r.id} className="flex items-center gap-3 rounded-2xl border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-medium sm:truncate">{r.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.total} applicant{r.total === 1 ? "" : "s"}
                      {r.waiting ? ` · ${r.waiting} unreviewed` : ""}
                    </p>
                  </div>
                  {/* Icon-only on phones so the role title keeps the room. */}
                  <div className="flex shrink-0 gap-1 sm:gap-2">
                    <Button asChild size="sm" variant="outline" className="rounded-full">
                      <Link href={`/employer/postings/${r.id}/applicants`} aria-label="Ranked applicants">
                        <UserSearch className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Ranked</span>
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="rounded-full">
                      <Link href={`/employer/postings/${r.id}/pipeline`} aria-label="Pipeline">
                        <Kanban className="h-3.5 w-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Pipeline</span>
                      </Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <div className="space-y-6 lg:col-span-2">
          <Section title="New applicants" icon={Users}>
            {view.fresh.length === 0 ? (
              <EmptyLine>No new applicants this week.</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.fresh.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/employer/postings/${a.opportunityId}/pipeline`}
                      className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-muted"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={a.photoURL} alt={a.userName} />
                        <AvatarFallback>{initials(a.userName)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.userName}</p>
                        <p className="truncate text-xs text-muted-foreground">{a.job}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{daysSince(a.submittedAt) || "<1"}d</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="Waiting on a decision" icon={Hourglass}>
            {view.stalled.length === 0 ? (
              <EmptyLine>Every candidate has heard back. 🎉</EmptyLine>
            ) : (
              <ul className="space-y-2">
                {view.stalled.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/employer/postings/${a.opportunityId}/pipeline`}
                      className="flex items-center gap-3 rounded-2xl border border-brand-crema/30 bg-brand-crema/5 p-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.userName}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.job} · {daysSince(a.updatedAt ?? a.submittedAt)} days
                        </p>
                      </div>
                      <Badge variant="secondary">{statusLabel(a.status)}</Badge>
                    </Link>
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
