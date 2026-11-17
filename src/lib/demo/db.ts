import { MemoryStore } from "./store";
import { demoAnchor, seedDemoData } from "./seed";

/**
 * This runtime's copy of the demo data: one per browser tab and one per
 * server instance. It is seeded synchronously on first import and never
 * reset, so there is no window in which a request can see a half-seeded
 * store. Writes stay in memory and are gone after a reload or cold start.
 */
export const demoStore = new MemoryStore();
seedDemoData(demoStore, demoAnchor());
