import { DEMO_EMPLOYER, DEMO_PASSWORD, DEMO_SEEKER } from "./seed-data";

/** The two accounts the demo can sign in as. */
export const DEMO_ACCOUNTS = [
  { uid: DEMO_SEEKER.uid, email: DEMO_SEEKER.email, displayName: `${DEMO_SEEKER.firstName} ${DEMO_SEEKER.lastName}` },
  { uid: DEMO_EMPLOYER.uid, email: DEMO_EMPLOYER.email, displayName: DEMO_EMPLOYER.companyName },
].map((account) => ({ ...account, password: DEMO_PASSWORD }));

const TOKEN_PREFIX = "demo-session.";

/**
 * Session tokens only name a demo account. They are not secret: every account
 * is public sample data that lives in the visitor's own browser.
 */
export function demoToken(uid: string) {
  return `${TOKEN_PREFIX}${uid}`;
}

/** The demo account a token belongs to, or null when it is not a demo token. */
export function demoAccountForToken(token: string | undefined) {
  if (!token?.startsWith(TOKEN_PREFIX)) return null;
  const uid = token.slice(TOKEN_PREFIX.length);
  return DEMO_ACCOUNTS.find((a) => a.uid === uid) ?? null;
}
