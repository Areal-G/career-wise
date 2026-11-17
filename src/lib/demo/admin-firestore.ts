/**
 * Stand-in for "firebase-admin/firestore" in the demo build: the Admin SDK
 * calls the server code makes, on top of the in-memory store.
 */
import {
  FieldTransform,
  MemoryStore,
  Timestamp,
  getField,
  idOf,
  type DocumentData,
  type QuerySpec,
  type StoredDoc,
  type WhereOp,
  type Write,
} from "./store";

export { Timestamp };

export const FieldValue = {
  serverTimestamp: FieldTransform.serverTimestamp,
  increment: FieldTransform.increment,
  arrayUnion: FieldTransform.arrayUnion,
  arrayRemove: FieldTransform.arrayRemove,
  delete: FieldTransform.delete,
};

export class DocumentSnapshot {
  constructor(
    readonly ref: DocumentReference,
    private readonly stored: StoredDoc | null,
  ) {}
  get id() {
    return this.ref.id;
  }
  get exists() {
    return this.stored !== null;
  }
  data(): DocumentData | undefined {
    return this.stored?.data;
  }
  get(field: string): unknown {
    return this.stored ? getField(this.stored.data, field) : undefined;
  }
}

export class QueryDocumentSnapshot extends DocumentSnapshot {
  data(): DocumentData {
    return super.data()!;
  }
}

export class QuerySnapshot {
  constructor(readonly docs: QueryDocumentSnapshot[]) {}
  get size() {
    return this.docs.length;
  }
  get empty() {
    return this.docs.length === 0;
  }
  forEach(cb: (doc: QueryDocumentSnapshot) => void) {
    this.docs.forEach(cb);
  }
}

export class DocumentReference {
  constructor(
    private readonly store: MemoryStore,
    readonly path: string,
  ) {}
  get id() {
    return idOf(this.path);
  }
  collection(name: string) {
    return new CollectionReference(this.store, `${this.path}/${name}`);
  }
  async get() {
    return new DocumentSnapshot(this, this.store.get(this.path));
  }
  async set(data: DocumentData, options?: { merge?: boolean }) {
    this.store.commit([{ type: "set", path: this.path, data, merge: options?.merge }]);
  }
  async update(data: DocumentData) {
    this.store.commit([{ type: "update", path: this.path, data }]);
  }
  async delete() {
    this.store.commit([{ type: "delete", path: this.path }]);
  }
}

export class Query {
  constructor(
    protected readonly store: MemoryStore,
    readonly spec: QuerySpec,
  ) {}
  where(field: string, op: WhereOp, value: unknown) {
    return new Query(this.store, { ...this.spec, filters: [...this.spec.filters, { field, op, value }] });
  }
  orderBy(field: string, direction: "asc" | "desc" = "asc") {
    return new Query(this.store, { ...this.spec, orders: [...this.spec.orders, { field, direction }] });
  }
  limit(n: number) {
    return new Query(this.store, { ...this.spec, limit: n });
  }
  async get() {
    return new QuerySnapshot(
      this.store
        .query(this.spec)
        .map((row) => new QueryDocumentSnapshot(new DocumentReference(this.store, row.path), row)),
    );
  }
}

export class CollectionReference extends Query {
  constructor(
    store: MemoryStore,
    readonly path: string,
  ) {
    super(store, { collection: path, filters: [], orders: [] });
  }
  get id() {
    return idOf(this.path);
  }
  doc(id: string = this.store.newId()) {
    return new DocumentReference(this.store, `${this.path}/${id}`);
  }
  async add(data: DocumentData) {
    const ref = this.doc();
    await ref.set(data);
    return ref;
  }
}

export class Transaction {
  readonly writes: Write[] = [];
  async get(ref: DocumentReference) {
    return ref.get();
  }
  set(ref: DocumentReference, data: DocumentData, options?: { merge?: boolean }) {
    this.writes.push({ type: "set", path: ref.path, data, merge: options?.merge });
    return this;
  }
  update(ref: DocumentReference, data: DocumentData) {
    this.writes.push({ type: "update", path: ref.path, data });
    return this;
  }
  delete(ref: DocumentReference) {
    this.writes.push({ type: "delete", path: ref.path });
    return this;
  }
}

export class Firestore {
  constructor(private readonly store: MemoryStore) {}
  collection(path: string) {
    return new CollectionReference(this.store, path);
  }
  doc(path: string) {
    return new DocumentReference(this.store, path);
  }
  /** Transactions run one at a time, so reads stay valid until the writes land. */
  runTransaction<T>(update: (tx: Transaction) => Promise<T>): Promise<T> {
    return this.store.exclusive(async () => {
      const tx = new Transaction();
      const result = await update(tx);
      this.store.commit(tx.writes);
      return result;
    });
  }
}
