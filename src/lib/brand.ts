/**
 * Single source of truth for product naming and optional features.
 * Renaming the product = edit BRAND here.
 */
export const BRAND = {
  name: "Career Wise",
  /** Placeholder contact address; set your own before deploying. */
  supportEmail: "support@example.com",
  tagline: "From job post to offer, with an AI coach at every step.",
  description:
    "A two-sided hiring platform: job seekers get tailored prep packs, a tracker that nudges follow-ups and AI career tools; employers get explainable candidate ranking and a visual pipeline.",
} as const;

/** Features kept in the codebase but switched off for the focused product. */
export const FEATURES = {
  videoCalls: false,
} as const;
