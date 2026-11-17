/**
 * In-memory document store behind the demo build's Firebase stand-ins
 * (./firestore.ts for the client SDK, ./admin-firestore.ts for firebase-admin).
 *
 * It covers what the app uses: documents addressed by slash paths, merge and
 * dotted-path updates, field transforms (server timestamp, increment, array
 * union/remove, delete), simple queries and change listeners. Values are
 * deep-copied in and out, so callers can never mutate stored data.
 */

export type DocumentData = { [field: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

export class Timestamp {
  constructor(
    readonly seconds: number,
    readonly nanoseconds: number,
  ) {}

  static fromMillis(ms: number) {
    const seconds = Math.floor(ms / 1000);
    return new Timestamp(seconds, Math.round((ms - seconds * 1000) * 1e6));
  }

  static fromDate(date: Date) {
    return Timestamp.fromMillis(date.getTime());
  }

  static now() {
    return Timestamp.fromMillis(Date.now());
  }

  toMillis() {
    return this.seconds * 1000 + this.nanoseconds / 1e6;
  }

  toDate() {
    return new Date(this.toMillis());
  }

  isEqual(other: Timestamp) {
    return other instanceof Timestamp && other.toMillis() === this.toMillis();
  }

  valueOf() {
    return String(this.toMillis()).padStart(20, "0");
  }
}

/** Sentinel values that are resolved against the stored document on write. */
export class FieldTransform {
  private constructor(
    readonly kind: "serverTimestamp" | "increment" | "arrayUnion" | "arrayRemove" | "delete",
    readonly operand?: unknown,
  ) {}

  static serverTimestamp() {
    return new FieldTransform("serverTimestamp");
  }
  static increment(n: number) {
    return new FieldTransform("increment", n);
  }
  static arrayUnion(...items: unknown[]) {
    return new FieldTransform("arrayUnion", items);
  }
  static arrayRemove(...items: unknown[]) {
    return new FieldTransform("arrayRemove", items);
  }
  static delete() {
    return new FieldTransform("delete");
  }
}

export type WhereOp =
  | "=="
  | "!="
  | "<"
  | "<="
  | ">"
  | ">="
  | "in"
  | "not-in"
  | "array-contains"
  | "array-contains-any";

export interface QuerySpec {
  collection: string;
  filters: Array<{ field: string; op: WhereOp; value: unknown }>;
  orders: Array<{ field: string; direction: "asc" | "desc" }>;
  limit?: number;
}

export interface StoredDoc {
  id: string;
  path: string;
  data: DocumentData;
}

export type Write =
  | { type: "set"; path: string; data: DocumentData; merge?: boolean }
  | { type: "update"; path: string; data: DocumentData }
  | { type: "delete"; path: string };

export class NotFoundError extends Error {
  readonly code = "not-found";
  constructor(path: string) {
    super(`No document to update: ${path}`);
  }
}

const isPlainObject = (v: unknown): v is DocumentData =>
  typeof v === "object" && v !== null && Object.getPrototypeOf(v) === Object.prototype;

/** Copies a value the way Firestore stores it: Dates become Timestamps, undefined is dropped. */
function copyIn(value: unknown): unknown {
  if (value instanceof Date) return Timestamp.fromDate(value);
  if (Array.isArray(value)) return value.filter((v) => v !== undefined).map(copyIn);
  if (isPlainObject(value)) {
    const out: DocumentData = {};
    for (const [k, v] of Object.entries(value)) if (v !== undefined) out[k] = copyIn(v);
    return out;
  }
  return value;
}

function copyOut<T>(value: T): T {
  if (Array.isArray(value)) return value.map(copyOut) as T;
  if (isPlainObject(value)) {
    const out: DocumentData = {};
    for (const [k, v] of Object.entries(value)) out[k] = copyOut(v);
    return out as T;
  }
  return value;
}

export function getField(data: DocumentData, field: string): unknown {
  let cur: unknown = data;
  for (const part of field.split(".")) {
    if (!isPlainObject(cur)) return undefined;
    cur = cur[part];
  }
  return cur;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Timestamp || b instanceof Timestamp) {
    return a instanceof Timestamp && b instanceof Timestamp && a.isEqual(b);
  }
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((k) => sameValue(a[k], b[k]));
  }
  return a === b;
}

function compare(a: unknown, b: unknown): number {
  const norm = (v: unknown) => (v instanceof Timestamp ? v.toMillis() : v);
  const x = norm(a) as number | string;
  const y = norm(b) as number | string;
  return x < y ? -1 : x > y ? 1 : 0;
}

function matches(data: DocumentData, { field, op, value }: QuerySpec["filters"][number]): boolean {
  const actual = getField(data, field);
  const list = Array.isArray(value) ? value : [];
  switch (op) {
    case "==":
      return sameValue(actual, value);
    case "!=":
      return actual !== undefined && actual !== null && !sameValue(actual, value);
    case "in":
      return list.some((v) => sameValue(actual, v));
    case "not-in":
      return actual !== undefined && !list.some((v) => sameValue(actual, v));
    case "array-contains":
      return Array.isArray(actual) && actual.some((v) => sameValue(v, value));
    case "array-contains-any":
      return Array.isArray(actual) && actual.some((v) => list.some((w) => sameValue(v, w)));
    default: {
      if (actual === undefined || actual === null || typeof actual !== typeof value) return false;
      const c = compare(actual, value);
      return op === "<" ? c < 0 : op === "<=" ? c <= 0 : op === ">" ? c > 0 : c >= 0;
    }
  }
}

