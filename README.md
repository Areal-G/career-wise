**Career Wise**

Hiring that explains itself, on both sides of the table.

Career Wise is a two-sided career platform built with Next.js 15, Firebase and Genkit. Job seekers browse roles, see why they match, generate a tailored cover letter and likely interview questions, and track every application on a board. Employers post roles, see candidates ranked by how well their skills cover each posting, and move applicants through a pipeline.

Every AI feature is a Genkit flow on Gemini 2.5 Flash. Without an API key an offline demo model returns realistic, schema-valid answers, so the whole product runs locally with no paid services.

# Quick install

1. `npm install`
2. `docker build -t career-wise-emulator emulator`
3. Start the emulator container (see Setup below for the full command)
4. Create `.env.local`
5. `npm run dev`

# Features

For job seekers:
+ Today page with active applications, interviews and offers
+ New matches with a match percentage
- Follow-up reminders after seven days with no reply
+ Prep pack: match score, cover letter, interview questions, skill plan
- Application tracker board (saved, applied, interview, offer, rejected)
+ Opportunities search by skill, company or location
- Resume upload with parsing (pdf.js)
+ Public profile

For employers:
- Candidates ranked by skill fit
+ Matched and missing skills as chips
- **Invite** button that creates an application and a notification
+ Pipeline view per posting
- Analytics: applicants per posting, active vs archived jobs

AI tools (LaunchPad):
+ resume match analyzer
+ resume builder with PDF export
- cover letter
- interview prep
+ skill gap
- career path
+ salary negotiation
- LinkedIn optimizer
+ email templates

Other:
- inbox and notifications
+ 3-step onboarding
- Stripe billing (optional)
+ Resend email (optional)
- light and dark themes

# Setup

You need Node.js 20+, npm and Docker.

1. Clone and install:

```bash
git clone <your-fork-url> career-wise
cd career-wise
npm install
```

2. Build the emulator image (Auth, Firestore, Storage, project `demo-app`):

```bash
docker build -t career-wise-emulator emulator
```

3. Run it:

```bash
docker run -d --name career-wise-firebase \
  -p 127.0.0.1:9099:9099 -p 127.0.0.1:8080:8080 -p 127.0.0.1:9199:9199 -p 127.0.0.1:4000:4000 \
  -v career-wise-data:/data \
  -v "$PWD/firestore.rules:/srv/firestore.rules:ro" \
  career-wise-emulator
```

4. Create `.env.local` with the Firebase web config (`NEXT_PUBLIC_FIREBASE_*`), the emulator hosts and ports, and `NEXT_PUBLIC_APP_URL=http://localhost:3507`.

5. Install again if you skipped step 1, then start:

```bash
npm install
npm run dev
```

Open http://localhost:3507 and click **Try as a job seeker** or **Try as an employer**.

# Changelog

**v0.4**
- Employer side: ranked candidates, pipeline and analytics
+ **Invite** button on candidates
- Demo sign-in for both roles (Maya, Northwind Labs)

**v0.3**
+ Prep pack on every job page
+ LaunchPad AI tools with AI history
- Fair-use AI limits per user, per tool and per hour

**v0.2**
- Application tracker board
+ Today page with follow-up reminders
- Shared status model in `lib/application-status.ts`

**v0.1**
+ Firebase auth and Firestore
+ Job listings and profiles
- Offline demo model for Genkit flows

# Notes

Add `GOOGLE_GENAI_API_KEY` to use Gemini. `DEMO_MODE=true` shows demo buttons outside the emulator setup.

Tests: `npm test` (Vitest, 13 tests). Type check: `npm run typecheck`.