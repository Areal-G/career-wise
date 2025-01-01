"use server";

import { adminAuth, adminDb } from "@/lib/firebase-admin";

function adminEmailList(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Promotes the signed-in user to admin when their verified email is listed in
 * ADMIN_EMAILS. Runs on the server with the Admin SDK, so the client can never
 * grant itself the admin role (Firestore rules block that) and the admin list
 * is never sent to the browser.
 */
export async function syncAdminRole(idToken: string): Promise<boolean> {
  if (!adminAuth || !adminDb || !idToken) return false;
  try {
    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();
    if (!email || !adminEmailList().includes(email)) return false;
    await adminDb.collection("users").doc(decoded.uid).set({ role: "admin" }, { merge: true });
    return true;
  } catch {
    return false;
  }
}
