// Portfolio demo build: firebase-admin is replaced by in-memory stand-ins
// (src/lib/demo) seeded with the same sample data as the browser.
import { Firestore } from "@/lib/demo/admin-firestore";
import { demoAccountForToken } from "@/lib/demo/session";
import { demoStore } from "@/lib/demo/db";

const adminDb = new Firestore(demoStore);

const adminAuth = {
  async verifyIdToken(token: string) {
    const account = demoAccountForToken(token);
    if (!account) throw new Error("Invalid demo session token");
    return { uid: account.uid, email: account.email, email_verified: true };
  },
};

export { adminDb, adminAuth };
