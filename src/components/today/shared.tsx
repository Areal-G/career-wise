"use client";

import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function greeting(now = new Date()) {
  const h = now.getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "amber" | "emerald" | "sky";
  href?: string;
}) {
  const tones = {
    primary: "bg-brand-caramel/15 text-brand-caramel",
    amber: "bg-brand-crema/15 text-brand-crema",
    emerald: "bg-brand-sage/15 text-brand-sage",
    sky: "bg-brand-mocha/15 text-brand-mocha",
  };
  const cards = {
    primary: "hover:border-brand-caramel/60",
    amber: "hover:border-brand-crema/60",
    emerald: "hover:border-brand-sage/60",
    sky: "hover:border-brand-mocha/60",
  };
  const body = (
    <div className={cn("flex h-full items-start justify-between gap-3 rounded-3xl border bg-card p-5 transition-colors", cards[tone])}>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Section({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  action?: { label: string; href: string };
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-3xl border bg-card p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon className="h-4 w-4 text-primary" /> {title}
        </h2>
        {action && (
          <Link href={action.href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            {action.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">{children}</p>;
}

export function TodaySkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-72 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-3xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
      </div>
    </div>
  );
}