function applyField(target: DocumentData, path: string[], value: unknown) {
  const [head, ...rest] = path;
  if (rest.length) {
    if (!isPlainObject(target[head])) target[head] = {};
    applyField(target[head], rest, value);
    return;
  }
  if (!(value instanceof FieldTransform)) {
    target[head] = isPlainObject(value) ? resolveSet(value) : value;
    return;
  }
  const current = target[head];
  switch (value.kind) {
    case "delete":
      delete target[head];
      return;
    case "serverTimestamp":
      target[head] = Timestamp.now();
      return;
    case "increment":
      target[head] = (typeof current === "number" ? current : 0) + (value.operand as number);
      return;
    case "arrayUnion": {
      const next = Array.isArray(current) ? [...current] : [];
      for (const item of value.operand as unknown[]) if (!next.some((v) => sameValue(v, item))) next.push(item);
      target[head] = next;
      return;
    }
    case "arrayRemove":
      target[head] = (Array.isArray(current) ? current : []).filter(
        (v) => !(value.operand as unknown[]).some((item) => sameValue(v, item)),
      );
      return;
  }
}

/** Writes `data` into `target`; nested maps merge when `merge` is set. */
function mergeInto(target: DocumentData, data: DocumentData, merge: boolean) {
  for (const [key, value] of Object.entries(data)) {
    if (merge && isPlainObject(value) && isPlainObject(target[key])) mergeInto(target[key], value, true);
    else applyField(target, [key], value);
  }
}

/** Removes transforms left in non-merge set() data (e.g. deleteField). */
function resolveSet(data: DocumentData): DocumentData {
  const out: DocumentData = {};
  mergeInto(out, data, true);
  return out;
}

export function collectionOf(path: string) {
  return path.slice(0, path.lastIndexOf("/"));
}

export function idOf(path: string) {
  return path.slice(path.lastIndexOf("/") + 1);
}

type Listener = () => void;

export class MemoryStore {
  private docs = new Map<string, DocumentData>();
  private listeners = new Set<Listener>();
  private pending = false;
  private autoId = 0;
  private queue: Promise<unknown> = Promise.resolve();

  /** Deterministic ids for documents created without one. */
  newId() {
    this.autoId += 1;
    return `auto-${String(this.autoId).padStart(6, "0")}`;
  }

  get(path: string): StoredDoc | null {
    const data = this.docs.get(path);
    return data ? { id: idOf(path), path, data: copyOut(data) } : null;
  }

  query(spec: QuerySpec): StoredDoc[] {
    const prefix = `${spec.collection}/`;
    let rows: StoredDoc[] = [];
    for (const [path, data] of this.docs) {
      if (!path.startsWith(prefix) || path.indexOf("/", prefix.length) !== -1) continue;
      if (!spec.filters.every((f) => matches(data, f))) continue;
      // Like Firestore, ordering by a field excludes documents that lack it.
      if (!spec.orders.every((o) => getField(data, o.field) !== undefined)) continue;
      rows.push({ id: idOf(path), path, data });
    }
    rows.sort((a, b) => {
      for (const { field, direction } of spec.orders) {
        const c = compare(getField(a.data, field), getField(b.data, field));
        if (c) return direction === "desc" ? -c : c;
      }
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    if (spec.limit !== undefined) rows = rows.slice(0, spec.limit);
    return rows.map((r) => ({ ...r, data: copyOut(r.data) }));
  }

  /** Applies all writes or none (an update of a missing document aborts the lot). */
  commit(writes: Write[]) {
    const staged = new Map<string, DocumentData | null>();
    const read = (path: string) => (staged.has(path) ? staged.get(path)! : (this.docs.get(path) ?? null));
    for (const w of writes) {
      if (w.type === "delete") {
        staged.set(w.path, null);
        continue;
      }
      const data = copyIn(w.data) as DocumentData;
      const current = read(w.path);
      if (w.type === "update") {
        if (!current) throw new NotFoundError(w.path);
        const next = copyOut(current);
        for (const [field, value] of Object.entries(data)) applyField(next, field.split("."), value);
        staged.set(w.path, next);
      } else if (w.merge && current) {
        const next = copyOut(current);
        mergeInto(next, data, true);
        staged.set(w.path, next);
      } else {
        staged.set(w.path, resolveSet(data));
      }
    }
    for (const [path, data] of staged) {
      if (data) this.docs.set(path, data);
      else this.docs.delete(path);
    }
    this.notify();
  }

  /**
   * Runs `fn` after every earlier exclusive call has settled. Transactions go
   * through here so their read-then-write steps never interleave.
   */
  exclusive<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }

  /** Calls `listener` (batched per tick) after every commit. */
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (this.pending) return;
    this.pending = true;
    queueMicrotask(() => {
      this.pending = false;
      for (const listener of [...this.listeners]) listener();
    });
  }
}
