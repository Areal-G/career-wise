/**
 * Stand-in for "firebase/auth" in the demo build. Only the demo accounts can
 * sign in; sign-up, password reset and Google sign-in explain that they are
 * disabled. The signed-in account survives reloads via localStorage.
 */
import { DEMO_ACCOUNTS, demoToken } from "./session";

type Account = (typeof DEMO_ACCOUNTS)[number];

const STORAGE_KEY = "career-wise-demo-uid";
const TOKEN_TTL_MS = 60 * 60_000;

export class DemoAuthError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  getIdToken(forceRefresh?: boolean): Promise<string>;
  getIdTokenResult(forceRefresh?: boolean): Promise<{ token: string; expirationTime: string }>;
}

type Listener = (user: User | null) => void;

function createUser({ uid, email, displayName }: Account): User {
  const token = demoToken(uid);
  return {
    uid,
    email,
    displayName,
    photoURL: null,
    emailVerified: true,
    getIdToken: async () => token,
    getIdTokenResult: async () => ({ token, expirationTime: new Date(Date.now() + TOKEN_TTL_MS).toUTCString() }),
  };
}

function readStoredUser(): User | null {
  try {
    const uid = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
    const account = DEMO_ACCOUNTS.find((a) => a.uid === uid);
    return account ? createUser(account) : null;
  } catch {
    return null;
  }
}

export class Auth {
  currentUser: User | null = readStoredUser();
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    // Like the SDK, the current state is reported asynchronously.
    queueMicrotask(() => this.listeners.has(listener) && listener(this.currentUser));
    return () => {
      this.listeners.delete(listener);
    };
  }

  setUser(user: User | null) {
    this.currentUser = user;
    try {
      if (user) window.localStorage.setItem(STORAGE_KEY, user.uid);
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable (private mode); the session then lasts until reload.
    }
    for (const listener of [...this.listeners]) listener(user);
  }
}

const auth = new Auth();

export function getAuth(_app?: unknown) {
  return auth;
}

export function onAuthStateChanged(target: Auth, listener: Listener) {
  return target.subscribe(listener);
}

/** Demo tokens never rotate, so token changes are exactly sign-in/out changes. */
export const onIdTokenChanged = onAuthStateChanged;

export async function signInWithEmailAndPassword(target: Auth, email: string, password: string) {
  const account = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase() && a.password === password);
  if (!account) {
    throw new DemoAuthError(
      "auth/invalid-credential",
      "This demo only signs in to its sample accounts. Use “Try demo as job seeker” or “Try demo as employer”.",
    );
  }
  const user = createUser(account);
  target.setUser(user);
  return { user };
}

export async function signOut(target: Auth) {
  target.setUser(null);
}

export async function updateProfile(user: User, profile: { displayName?: string | null; photoURL?: string | null }) {
  if (profile.displayName !== undefined) user.displayName = profile.displayName;
  if (profile.photoURL !== undefined) user.photoURL = profile.photoURL;
}

export async function createUserWithEmailAndPassword(..._args: unknown[]): Promise<{ user: User }> {
  throw new DemoAuthError(
    "auth/operation-not-allowed",
    "Sign-up is disabled in the demo. Use the demo buttons on the login page to explore with a sample account.",
  );
}

export async function sendPasswordResetEmail(..._args: unknown[]): Promise<void> {
  throw new DemoAuthError("auth/operation-not-allowed", "Password reset is disabled in the demo.");
}

export class GoogleAuthProvider {}

export async function signInWithPopup(..._args: unknown[]): Promise<{ user: User }> {
  throw new DemoAuthError(
    "auth/operation-not-allowed",
    "Google sign-in is disabled in the demo. Use the demo buttons to explore with a sample account.",
  );
}
