

import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Replace with your own Firebase project config
// (Firebase console -> Project settings -> Your apps -> SDK setup and config)
const firebaseConfig = {
  apiKey: "AIzaSyA3-6tLQidgAH5J80OQiZx1QxbPPraFHyI",
  authDomain: "stagely-ai.firebaseapp.com",
  projectId: "stagely-ai",
  storageBucket: "stagely-ai.firebasestorage.app",
  messagingSenderId: "407155396525",
  appId: "1:407155396525:web:5958c77c1c9020784f9b24",
  measurementId: "G-7QDNMST563"
};


const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

const googleProvider = new GoogleAuthProvider()

export function signIn() {
  return signInWithPopup(auth, googleProvider)
}

export function logOut() {
  return signOut(auth)
}

// Check ai.google.dev/gemini-api/docs/models for the current free-tier model —
// Google renames/retires these fairly often. gemini-3.6-flash is confirmed
// working as of writing; swap this string if it stops working.
const MODEL = 'gemini-3.6-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const EXTRACTION_PROMPT = `You extract structured data about a job posting, from pasted text and/or a URL you're given.
If a URL is provided, use it to see the actual posting content. If pasted text is also provided, use both together.

Respond with ONLY valid JSON, no markdown fences, no prose, in exactly this shape:
{"title": string or null, "company": string or null, "salary": string or null, "summary": string or null, "website": string or null, "contact": string or null, "referenceLink": string or null}

Rules:
- "salary" is the compensation range or figure as written, or null if not mentioned.
- "summary" is a single plain sentence (max ~25 words) describing the role.
- "website" is the company's own website/homepage if mentioned or obviously inferable, or null.
- "contact" is a named contact person, email address, or phone number to apply/follow up with, if the posting gives one, or null.
- "referenceLink" is any secondary link mentioned (e.g. a separate application form, portfolio requirement link, company LinkedIn page) distinct from the main posting itself, or null.
- Use null for any field you cannot find. Never invent information that isn't present.`

// Calls Gemini DIRECTLY from the browser — no backend involved.
// NOTE: this means your Gemini API key is visible to anyone who inspects
// your site's network requests or JS bundle. Fine for a personal project
// only you use; if this ever grows into something with real users, move
// this call behind a server (Cloud Function, Vercel, etc.) so the key
// can't be lifted and used by someone else on your free quota.
//
// Accepts pasted text, a job posting link, or both. When a link is given,
// Gemini's url_context tool fetches the page content server-side (Google's
// servers do the fetching, not the browser — this avoids CORS entirely).
// Note: this can't get past login walls or heavy JS rendering, so it works
// best on public company career pages; LinkedIn/Indeed-style listings behind
// a login may fail to fetch — pasting the text is the reliable fallback.
// Mirrors the shape the old callable returned: { data: {...} }
export async function extractJobDetails({ text, link }) {
  const trimmedText = (text || '').trim().slice(0, 8000) // keep requests small/cheap
  const trimmedLink = (link || '').trim()

  if (!trimmedText && !trimmedLink) {
    throw new Error('Provide pasted text or a link')
  }

  let userMessage = ''
  if (trimmedLink) userMessage += `Job posting URL: ${trimmedLink}\n\n`
  if (trimmedText) userMessage += `Pasted text:\n${trimmedText}`

  const body = {
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    systemInstruction: { parts: [{ text: EXTRACTION_PROMPT }] },
    generationConfig: { temperature: 0 },
  }

  // Only attach the URL-fetching tool when a link was actually given — and
  // skip forcing JSON response mode alongside it, since structured output
  // and tool use don't reliably combine yet. The prompt above + the JSON
  // cleanup below cover this instead.
  if (trimmedLink) {
    body.tools = [{ urlContext: {} }]
  } else {
    body.generationConfig.responseMimeType = 'application/json'
  }

  const res = await fetch(`${GEMINI_URL}?key=${import.meta.env.VITE_GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini API error:', res.status, errText)
    throw new Error('Extraction failed')
  }

  const data = await res.json()
  const raw = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('')

  if (!raw || !raw.trim()) {
    throw new Error('No response from model')
  }

  // Strip markdown code fences in case the model wrapped the JSON in ```json ... ```
  // (more likely when tools are active, since strict JSON mode is off then).
  const cleaned = raw.trim().replace(/^```(json)?/i, '').replace(/```$/, '').trim()

  const parsed = JSON.parse(cleaned)
  return {
    data: {
      title: parsed.title || null,
      company: parsed.company || null,
      salary: parsed.salary || null,
      summary: parsed.summary || null,
      website: parsed.website || null,
      contact: parsed.contact || null,
      referenceLink: parsed.referenceLink || null,
    },
  }
}