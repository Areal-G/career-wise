/**
 * Fills a Firebase project with the sample data set: two sign-in accounts
 * (a job seeker and an employer), other companies and candidates, jobs,
 * applications, feed posts, chats and notifications.
 *
 *   npm run seed
 *
 * Without service-account credentials it targets the local emulator suite
 * (see emulator/). Re-running overwrites the sample documents and refreshes
 * their timestamps; nothing else in the project is touched.
 */
import { config as loadEnv } from "dotenv";
import { Timestamp } from "firebase-admin/firestore";
import type { Auth } from "firebase-admin/auth";
import type { Firestore } from "firebase-admin/firestore";
import { toPublicProfile } from "@/lib/public-profile";
import {
  CANDIDATES,
  CHATS,
  COMPANIES,
  COVER_LETTERS,
  SAMPLE_EMPLOYER,
  SAMPLE_SEEKER,
  EMPLOYER_APPLICATIONS,
  EMPLOYER_NOTIFICATIONS,
  JOBS,
  POSTS,
  SEEKER_APPLICATIONS,
  SEEKER_NOTIFICATIONS,
  SEEKER_SAVED,
  SEEKER_TRACKER,
  jobDoc,
} from "./seed-data";

const PALETTE = ["#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899", "#8b5cf6", "#ef4444", "#10b981"];

