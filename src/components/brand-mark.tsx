import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/** Local logo mark (no external image host). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("h-6 w-6 shrink-0", className)}>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path d="M16 6.5 19.2 16 16 25.5 12.8 16Z" className="fill-primary-foreground" opacity=".95" />
      <path d="M6.5 16 16 12.8 25.5 16 16 19.2Z" className="fill-primary-foreground" opacity=".45" />
      <circle cx="16" cy="16" r="2.2" className="fill-primary" />
    </svg>
  );
}

export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <BrandMark />
      {BRAND.name}
    </span>
  );
}
