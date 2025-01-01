"use server";

import { demoCredentials, ensureDemoData, isDemoAvailable } from "./seed";

/**
 * Prepares the guest demo: seeds sample data on first use and returns the
 * shared demo account's credentials. Disabled unless DEMO_MODE is on (it is
 * on automatically when running against the Firebase emulator).
 */
export async function startDemoSession(role: "employee" | "employer") {
  const enabled =
    process.env.DEMO_MODE === "true" ||
    (process.env.DEMO_MODE !== "false" && Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST));
  if (!enabled || !isDemoAvailable()) {
    return { ok: false as const, error: "The demo is not available in this environment." };
  }
  try {
    await ensureDemoData();
    return { ok: true as const, ...demoCredentials(role === "employer" ? "employer" : "employee") };
  } catch (error) {
    console.error("Demo seed failed:", error);
    return { ok: false as const, error: "Could not prepare the demo. Please try again." };
  }
}