function avatar(name: string, color?: string): string {
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const fill = color ?? PALETTE[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${fill}"/><text x="64" y="64" dy=".35em" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="48" font-weight="600" fill="#fff">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const ago = (minutes: number) => Timestamp.fromMillis(Date.now() - minutes * 60_000);

function sampleEmail(uid: string) {
  return `${uid.replace(/^sample-/, "")}@example.com`;
}

/** Password used for both sign-in accounts when seeding the local emulator. */
const LOCAL_PASSWORD = "sample-password";

interface Login {
  email: string;
  password: string;
}

async function ensureAuthUser(auth: Auth, uid: string, displayName: string, login: Login) {
  const props = { email: login.email, password: login.password, displayName, emailVerified: true };
  try {
    await auth.getUser(uid);
  } catch (error) {
    if ((error as { code?: string }).code !== "auth/user-not-found") throw error;
    await auth.createUser({ uid, ...props });
    return;
  }
  await auth.updateUser(uid, props);
}

async function seed(auth: Auth, db: Firestore, owner: Login) {
  const writer = db.bulkWriter();

  // ---------- People ----------
  const seekerName = `${SAMPLE_SEEKER.firstName} ${SAMPLE_SEEKER.lastName}`;
  const seekerPhoto = avatar(seekerName, "#6366f1");
  const employerPhoto = avatar(SAMPLE_EMPLOYER.companyName, "#0f172a");
  const names: Record<string, { name: string; photo: string; role: "employee" | "employer"; title?: string }> = {
    [SAMPLE_SEEKER.uid]: { name: seekerName, photo: seekerPhoto, role: "employee", title: SAMPLE_SEEKER.headline },
    [SAMPLE_EMPLOYER.uid]: { name: SAMPLE_EMPLOYER.companyName, photo: employerPhoto, role: "employer", title: SAMPLE_EMPLOYER.industry },
  };

  await ensureAuthUser(auth, SAMPLE_SEEKER.uid, seekerName, owner);
  await ensureAuthUser(auth, SAMPLE_EMPLOYER.uid, SAMPLE_EMPLOYER.companyName, {
    email: SAMPLE_EMPLOYER.email,
    password: owner.password,
  });

  const followersOfSeeker = ["sample-cand-01", "sample-cand-04", "sample-cand-10", SAMPLE_EMPLOYER.uid];
  const seekerDoc = {
    ...SAMPLE_SEEKER,
    email: owner.email,
    displayName: seekerName,
    role: "employee",
    photoURL: seekerPhoto,
    plan: "pro",
    followers: followersOfSeeker,
    following: ["sample-cand-02", "sample-co-greenleaf", SAMPLE_EMPLOYER.uid],
    createdAt: ago(60 * 24 * 40),
  };
  writer.set(db.collection("users").doc(SAMPLE_SEEKER.uid), seekerDoc);
  writer.set(db.collection("publicProfiles").doc(SAMPLE_SEEKER.uid), toPublicProfile(seekerDoc));

  const employerDoc = {
    ...SAMPLE_EMPLOYER,
    displayName: SAMPLE_EMPLOYER.companyName,
    company: SAMPLE_EMPLOYER.companyName,
    role: "employer",
    photoURL: employerPhoto,
    plan: "pro",
    followers: ["sample-seeker", "sample-cand-01", "sample-cand-02", "sample-cand-03", "sample-cand-12"],
    following: [],
    createdAt: ago(60 * 24 * 300),
  };
  writer.set(db.collection("users").doc(SAMPLE_EMPLOYER.uid), employerDoc);
  writer.set(db.collection("publicProfiles").doc(SAMPLE_EMPLOYER.uid), toPublicProfile(employerDoc));

  for (const c of COMPANIES) {
    const photo = avatar(c.companyName, c.color);
    names[c.uid] = { name: c.companyName, photo, role: "employer", title: c.industry };
    const docData = {
      uid: c.uid,
      email: sampleEmail(c.uid),
      displayName: c.companyName,
      companyName: c.companyName,
      company: c.companyName,
      firstName: c.companyName.split(" ")[0],
      lastName: c.companyName.split(" ").slice(1).join(" "),
      role: "employer",
      photoURL: photo,
      headline: c.industry,
      location: c.location,
      industry: c.industry,
      companySize: c.companySize,
      founded: c.founded,
      companyOverview: c.companyOverview,
      benefits: c.benefits,
      followers: [],
      following: [],
    };
    writer.set(db.collection("users").doc(c.uid), docData);
    writer.set(db.collection("publicProfiles").doc(c.uid), toPublicProfile(docData));
  }

  for (const c of CANDIDATES) {
    const name = `${c.firstName} ${c.lastName}`;
    const photo = avatar(name);
    names[c.uid] = { name, photo, role: "employee", title: c.headline };
    const docData = {
      ...c,
      email: sampleEmail(c.uid),
      displayName: name,
      role: "employee",
      photoURL: photo,
      interests: "Open source, mentoring, travel",
      bio: `${c.headline} based in ${c.location}.`,
      followers: [],
      following: c.uid === "sample-cand-01" ? [SAMPLE_SEEKER.uid] : [],
    };
    writer.set(db.collection("users").doc(c.uid), docData);
    writer.set(db.collection("publicProfiles").doc(c.uid), toPublicProfile(docData));
  }

  // ---------- Jobs ----------
  const applicantCounts: Record<string, number> = {};
  for (const [, jobId] of EMPLOYER_APPLICATIONS) applicantCounts[jobId] = (applicantCounts[jobId] ?? 0) + 1;
  for (const [jobId] of SEEKER_APPLICATIONS) applicantCounts[jobId] = (applicantCounts[jobId] ?? 0) + 1;

  JOBS.forEach((job, i) => {
    const employer = names[job.employerId];
    writer.set(db.collection("opportunities").doc(job.id), {
      ...jobDoc(job, employer.name),
      employerPhotoURL: employer.photo,
      createdAt: ago(job.daysAgo * 24 * 60 + i * 7),
      applicants: (applicantCounts[job.id] ?? 0) + (job.employerId === SAMPLE_EMPLOYER.uid ? 0 : 3 + (i % 9)),
      views: 120 + ((i * 137) % 900),
    });
  });

  // ---------- Applications ----------
  EMPLOYER_APPLICATIONS.forEach(([candIdx, jobId, status, daysAgo], i) => {
    const c = CANDIDATES[candIdx];
    const person = names[c.uid];
    writer.set(db.collection("applications").doc(`app-emp-${candIdx}-${jobId}`), {
      opportunityId: jobId,
      userId: c.uid,
      userName: person.name,
      userEmail: sampleEmail(c.uid),
      photoURL: person.photo,
      coverLetter: COVER_LETTERS[i % COVER_LETTERS.length],
      employmentHistory: c.employmentHistory,
      references: "Available on request",
      portfolioLink: "",
      linkedinLink: "",
      education: c.education,
      skills: c.skills,
      interests: "Open source, mentoring",
      careerGoals: c.careerGoals,
      status,
      submittedAt: ago(daysAgo * 24 * 60 + i * 13),
      // Hires closed a few days ago, so time-to-hire reads realistically.
      updatedAt: status === "Hired" ? ago(4 * 24 * 60) : ago(daysAgo * 24 * 60 - 120),
    });
  });

  SEEKER_APPLICATIONS.forEach(([jobId, status, daysAgo], i) => {
    writer.set(db.collection("applications").doc(`app-seeker-${jobId}`), {
      opportunityId: jobId,
      userId: SAMPLE_SEEKER.uid,
      userName: seekerName,
      userEmail: owner.email,
      photoURL: seekerPhoto,
      coverLetter: COVER_LETTERS[0],
      employmentHistory: SAMPLE_SEEKER.employmentHistory,
      references: SAMPLE_SEEKER.references,
      portfolioLink: SAMPLE_SEEKER.portfolioLink,
      linkedinLink: SAMPLE_SEEKER.linkedinLink,
      education: SAMPLE_SEEKER.education,
      skills: SAMPLE_SEEKER.skills,
      interests: SAMPLE_SEEKER.interests,
      careerGoals: SAMPLE_SEEKER.careerGoals,
      status,
      submittedAt: ago(daysAgo * 24 * 60 + i * 11),
      updatedAt: ago(daysAgo * 24 * 60 - 200),
    });
  });

  SEEKER_TRACKER.forEach((card, i) => {
    const { id, ...rest } = card;
    writer.set(db.collection("users").doc(SAMPLE_SEEKER.uid).collection("applications").doc(id), {
      ...rest,
      createdAt: ago(i * 900 + 300),
    });
  });

  for (const jobId of SEEKER_SAVED) {
    const job = JOBS.find((j) => j.id === jobId)!;
    writer.set(db.collection("users").doc(SAMPLE_SEEKER.uid).collection("savedOpportunities").doc(jobId), {
      ...jobDoc(job, names[job.employerId].name),
      id: jobId,
      employerPhotoURL: names[job.employerId].photo,
      savedAt: ago(500),
    });
  }

  // ---------- Feed ----------
  POSTS.forEach((p, i) => {
    const author = names[p.author];
    writer.set(db.collection("posts").doc(`post-${i + 1}`), {
      userId: p.author,
      userName: author.name,
      userPhoto: author.photo,
      userRole: author.role,
      userTitle: author.title ?? null,
      content: p.content,
      imageUrl: null,
      likes: p.likes,
      comments: p.comments.map(([uid, text], j) => ({
        id: `c-${i}-${j}`,
        userId: uid,
        userName: names[uid].name,
        userPhoto: names[uid].photo,
        content: text,
        createdAt: ago(p.hoursAgo * 60 - 20 - j * 15).toDate(),
        likes: [],
      })),
      shares: (i * 3) % 7,
      createdAt: ago(p.hoursAgo * 60),
    });
  });

  // ---------- Chats ----------
  for (const chat of CHATS) {
    const details: Record<string, { displayName: string; photoURL: string; role: string }> = {};
    for (const uid of chat.participants) {
      details[uid] = { displayName: names[uid].name, photoURL: names[uid].photo, role: names[uid].role };
    }
    const last = chat.messages[chat.messages.length - 1];
    const chatRef = db.collection("chats").doc(chat.id);
    writer.set(chatRef, {
      participants: chat.participants,
      participantDetails: details,
      opportunityId: chat.opportunityId,
      opportunityTitle: chat.opportunityTitle,
      applicationId: chat.applicationId,
      createdAt: ago(chat.messages[0][2] + 5),
      lastMessage: { text: last[1], senderId: last[0], timestamp: ago(last[2]) },
    });
    chat.messages.forEach(([senderId, text, minutesAgo], i) => {
      const isLast = i === chat.messages.length - 1;
      writer.set(chatRef.collection("messages").doc(`m-${String(i).padStart(2, "0")}`), {
        senderId,
        text,
        timestamp: ago(minutesAgo),
        read: !isLast,
      });
    });
  }

  // ---------- Notifications ----------
  const notify = (userId: string, list: typeof SEEKER_NOTIFICATIONS) =>
    list.forEach((n, i) => {
      const { minutesAgo, ...rest } = n;
      writer.set(db.collection("notifications").doc(`notif-${userId}-${i}`), {
        ...rest,
        userId,
        createdAt: ago(minutesAgo),
      });
    });
  notify(SAMPLE_SEEKER.uid, SEEKER_NOTIFICATIONS);
  notify(SAMPLE_EMPLOYER.uid, EMPLOYER_NOTIFICATIONS);

  await writer.close();
}

async function main() {
  loadEnv({ path: [".env.local", ".env"] });

  const hasServiceAccount = Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY,
  );
  const emulator = !hasServiceAccount || Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  if (emulator) {
    process.env.FIRESTORE_EMULATOR_HOST ||= "127.0.0.1:8080";
    process.env.FIREBASE_AUTH_EMULATOR_HOST ||= "127.0.0.1:9099";
  }

  // A real project never gets the well-known local password.
  const password = process.env.SEED_OWNER_PASSWORD || (emulator ? LOCAL_PASSWORD : "");
  if (password.length < 6) {
    throw new Error("Set SEED_OWNER_PASSWORD (at least 6 characters) to seed a real Firebase project.");
  }
  const owner = { email: process.env.SEED_OWNER_EMAIL || SAMPLE_SEEKER.email, password };

  // Loaded after the env is final: the module initialises the Admin SDK on import.
  const { adminAuth, adminDb } = await import("@/lib/firebase-admin");
  if (!adminAuth || !adminDb) throw new Error("Firebase Admin is not configured.");

  await seed(adminAuth, adminDb, owner);
  console.log(`Seeded ${emulator ? `the emulator at ${process.env.FIRESTORE_EMULATOR_HOST}` : "the Firebase project"}.`);
  console.log(`  Job seeker: ${owner.email}`);
  console.log(`  Employer:   ${SAMPLE_EMPLOYER.email}`);
  console.log("  Both accounts use the owner password.");
}

main().catch((error) => {
  console.error("Seed failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
