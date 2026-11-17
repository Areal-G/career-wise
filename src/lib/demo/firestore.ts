/**
 * Stand-in for "firebase/firestore" in the demo build (wired up through the
 * module aliases in next.config.ts, tsconfig.json and vitest.config.ts).
 * Implements exactly the client SDK calls the app makes, on top of the
 * in-memory store.
 */
import {
  FieldTransform,
  MemoryStore,
  Timestamp,
  collectionOf,
  idOf,
  type DocumentData,
  type QuerySpec,
  type StoredDoc,
  type WhereOp,
  type Write,
} from "./store";

export { Timestamp, type DocumentData };
export type Unsubscribe = () => void;

/** The `db` handle: one per in-memory store. */
export class Firestore {
  readonly type = "firestore";
  constructor(readonly store: MemoryStore) {}
}

export class DocumentReference {
  readonly type = "document";
  constructor(
    readonly firestore: Firestore,
    readonly path: string,
  ) {}
  get id() {
    return idOf(this.path);
  }
  get parent() {
    return new CollectionReference(this.firestore, collectionOf(this.path));
  }
}

export class Query {
  constructor(
    readonly firestore: Firestore,
    readonly spec: QuerySpec,
  ) {}
}

export class CollectionReference extends Query {
  readonly type = "collection";
  constructor(firestore: Firestore, readonly path: string) {
    super(firestore, { collection: path, filters: [], orders: [] });
  }
  get id() {
    return idOf(this.path);
  }
}

export interface QueryConstraint {
  apply(spec: QuerySpec): QuerySpec;
}

export class DocumentSnapshot {
  constructor(
    readonly ref: DocumentReference,
    private readonly stored: StoredDoc | null,
  ) {}
  get id() {
    return this.ref.id;
  }
  exists(): this is QueryDocumentSnapshot {
    return this.stored !== null;
  }
  data(): DocumentData | undefined {
    return this.stored?.data;
  }
  get(field: string): unknown {
    return field.split(".").reduce<unknown>((v, k) => (v as DocumentData | undefined)?.[k], this.stored?.data);
  }
}

export class QueryDocumentSnapshot extends DocumentSnapshot {
  data(): DocumentData {
    return super.data()!;
  }
}

export interface DocumentChange {
  type: "added" | "modified" | "removed";
  doc: QueryDocumentSnapshot;
}

export class QuerySnapshot {
  constructor(
    readonly docs: QueryDocumentSnapshot[],
    private readonly changes: DocumentChange[],
  ) {}
  get size() {
    return this.docs.length;
  }
  get empty() {
    return this.docs.length === 0;
  }
  forEach(cb: (doc: QueryDocumentSnapshot) => void) {
    this.docs.forEach(cb);
  }
  docChanges() {
    return this.changes;
  }
}

type Parent = Firestore | CollectionReference | DocumentReference;

function childPath(parent: Parent, segments: string[]) {
  const base = parent instanceof Firestore ? [] : [parent.path];
  return [...base, ...segments].join("/");
}

export function collection(parent: Parent, ...segments: string[]) {
  const db = parent instanceof Firestore ? parent : parent.firestore;
  return new CollectionReference(db, childPath(parent, segments));
}

export function doc(parent: Parent, ...segments: string[]) {
  const db = parent instanceof Firestore ? parent : parent.firestore;
  if (parent instanceof CollectionReference && segments.length === 0) {
    return new DocumentReference(db, `${parent.path}/${db.store.newId()}`);
  }
  return new DocumentReference(db, childPath(parent, segments));
}

export function where(field: string, op: WhereOp, value: unknown): QueryConstraint {
  return { apply: (spec) => ({ ...spec, filters: [...spec.filters, { field, op, value }] }) };
}

export function orderBy(field: string, direction: "asc" | "desc" = "asc"): QueryConstraint {
  return { apply: (spec) => ({ ...spec, orders: [...spec.orders, { field, direction }] }) };
}

export function limit(n: number): QueryConstraint {
  return { apply: (spec) => ({ ...spec, limit: n }) };
}

export function query(base: Query, ...constraints: QueryConstraint[]) {
  return new Query(
    base.firestore,
    constraints.reduce((spec, c) => c.apply(spec), base.spec),
  );
}

function snapshotOf(ref: DocumentReference) {
  return new DocumentSnapshot(ref, ref.firestore.store.get(ref.path));
}

function rowsOf(q: Query) {
  return q.firestore.store
    .query(q.spec)
    .map((row) => new QueryDocumentSnapshot(new DocumentReference(q.firestore, row.path), row));
}

export async function getDoc(ref: DocumentReference) {
  return snapshotOf(ref);
}

