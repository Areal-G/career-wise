**Career Wise**

Career Wise is a career platform for two kinds of people. Job seekers browse open roles, see how well their skills match each one, and track every application they send. Employers post roles and see who has applied, with candidates sorted by how many of the required skills they have.

The AI side runs on Genkit with Gemini 2.5 Flash. A job seeker can generate a cover letter for a role or get a list of likely interview questions. If no API key is set, an offline demo model answers instead, so nothing paid is needed to try it.

Data and sign-in live in Firebase (Auth, Firestore and Storage). For local work everything points at the Firebase emulators.

# Setup

1. Install Node.js 20+ and Docker.
2. Run `npm install`.
3. Build and start the emulator image from the `emulator/` folder:
   `docker build -t career-wise-emulator emulator`, then run it with ports 9099, 8080, 9199 and 4000 published.
4. Create `.env.local` with the `NEXT_PUBLIC_FIREBASE_*` values for project `demo-app` and the emulator hosts and ports.
5. Run `npm run dev` and open http://localhost:3507.

# Notes

The emulator UI is at http://localhost:4000 if you want to look at the data.

Add `GOOGLE_GENAI_API_KEY` to `.env.local` to use Gemini instead of the demo model.

Security rules are in `firestore.rules`, and the emulator mounts them read-only.