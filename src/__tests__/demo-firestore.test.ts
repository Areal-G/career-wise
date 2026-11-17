import { describe, expect, it } from "vitest";
import { MemoryStore } from "@/lib/demo/store";
import {
  Firestore,
  Timestamp,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type QuerySnapshot,
} from "@/lib/demo/firestore";

const freshDb = () => new Firestore(new MemoryStore());
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("demo firestore stand-in", () => {
  it("reads back copies, never the stored objects", async () => {
    const db = freshDb();
    const data = { name: "Maya", tags: ["a"] };
    await setDoc(doc(db, "users", "u1"), data);
    data.tags.push("mutated");
    const snap = await getDoc(doc(db, "users", "u1"));
    expect(snap.exists()).toBe(true);
    snap.data()!.tags.push("mutated again");
    expect((await getDoc(doc(db, "users", "u1"))).data()).toEqual({ name: "Maya", tags: ["a"] });
    expect((await getDoc(doc(db, "users", "missing"))).exists()).toBe(false);
  });

  it("merges, updates dotted paths and applies field transforms", async () => {
    const db = freshDb();
    const ref = doc(db, "chats", "c1");
    await setDoc(ref, { count: 1, members: ["a"], hiddenFor: { a: true, b: true }, meta: { x: 1 } });
    await setDoc(ref, { meta: { y: 2 } }, { merge: true });
    await updateDoc(ref, {
      count: increment(2),
      members: arrayUnion("b", "a"),
      "hiddenFor.a": deleteField(),
      updatedAt: serverTimestamp(),
    });
    await updateDoc(ref, { members: arrayRemove("a") });
    const data = (await getDoc(ref)).data()!;
    expect(data).toMatchObject({ count: 3, members: ["b"], hiddenFor: { b: true }, meta: { x: 1, y: 2 } });
    expect(data.updatedAt).toBeInstanceOf(Timestamp);
  });

  it("stores Dates as Timestamps and drops undefined fields", async () => {
    const db = freshDb();
    const ref = await addDoc(collection(db, "posts"), { at: new Date(1_000), skip: undefined });
    const data = (await getDoc(ref)).data()!;
    expect(data.at).toBeInstanceOf(Timestamp);
    expect(data.at.toMillis()).toBe(1_000);
    expect("skip" in data).toBe(false);
  });

  it("gives auto ids deterministically", async () => {
    const a = await addDoc(collection(freshDb(), "x"), {});
    const b = await addDoc(collection(freshDb(), "x"), {});
    expect(a.id).toBe(b.id);
  });

  it("filters, orders and limits queries over direct children only", async () => {
    const db = freshDb();
    await setDoc(doc(db, "apps", "a"), { userId: "u1", status: "Interview", at: Timestamp.fromMillis(3), tags: ["x"] });
    await setDoc(doc(db, "apps", "b"), { userId: "u1", status: "Submitted", at: Timestamp.fromMillis(1) });
    await setDoc(doc(db, "apps", "c"), { userId: "u2", status: "Interview", at: Timestamp.fromMillis(2) });
    await setDoc(doc(db, "apps", "d"), { userId: "u1" });
    await setDoc(doc(db, "apps", "a", "notes", "n1"), { userId: "u1" });

    const ids = async (...c: Parameters<typeof query>[1][]) =>
      (await getDocs(query(collection(db, "apps"), ...c))).docs.map((d) => d.id);

    expect(await ids(where("userId", "==", "u1"), orderBy("at", "desc"))).toEqual(["a", "b"]);
    expect(await ids(where("status", "!=", "Interview"))).toEqual(["b"]);
    expect(await ids(where("userId", "in", ["u2"]))).toEqual(["c"]);
    expect(await ids(where("tags", "array-contains", "x"))).toEqual(["a"]);
    expect(await ids(where("at", ">=", Timestamp.fromMillis(2)))).toEqual(["a", "c"]);
    expect(await ids(orderBy("at"), limit(2))).toEqual(["b", "c"]);
    expect(await ids()).toEqual(["a", "b", "c", "d"]);
  });

  it("commits batches atomically", async () => {
    const db = freshDb();
    await setDoc(doc(db, "n", "1"), { read: false });
    const batch = writeBatch(db);
    batch.update(doc(db, "n", "1"), { read: true });
    batch.update(doc(db, "n", "missing"), { read: true });
    await expect(batch.commit()).rejects.toThrow(/No document to update/);
    expect((await getDoc(doc(db, "n", "1"))).data()).toEqual({ read: false });
  });

  it("serialises concurrent transactions", async () => {
    const db = freshDb();
    const ref = doc(db, "counters", "emails");
    await Promise.all(
      Array.from({ length: 20 }, () =>
        runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          await tick();
          if (!snap.exists()) tx.set(ref, { count: 1 });
          else tx.update(ref, { count: snap.data().count + 1 });
        }),
      ),
    );
    expect((await getDoc(ref)).data()).toEqual({ count: 20 });
  });

  it("streams query snapshots with doc changes", async () => {
    const db = freshDb();
    const seen: Array<Array<[string, string]>> = [];
    const unsubscribe = onSnapshot(
      query(collection(db, "messages"), where("chat", "==", "c1")),
      (snap: QuerySnapshot) => seen.push(snap.docChanges().map((c) => [c.type, c.doc.id])),
    );
    await tick();
    await setDoc(doc(db, "messages", "m1"), { chat: "c1", text: "hi" });
    await tick();
    await setDoc(doc(db, "messages", "other"), { chat: "c2" });
    await tick();
    await updateDoc(doc(db, "messages", "m1"), { text: "hello" });
    await tick();
    await deleteDoc(doc(db, "messages", "m1"));
    await tick();
    unsubscribe();
    await setDoc(doc(db, "messages", "m2"), { chat: "c1" });
    await tick();
    expect(seen).toEqual([[], [["added", "m1"]], [["modified", "m1"]], [["removed", "m1"]]]);
  });

  it("streams document snapshots only when the data changes", async () => {
    const db = freshDb();
    const ref = doc(db, "users", "u1");
    const names: Array<string | undefined> = [];
    const unsubscribe = onSnapshot(ref, (snap) => names.push(snap.data()?.name));
    await tick();
    await setDoc(ref, { name: "A" });
    await tick();
    await setDoc(doc(db, "users", "u2"), { name: "B" });
    await tick();
    unsubscribe();
    expect(names).toEqual([undefined, "A"]);
  });
});
