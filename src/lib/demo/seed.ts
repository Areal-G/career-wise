import { Firestore, type DocumentReference } from "./admin-firestore";
import { Timestamp, type DocumentData, type MemoryStore, type Write } from "./store";
import { toPublicProfile } from "@/lib/public-profile";
import {
  CANDIDATES,
  CHATS,
  COMPANIES,
  COVER_LETTERS,
  DEMO_EMPLOYER,
  DEMO_PASSWORD,
  DEMO_SEEKER,
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

const HOUR_MS = 60 * 60_000;

/**
 * All sample timestamps are relative to the start of the current UTC hour, so
 * every server instance and browser tab seeded within the same hour holds
 * identical data.
 */
export function demoAnchor(now = Date.now()) {
  return Math.floor(now / HOUR_MS) * HOUR_MS;
}

function demoEmail(uid: string) {
  return `${uid.replace(/^demo-/, "")}@example.com`;
}

/** Writes the full demo dataset into `store` in one commit. Same anchor, same data. */
export function seedDemoData(store: MemoryStore, anchor: number) {
  const ago = (minutes: number) => Timestamp.fromMillis(anchor - minutes * 60_000);
  const db = new Firestore(store);
  const writes: Write[] = [];
  const writer = {
    set: (ref: DocumentReference, data: DocumentData) => void writes.push({ type: "set", path: ref.path, data }),
  };
  // Public profiles carry an "updated" time; pin it to the anchor like everything else.
  const publicProfile = (data: Parameters<typeof toPublicProfile>[0]) => ({
    ...toPublicProfile(data),
    updatedAt: new Date(anchor).toISOString(),
  });

  // ---------- People ----------
  const seekerName = `${DEMO_SEEKER.firstName} ${DEMO_SEEKER.lastName}`;
  const seekerPhoto = avatar(seekerName, "#6366f1");
  const employerPhoto = avatar(DEMO_EMPLOYER.companyName, "#0f172a");
  const names: Record<string, { name: string; photo: string; role: "employee" | "employer"; title?: string }> = {
    [DEMO_SEEKER.uid]: { name: seekerName, photo: seekerPhoto, role: "employee", title: DEMO_SEEKER.headline },
    [DEMO_EMPLOYER.uid]: { name: DEMO_EMPLOYER.companyName, photo: employerPhoto, role: "employer", title: DEMO_EMPLOYER.industry },
  };

  const followersOfSeeker = ["demo-cand-01", "demo-cand-04", "demo-cand-10", DEMO_EMPLOYER.uid];
  const seekerDoc = {
    ...DEMO_SEEKER,
    displayName: seekerName,
    role: "employee",
    photoURL: seekerPhoto,
    plan: "pro",
    isDemo: true,
    followers: followersOfSeeker,
    following: ["demo-cand-02", "demo-co-greenleaf", DEMO_EMPLOYER.uid],
    createdAt: ago(60 * 24 * 40),
  };
  writer.set(db.collection("users").doc(DEMO_SEEKER.uid), seekerDoc);
  writer.set(db.collection("publicProfiles").doc(DEMO_SEEKER.uid), publicProfile(seekerDoc));

  const employerDoc = {
    ...DEMO_EMPLOYER,
    displayName: DEMO_EMPLOYER.companyName,
    company: DEMO_EMPLOYER.companyName,
    role: "employer",
    photoURL: employerPhoto,
    plan: "pro",
    isDemo: true,
    followers: ["demo-seeker", "demo-cand-01", "demo-cand-02", "demo-cand-03", "demo-cand-12"],
    following: [],
    createdAt: ago(60 * 24 * 300),
  };
  writer.set(db.collection("users").doc(DEMO_EMPLOYER.uid), employerDoc);
  writer.set(db.collection("publicProfiles").doc(DEMO_EMPLOYER.uid), publicProfile(employerDoc));

  for (const c of COMPANIES) {
    const photo = avatar(c.companyName, c.color);
    names[c.uid] = { name: c.companyName, photo, role: "employer", title: c.industry };
    const docData = {
      uid: c.uid,
      email: demoEmail(c.uid),
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
      isDemo: true,
      followers: [],
      following: [],
    };
    writer.set(db.collection("users").doc(c.uid), docData);
    writer.set(db.collection("publicProfiles").doc(c.uid), publicProfile(docData));
  }

  for (const c of CANDIDATES) {
    const name = `${c.firstName} ${c.lastName}`;
    const photo = avatar(name);
    names[c.uid] = { name, photo, role: "employee", title: c.headline };
    const docData = {
      ...c,
      email: demoEmail(c.uid),
      displayName: name,
      role: "employee",
      photoURL: photo,
      interests: "Open source, mentoring, travel",
      bio: `${c.headline} based in ${c.location}.`,
      isDemo: true,
      followers: [],
      following: c.uid === "demo-cand-01" ? [DEMO_SEEKER.uid] : [],
    };
    writer.set(db.collection("users").doc(c.uid), docData);
    writer.set(db.collection("publicProfiles").doc(c.uid), publicProfile(docData));
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
      applicants: (applicantCounts[job.id] ?? 0) + (job.employerId === DEMO_EMPLOYER.uid ? 0 : 3 + (i % 9)),
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
      userEmail: demoEmail(c.uid),
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
      userId: DEMO_SEEKER.uid,
      userName: seekerName,
      userEmail: DEMO_SEEKER.email,
      photoURL: seekerPhoto,
      coverLetter: COVER_LETTERS[0],
      employmentHistory: DEMO_SEEKER.employmentHistory,
      references: DEMO_SEEKER.references,
      portfolioLink: DEMO_SEEKER.portfolioLink,
      linkedinLink: DEMO_SEEKER.linkedinLink,
      education: DEMO_SEEKER.education,
      skills: DEMO_SEEKER.skills,
      interests: DEMO_SEEKER.interests,
      careerGoals: DEMO_SEEKER.careerGoals,
      status,
      submittedAt: ago(daysAgo * 24 * 60 + i * 11),
      updatedAt: ago(daysAgo * 24 * 60 - 200),
    });
  });

  SEEKER_TRACKER.forEach((card, i) => {
    const { id, ...rest } = card;
    writer.set(db.collection("users").doc(DEMO_SEEKER.uid).collection("applications").doc(id), {
      ...rest,
      createdAt: ago(i * 900 + 300),
    });
  });

  for (const jobId of SEEKER_SAVED) {
    const job = JOBS.find((j) => j.id === jobId)!;
    writer.set(db.collection("users").doc(DEMO_SEEKER.uid).collection("savedOpportunities").doc(jobId), {
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
  notify(DEMO_SEEKER.uid, SEEKER_NOTIFICATIONS);
  notify(DEMO_EMPLOYER.uid, EMPLOYER_NOTIFICATIONS);

  store.commit(writes);
}

export function demoCredentials(role: "employee" | "employer") {
  return {
    email: role === "employer" ? DEMO_EMPLOYER.email : DEMO_SEEKER.email,
    password: DEMO_PASSWORD,
  };
}
