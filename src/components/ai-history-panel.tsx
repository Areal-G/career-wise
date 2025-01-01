"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { History, Trash2, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AI_TOOLS, deleteAiResult, subscribeAiResults, type AiResultRecord } from "@/lib/ai-history";
import { Button } from "@/components/ui/button";

function hrefFor(item: AiResultRecord) {
  if (item.tool === "prepare" && item.jobId) return `/opportunities/${item.jobId}/prepare`;
  const base = AI_TOOLS[item.tool]?.href ?? "/ai-tools";
  return item.jobId ? `${base}?jobId=${item.jobId}` : base;
}

/** "Recent AI results": every generation is saved, so nothing is lost on refresh. */
export function AiHistoryPanel({ limit = 6 }: { limit?: number }) {
  const { user } = useAuth();
  const [items, setItems] = useState<AiResultRecord[] | null>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeAiResults(user.uid, { limit }, setItems);
  }, [user, limit]);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-10 rounded-3xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-semibold">
          <History className="h-4 w-4 text-primary" /> Recent AI results
        </h2>
        <span className="text-xs text-muted-foreground">Saved automatically</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const when = item.createdAt?.toDate?.();
          return (
            <div key={item.id} className="group flex items-start gap-3 rounded-2xl border p-3 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <Link href={hrefFor(item)} className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  {AI_TOOLS[item.tool]?.name ?? item.tool}
                </p>
                <p className="mt-0.5 truncate text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {when ? formatDistanceToNow(when, { addSuffix: true }) : "just now"}
                </p>
              </Link>
              <div className="flex flex-col items-center gap-1">
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Delete result"
                  onClick={() => user && deleteAiResult(user.uid, item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
