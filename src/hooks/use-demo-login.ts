"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { demoCredentials } from "@/lib/demo/seed";

export type DemoRole = "employee" | "employer";

/** One-click guest login into the seeded demo accounts. */
export function useDemoLogin() {
  const router = useRouter();
  const [pending, setPending] = useState<DemoRole | null>(null);
  const [error, setError] = useState("");

  const start = async (role: DemoRole) => {
    setPending(role);
    setError("");
    try {
      const { email, password } = demoCredentials(role);
      await signInWithEmailAndPassword(auth, email, password);
      router.push(role === "employer" ? "/employer/dashboard" : "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the demo.");
      setPending(null);
      throw err;
    }
  };

  return { start, pending, error };
}
