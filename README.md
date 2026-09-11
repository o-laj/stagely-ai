# Stagely (https://stagely-ai.web.app/)

A no-friction job application tracker. Paste a job post, confirm the fields,
and it's saved, with stale "Applied" jobs flagged automatically so nothing
quietly fall


## Stack
- React + Vite (frontend)
- Firebase Auth (Google sign-in)
- Firestore (storage)
- **Gemini API called directly from the browser**



## 1. Get a free Gemini API key
1. Go to https://aistudio.google.com/apikey and create a free API key.
2. Check https://ai.google.dev/gemini-api/docs/models for the current
   recommended free-tier Flash model, and update the `MODEL` constant in
   `src/firebase.js` if the one shipped here (`gemini-2.5-flash`) has moved on.

## 2. Set your key locally
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
When deploying, you'll need to set `VITE_GEMINI_API_KEY` as an environment
variable in whatever builds your production bundle (if building locally
before `firebase deploy`, your local `.env.local` is enough — Vite bakes it
into the build at build time).