export async function getDocs(q: Query) {
  const docs = rowsOf(q);
  return new QuerySnapshot(
    docs,
    docs.map((d) => ({ type: "added" as const, doc: d })),
  );
}

export async function setDoc(ref: DocumentReference, data: DocumentData, options?: { merge?: boolean }) {
  ref.firestore.store.commit([{ type: "set", path: ref.path, data, merge: options?.merge }]);
}

export async function updateDoc(ref: DocumentReference, data: DocumentData) {
  ref.firestore.store.commit([{ type: "update", path: ref.path, data }]);
}

export async function addDoc(ref: CollectionReference, data: DocumentData) {
  const created = doc(ref);
  await setDoc(created, data);
  return created;
}

export async function deleteDoc(ref: DocumentReference) {
  ref.firestore.store.commit([{ type: "delete", path: ref.path }]);
}

export const serverTimestamp = FieldTransform.serverTimestamp;
export const increment = FieldTransform.increment;
export const arrayUnion = FieldTransform.arrayUnion;
export const arrayRemove = FieldTransform.arrayRemove;
export const deleteField = FieldTransform.delete;

export function writeBatch(db: Firestore) {
  const writes: Write[] = [];
  const batch = {
    set(ref: DocumentReference, data: DocumentData, options?: { merge?: boolean }) {
      writes.push({ type: "set", path: ref.path, data, merge: options?.merge });
      return batch;
    },
    update(ref: DocumentReference, data: DocumentData) {
      writes.push({ type: "update", path: ref.path, data });
      return batch;
    },
    delete(ref: DocumentReference) {
      writes.push({ type: "delete", path: ref.path });
      return batch;
    },
    async commit() {
      db.store.commit(writes);
    },
  };
  return batch;
}

export async function runTransaction<T>(
  db: Firestore,
  update: (tx: {
    get(ref: DocumentReference): Promise<DocumentSnapshot>;
    set(ref: DocumentReference, data: DocumentData, options?: { merge?: boolean }): void;
    update(ref: DocumentReference, data: DocumentData): void;
    delete(ref: DocumentReference): void;
  }) => Promise<T>,
): Promise<T> {
  // Transactions run one at a time, so reads stay valid until the writes land.
  return db.store.exclusive(async () => {
    const batch = writeBatch(db);
    const result = await update({
      get: async (ref) => snapshotOf(ref),
      set: (ref, data, options) => void batch.set(ref, data, options),
      update: (ref, data) => void batch.update(ref, data),
      delete: (ref) => void batch.delete(ref),
    });
    await batch.commit();
    return result;
  });
}

export function onSnapshot(
  target: DocumentReference,
  onNext: (snap: DocumentSnapshot) => void,
  onError?: (error: Error) => void,
): Unsubscribe;
export function onSnapshot(
  target: Query,
  onNext: (snap: QuerySnapshot) => void,
  onError?: (error: Error) => void,
): Unsubscribe;
export function onSnapshot(
  target: DocumentReference | Query,
  onNext: ((snap: DocumentSnapshot) => void) | ((snap: QuerySnapshot) => void),
  onError?: (error: Error) => void,
): Unsubscribe {
  const { store } = target.firestore;
  // Serialised data of the last emitted result, keyed by path in result order.
  let last: Map<string, { key: string; doc: QueryDocumentSnapshot }> | null = null;
  let lastDocKey: string | undefined;
  let active = true;

  const emit = () => {
    if (!active) return;
    try {
      if (target instanceof DocumentReference) {
        const snap = snapshotOf(target);
        const key = JSON.stringify(snap.data() ?? null);
        if (key === lastDocKey) return;
        lastDocKey = key;
        (onNext as (s: DocumentSnapshot) => void)(snap);
        return;
      }
      const docs = rowsOf(target);
      const next = new Map(docs.map((d) => [d.ref.path, { key: JSON.stringify(d.data()), doc: d }]));
      const previous = last ?? new Map();
      const changes: DocumentChange[] = [];
      for (const [path, { key, doc: d }] of next) {
        const before = previous.get(path);
        if (!before) changes.push({ type: "added", doc: d });
        else if (before.key !== key) changes.push({ type: "modified", doc: d });
      }
      for (const [path, { doc: d }] of previous) if (!next.has(path)) changes.push({ type: "removed", doc: d });
      const reordered = [...next.keys()].join() !== [...previous.keys()].join();
      if (last && !changes.length && !reordered) return;
      last = next;
      (onNext as (s: QuerySnapshot) => void)(new QuerySnapshot(docs, changes));
    } catch (error) {
      onError?.(error as Error);
    }
  };

  // Like the SDK, the first snapshot arrives asynchronously.
  queueMicrotask(emit);
  const unsubscribe = store.subscribe(emit);
  return () => {
    active = false;
    unsubscribe();
  };
}
