// Portfolio demo build: the Firebase client SDK is replaced by in-memory
// stand-ins (src/lib/demo) that hold the sample data in this browser tab.
import { Firestore } from "@/lib/demo/firestore";
import { getAuth } from "@/lib/demo/auth";
import { getStorage } from "@/lib/demo/storage";
import { demoStore } from "@/lib/demo/db";

const app = { name: "career-wise-demo" };
const auth = getAuth(app);
const db = new Firestore(demoStore);
const storage = getStorage(app);

export { app, auth, db, storage };
