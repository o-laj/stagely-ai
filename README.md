# tracklog (stagely)

A no-friction job application tracker. Paste a job post, confirm three fields,
and it's logged — with stale "Applied" jobs flagged automatically so nothing
quietly falls through the cracks.

## Stack
- React + Vite (frontend)
- Firebase Auth (Google sign-in) — data is scoped per user
- Firestore (storage) — free, no billing plan required
- **Gemini API called directly from the browser** — no backend at all. This
  is the simplest possible setup: no Cloud Functions, no Vercel, no billing
  plan anywhere. The tradeoff is your Gemini key is visible to anyone who
  inspects your site's network requests — fine for a personal project only
  you use. If this ever grows real outside users, that's the point to move
  this call behind a small server so the key can't be lifted.

## 1. Firebase project setup
1. Go to https://console.firebase.google.com and create a project.
2. Enable **Authentication → Google** as a sign-in provider.
3. Enable **Firestore Database** (production mode — the rules file here
   locks it down properly).
4. Under **Project settings → General → Your apps**, add a Web app and copy
   the config object into `src/firebase.js` (replace the `YOUR_...` placeholders).

## 2. Get a free Gemini API key
1. Go to https://aistudio.google.com/apikey and create a free API key.
2. Check https://ai.google.dev/gemini-api/docs/models for the current
   recommended free-tier Flash model — update the `MODEL` constant in
   `src/firebase.js` if the one shipped here (`gemini-2.5-flash`) has moved on.

## 3. Set your key locally
Copy `.env.local.example` to `.env.local` and fill in:
```
VITE_GEMINI_API_KEY=your-real-key-here
```

## 4. Install and run
```
npm install
npm run dev
```

## 5. Deploy
```
npm install -g firebase-tools   # if you don't have it
firebase login
npm run build
firebase deploy --only hosting,firestore:rules
```
When deploying, you'll need to set `VITE_GEMINI_API_KEY` as an environment
variable in whatever builds your production bundle (if building locally
before `firebase deploy`, your local `.env.local` is enough — Vite bakes it
into the build at build time).

## Project structure
```
src/
  firebase.js               Firebase config + auth helpers + extractJobDetails (calls Gemini directly)
  App.jsx                   Auth gate
  components/
    JobBoard.jsx              Kanban-style board grouped by stage, stale-job banner
    JobCard.jsx                Single job card with stage dropdown
    AddJobModal.jsx            Paste → extract → confirm → save flow
firestore.rules             Per-user data isolation
.env.local.example          Template for your Gemini key
```

## Notes / known limits
- **Gemini key is exposed client-side.** Someone determined enough could pull
  it from your deployed site's JS bundle and use your free quota. Low risk
  for a personal tool; revisit if you ever open this up to other users.
- Job URLs are stored as a link but not auto-fetched — many job sites block
  server-side scraping or render via JS, so paste-the-text is the reliable path.
- Stale threshold (7 days in "Applied") is a constant (`STALE_DAYS`) in
  `JobBoard.jsx` — change it there if you want a different window.
