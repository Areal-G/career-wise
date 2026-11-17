// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
} from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

// Client config comes from NEXT_PUBLIC_* environment variables.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

// Initialize Firebase
const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST || "";
const isFirstInit = !getApps().length;
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);
const db =
  typeof window === "undefined"
    ? getFirestore(app)
    : (() => {
        try {
          // The local emulator is reset/reseeded often, so skip the
          // persistent IndexedDB cache there to avoid stale data.
          if (emulatorHost) return getFirestore(app);
          return initializeFirestore(app, {
            localCache: persistentLocalCache({
              tabManager: persistentMultipleTabManager(),
            }),
          });
        } catch {
          return getFirestore(app);
        }
      })();

// Local development: talk to the Firebase emulator suite instead of a real
// project. Host is e.g. "127.0.0.1"; ports come from the emulator config.
if (emulatorHost && isFirstInit) {
  const authPort = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT || "9099";
  const firestorePort = Number(process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT || "8080");
  const storagePort = Number(process.env.NEXT_PUBLIC_STORAGE_EMULATOR_PORT || "9199");
  try {
    connectAuthEmulator(auth, `http://${emulatorHost}:${authPort}`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulatorHost, firestorePort);
    connectStorageEmulator(storage, emulatorHost, storagePort);
  } catch (error) {
    console.warn("Firebase emulator connection skipped:", error);
  }
}

export { app, auth, db, storage };
