**Career Wise** — hiring that explains itself, on both sides of the table.

![Next.js](https://img.shields.io/badge/Next.js-15.5-000?logo=nextdotjs)
![Firebase](https://img.shields.io/badge/Firebase-11-ffca28?logo=firebase&logoColor=black)
![Genkit](https://img.shields.io/badge/Genkit-Gemini_2.5_Flash-4285f4?logo=googlegemini&logoColor=white)
![Demo](https://img.shields.io/badge/demo-two_roles-5a3a24)

Job seekers get a prep pack for every role. Employers get applicants ranked by real skill fit. Both sides see the same match score, because it comes from the same function.

Career Wise is built with Next.js 15, Firebase and Genkit. Every AI feature runs on Gemini 2.5 Flash, and without an API key the app switches to an offline demo model that returns realistic, schema-valid answers. The whole product runs locally with no paid services.

# Two sides, one product

| For job seekers | For employers |
|---|---|
| **Today** puts active applications, interviews and offers first, then new matches with a match percentage, then applications with no reply for 7+ days, each with a one-click follow-up | **Employer home** shows open roles, applicants this week, decisions waiting and average time to hire |
| **Opportunities** search by skill, company or location, with your match percentage next to every role | **Ranked candidates** for each posting, sorted by how much of the required skill list they cover, with matched and missing skills as chips |
| **Prep pack** on any role: a match score split into skills, experience, education and location, plus a cover letter, likely interview questions and a skill plan | **Invite** creates an invited application and an in-app notification in one step |
| **Application tracker**, a drag-and-drop board (saved, applied, interview, offer, rejected) | **Pipeline** shows applicants stage by stage per posting, with status emails |
| **Profile** with resume upload and parsing (pdf.js), skills and experience | **Analytics** on applicants per posting and active vs archived jobs |

Both sides share inbox and notifications, a 3-step onboarding that picks the role, a collapsible sidebar with command search, and light and dark themes.

The tracker, the Today page and the employer pipeline all read from one status model (`lib/application-status.ts`), so they always agree on where an application stands.

## Try it

Once it's running, click **Try as a job seeker** or **Try as an employer** on the landing page. A guest account is created and seeded on the spot:

- **Maya**, a job seeker with 16 tracked applications (3 interviewing, 3 offers), saved jobs and follow-up reminders.
- **Northwind Labs**, an employer with 4 open roles, ranked candidates and applicants at every stage.

## How matching works

`lib/career.ts` computes the skill overlap between a candidate and a job, and the same code powers the seeker's match score and the employer's ranking.

- Formatting is forgiven: "react.js" matches "React", "Node" matches "Node.js".
- One-letter tokens are kept strict, so "C" never matches "C#".
- A match is never just a number. It comes with four bars (skills, experience, education, location) and the matched and missing skills by name.

# AI tools

The **prep pack** is the headline: press **Build my prep pack** on any job and the cover letter it writes pre-fills the application. Earlier packs are kept for when the interview comes round.

Alongside it, the **LaunchPad** tools:

- Resume match analyzer
- Resume builder with PDF export
- Cover letter and interview prep
- Skill gap and career path
- Salary negotiation
- LinkedIn optimizer
- Email templates

Tools pre-fill from your profile or a chosen job, and every result is saved to an AI history.

**No key? Still works.** `src/ai/genkit.ts` picks Gemini when a key is present and otherwise registers the offline demo model. Its answers are checked against each flow's output schema in tests, and results come back in the same layout either way.

Under the hood each tool is a Genkit flow with Zod input and output schemas, called only from `/api/ai/*` handlers that check the session and apply a rate limit. Limits are counted per user, per tool and per hour inside a Firestore transaction, with higher limits on paid plans.

# Local development

You need Node.js 20+, npm and Docker (for the Firebase emulator suite).

1. **Install**

   ```bash
   git clone <your-fork-url> career-wise
   cd career-wise
   npm install
   ```

2. **Build the emulator image.** The `emulator/` folder contains the Auth, Firestore and Storage emulators for project `demo-app`.

   ```bash
   docker build -t career-wise-emulator emulator
   ```

3. **Start the emulators.** Data persists in a Docker volume, and your local `firestore.rules` is mounted read-only.

   ```bash
   docker run -d --name career-wise-firebase \
     -p 127.0.0.1:9099:9099 -p 127.0.0.1:8080:8080 -p 127.0.0.1:9199:9199 -p 127.0.0.1:4000:4000 \
     -v career-wise-data:/data \
     -v "$PWD/firestore.rules:/srv/firestore.rules:ro" \
     career-wise-emulator
   ```

   The emulator UI is at `http://localhost:4000`.

4. **Configure.** Create `.env.local` with the values in the next section.

5. **Run**

   ```bash
   npm run dev
   ```

   Open `http://localhost:3507` and pick a demo. Demo sign-in turns on automatically with the emulator.

Handy scripts:

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with Turbopack on port 3507 |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: status mapping, skill matching and the demo model's output |
| `npm run genkit:dev` | Genkit developer UI for running AI flows |

TypeScript is checked in builds, so a type error fails the build.

Firestore rules can be tried out against the emulator from the emulator UI.

# Environment variables

For local development against the emulators:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=demo-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=demo-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=demo-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=demo-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=0
NEXT_PUBLIC_FIREBASE_APP_ID=demo
NEXT_PUBLIC_FIREBASE_EMULATOR_HOST=127.0.0.1
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_PORT=9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT=8080
NEXT_PUBLIC_STORAGE_EMULATOR_PORT=9199
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
NEXT_PUBLIC_APP_URL=http://localhost:3507
```

Optional extras:

| Variable | What it turns on |
|---|---|
| `GOOGLE_GENAI_API_KEY` (or `GEMINI_API_KEY`, `GOOGLE_API_KEY`) | Gemini instead of the offline demo model |
| `DEMO_MODE` | `true` shows demo sign-in outside the emulator setup; `false` hides it |
| `ADMIN_EMAILS` | Comma-separated emails granted the admin role |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Welcome and application-status emails |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Paid plans and checkout |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Image and file uploads |

In production, `firebase-admin` also needs a service account: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`.

# Tech

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router, Route Handlers, server actions) |
| UI | React 18.3, Tailwind CSS 3.4, shadcn/ui on Radix, Framer Motion, Recharts |
| Language | TypeScript 5 |
| Data and auth | Firebase Auth, Cloud Firestore, Cloud Storage |
| AI | Genkit 1.15, Gemini 2.5 Flash, offline demo model |
| Validation | react-hook-form, Zod 3 |
| Documents | pdfjs-dist, jsPDF, html2canvas |
| Optional | Stripe, Resend, Cloudinary |
| Tests | Vitest 3 |

Pages read and write Firestore directly through the client SDK, and `firestore.rules` keeps people to their own data. Privileged work (checkout, webhooks, role sync, rate limits) runs server-side with `firebase-admin`. The Firebase ID token is mirrored into a session cookie, and `middleware.ts` checks it before app routes render.

```
src/
├── app/
│   ├── (auth)/        # login, signup, forgot-password
│   ├── (app)/         # seeker pages, ai-tools/*, employer/
│   └── api/           # ai/*, upload, checkout, webhooks/stripe
├── ai/
│   ├── genkit.ts      # Gemini or the offline demo model
│   └── flows/         # 19 Genkit flows
├── lib/               # matching, statuses, rate limiting, demo/ seeding
└── middleware.ts
emulator/              # Firebase emulator image
firestore.rules
```

# Deploying

The repo includes `apphosting.yaml` for Firebase App Hosting:

1. Connect the repository in Firebase App Hosting.
2. Set the environment variables above as secrets, including the service account and `NEXT_PUBLIC_APP_URL`.
3. Deploy `firestore.rules` and `firestore.indexes.json` with the Firebase CLI.
4. If billing is on, point the Stripe webhook at `/api/webhooks/stripe`.
5. Set `DEMO_MODE=false` unless you want public demo sign-in.

It also runs on any Node host with `npm run build && npm start`.