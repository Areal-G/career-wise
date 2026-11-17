import { describe, expect, it } from "vitest";
import { FieldValue, Firestore, Timestamp } from "firebase-admin/firestore";
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { MemoryStore } from "@/lib/demo/store";
import { demoAnchor, demoCredentials, seedDemoData } from "@/lib/demo/seed";
import { DEMO_ACCOUNTS, demoAccountForToken, demoToken } from "@/lib/demo/session";
import { adminAuth } from "@/lib/firebase-admin";

function snapshot(store: MemoryStore) {
  const db = new Firestore(store);
  return Promise.all(
    ["users", "publicProfiles", "opportunities", "applications", "posts", "chats", "notifications"].map(
      async (name) => (await db.collection(name).get()).docs.map((d) => [d.id, d.data()]),
    ),
  );
}

describe("demo seed", () => {
  it("is identical for every instance seeded within the same UTC hour", async () => {
    const hour = Date.UTC(2026, 10, 16, 14);
    const first = new MemoryStore();
    const second = new MemoryStore();
    seedDemoData(first, demoAnchor(hour + 60_000));
    seedDemoData(second, demoAnchor(hour + 59 * 60_000));
    expect(await snapshot(first)).toEqual(await snapshot(second));
  });

  it("anchors timestamps to the start of the UTC hour", async () => {
    const anchor = demoAnchor(Date.UTC(2026, 10, 16, 14, 37, 12));
    expect(anchor).toBe(Date.UTC(2026, 10, 16, 14));
    const store = new MemoryStore();
    seedDemoData(store, anchor);
    const notes = await new Firestore(store).collection("notifications").get();
    for (const n of notes.docs) expect((n.get("createdAt") as Timestamp).toMillis()).toBeLessThanOrEqual(anchor);
  });

  it("is fully seeded as soon as the shared store is imported", async () => {
    // Seeding is synchronous and nothing resets the store, so even requests
    // racing the first import can never observe a partial data set.
    const reads = await Promise.all(
      Array.from({ length: 10 }, async () => {
        const { demoStore } = await import("@/lib/demo/db");
        return (await new Firestore(demoStore).collection("opportunities").get()).size;
      }),
    );
    expect(new Set(reads).size).toBe(1);
    expect(reads[0]).toBeGreaterThan(10);
    const { demoStore } = await import("@/lib/demo/db");
    expect(demoStore.get("users/demo-seeker")?.data.role).toBe("employee");
  });
});

describe("demo admin firestore stand-in", () => {
  it("supports the Admin SDK calls the server routes make", async () => {
    const db = new Firestore(new MemoryStore());
    const ref = await db.collection("users").doc("u1").collection("aiResults").add({
      createdAt: FieldValue.serverTimestamp(),
    });
    expect(ref.path).toBe("users/u1/aiResults/auto-000001");
    expect((await ref.get()).get("createdAt")).toBeInstanceOf(Timestamp);

    await db.collection("users").doc("u1").set({ role: "employee", plan: "free" });
    await db.collection("users").doc("u1").set({ role: "admin" }, { merge: true });
    const employees = await db.collection("users").where("role", "==", "admin").get();
    expect(employees.docs.map((d) => d.data())).toEqual([{ role: "admin", plan: "free" }]);

    const counter = db.collection("monthly").doc("2026-11");
    await Promise.all(
      Array.from({ length: 10 }, () =>
        db.runTransaction(async (tx) => {
          const snap = await tx.get(counter);
          if (!snap.exists) tx.set(counter, { sent: 1 });
          else tx.update(counter, { sent: FieldValue.increment(1) });
        }),
      ),
    );
    expect((await counter.get()).data()).toEqual({ sent: 10 });
  });
});

describe("demo auth", () => {
  it("signs in only the demo accounts and issues tokens the server accepts", async () => {
    const auth = getAuth();
    const { email, password } = demoCredentials("employer");
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    expect(auth.currentUser?.uid).toBe("demo-employer");
    expect(user.displayName).toBe("Northwind Labs");

    const token = await user.getIdToken();
    expect(token).toBe(demoToken("demo-employer"));
    await expect(adminAuth.verifyIdToken(token)).resolves.toMatchObject({ uid: "demo-employer", email });
    await expect(adminAuth.verifyIdToken(demoToken("demo-cand-01"))).rejects.toThrow();
    expect(demoAccountForToken("eyJhbGciOi.forged")).toBeNull();

    await signOut(auth);
    expect(auth.currentUser).toBeNull();
    await expect(signInWithEmailAndPassword(auth, email, "wrong")).rejects.toThrow(/sample accounts/);
    await expect(createUserWithEmailAndPassword(auth, "new@example.com", "secret1")).rejects.toThrow(
      /Sign-up is disabled in the demo/,
    );
    expect(DEMO_ACCOUNTS).toHaveLength(2);
  });
});
