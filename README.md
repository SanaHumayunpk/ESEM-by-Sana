# ESEM — Honest, Personalized Skincare Guidance

**Live app:** [https://esem-by-sana.vercel.app](https://esem-by-sana.vercel.app)
**Built by:** Sana Humayun

---

## a. What ESEM is, and why I built it

ESEM is a web app that gives people structured, personalized skincare guidance — either from a short questionnaire or from a selfie — instead of the confusing, contradictory advice most people get from random YouTube videos, Instagram ads, or "what worked for my cousin."

The name is personal. **ESEM = S + M** — **S**ana (me) and **M**amuna (my mother). This project is the first step toward a skincare brand I've been wanting to build for a while, and this app is where that starts.

**The real problem:** Most people especially in Pakistan don't actually know their skin type or what routine fits their concerns. They either overspend on imported products that don't suit them, follow generic advice that ignores what's actually available locally, or avoid dealing with it altogether because a dermatologist visit feels like overkill for "just some breakouts." At the same time, skincare advice online is scattered, inconsistent, and rarely accounts for what's realistically available in local pharmacies and stores.

**Who it's for:** Anyone who wants a clear, honest starting point for their skincare — without an expensive derm visit for routine, non-medical concerns, and without wading through fifty conflicting "holy grail" product recommendations online. I built it with a Pakistani audience specifically in mind, since that's the gap I kept noticing myself, running my own skincare venture and constantly fielding "what should I use for X" questions from friends and family.

---

## b. Live URL

**[https://esem-by-sana.vercel.app](https://esem-by-sana.vercel.app)**

Works directly in any browser, no login or signup required.

---

## c. Features

- **Guided Questionnaire** — Answer a few quick structured questions (skin feel, main concern, sensitivity level, current routine) and get a full personalized routine back in seconds.
- **Selfie Skin Analysis** — Take a photo, and the app analyzes visible skin cues (shine, texture, redness, pore size) to estimate skin type and concerns, with a clear non-medical disclaimer shown before every analysis.
- **Structured Routine Output** — Every result is returned as a clean, organized card: skin type, top 3 concerns, a full AM routine, a full PM routine, ingredients to look for (with reasons), and ingredients to avoid (with reasons) — not a wall of chatbot text.
- **Routine Check-In (adaptive skincare)** — This is the core of the app. Days after getting a routine, you can check in on how your skin responded (Better / No change / Worse / Irritated) with an optional note. The AI then generates an *updated* routine that responds specifically to that feedback, and explains exactly what changed and why. This turns a one-time recommendation into an ongoing, evolving skin journey — not a static result you get once and forget.
- **Skin Journey Timeline** — Every questionnaire result, photo analysis, and check-in update is saved (in your browser) as a connected timeline, so you can see how your routine has evolved over time.
- **Ingredient Checker** — Paste any product's ingredient list and the app checks it against your most recent saved skin profile, returning a clear verdict (Good fit / Use with caution / Avoid), which specific ingredients triggered the flag, and why.
- **Pakistan-aware recommendations** — Every AI response is instructed to favor ingredient categories and product types realistically available in Pakistani pharmacies and local stores, instead of defaulting to expensive imported brands with no local alternative.
- **No login, no friction** — Everything runs on-device via browser storage. Open the link and start immediately.

---

## d. The AI feature — what it does and the exact instructions behind it

ESEM's AI is powered by **Google's Gemini API** (`gemini-3.6-flash`), and it isn't a generic chatbot — every single call is constrained to return **structured JSON** matching a fixed schema (skin type, concerns, routines, ingredients, disclaimer), which the app renders as designed UI cards. There is no free-form chat box anywhere in the app; the AI always has to answer inside the same shape, which is what makes the output consistent and product-like rather than a raw AI conversation.

There are four AI-powered endpoints, all sharing the same core system instruction:

**System Prompt (used across all four features):**
```
You are a skincare guidance assistant, not a doctor or dermatologist.
Given a user's skin type, concerns, sensitivity level, and optionally
an image of their face, provide general, safe, non-medical skincare
guidance. Always respond in the exact structured JSON format requested
by the app (skin_type, top_concerns, morning_routine, night_routine,
ingredients_to_look_for, ingredients_to_avoid, disclaimer). Keep advice
practical, and prefer ingredient categories widely available in local
Pakistani pharmacies/stores over expensive imported brands. Never
diagnose a medical skin condition (e.g. eczema, psoriasis, fungal
infections) — if the input suggests something beyond routine skincare,
say so in the disclaimer and recommend seeing a dermatologist. Never
make guarantees about results. Keep tone warm, clear, and encouraging.
```

**1. Questionnaire Analysis** — Takes the user's skin feel, main concern, sensitivity, and current routine, and generates a full personalized AM/PM routine with reasoned ingredient recommendations, explicitly prioritizing options accessible in Pakistani pharmacies.

**2. Photo Analysis** — Takes an uploaded/captured selfie and analyzes visual cues only (shine, texture, redness, pore size). The prompt explicitly forbids medical diagnosis and instructs the model to stick to general visual-cue-based guidance, always shown with a disclaimer before the user even submits the photo.

**3. Routine Check-In** — This is the adaptive part. It sends the model the user's *previous* routine JSON plus their new feedback (Better / No change / Worse / Irritated, and an optional note), and asks it to generate a targeted, updated routine — not a reset from scratch — along with a `what_changed` field explaining exactly what was adjusted and why, referencing the user's actual feedback.

**4. Ingredient Checker** — Sends the user's most recent saved skin profile plus a pasted ingredient list, and asks the model to return a verdict (Good fit / Use with caution / Avoid), specific beneficial and flagged ingredients with reasons, and a practical recommendation.

All four calls use a strict JSON response schema (via Gemini's structured output feature) so the app never has to guess how to parse the AI's response — every field is guaranteed to come back in the expected shape.

---

## e. Tools, services, and models used

**AI model**
- Google Gemini (`gemini-3.6-flash`) via the `@google/genai` SDK — powers all four AI features, with structured JSON output schemas so every response is guaranteed to match the app's data format

**Platforms used to build and ship this**
- **Google AI Studio** (Build mode) — used to scaffold the initial app from a detailed spec I wrote myself, then iterated on directly
- **GitHub** — version control and the public code repository
- **Vercel** — live hosting and deployment

**Tech stack**
- Frontend: React 19, Vite 6, TypeScript
- Styling: Tailwind CSS 4, `lucide-react` (icons), `motion` / Framer Motion (transitions)
- Backend: Express, adapted into a Vercel serverless function (`api/index.ts`)
- Storage: Browser local storage — no external database; all skin history and profile data stays on the user's own device

---

## How It Works (user flow)

1. **Open the app** — no signup, no login. You land on the home screen with two options: fill a questionnaire or scan a selfie.
2. **Choose your starting point:**
   - *Questionnaire:* Answer 4 quick questions about your skin feel, main concern, sensitivity, and current routine.
   - *Selfie scan:* Upload or take a photo. You'll see a non-medical disclaimer before the scan runs.
3. **Get your routine** — within seconds, Gemini returns a full structured result: skin type, top concerns, a morning routine, a night routine, and ingredients to look for/avoid — all shown as a designed results card, not raw text.
4. **It's saved automatically** to your Skin Journey timeline (stored locally in your browser).
5. **Check in later** — after trying the routine, come back and tell the app how your skin responded (Better / No change / Worse / Irritated). The AI updates your routine specifically based on that feedback and explains what changed and why — this is what makes ESEM different from a one-time skin quiz.
6. **Check any product** — anytime, paste a product's ingredient list into the Ingredient Checker to see if it fits your current skin profile.

---

## f. Screenshots


1. **Home screen** — showing the two entry options:

<img width="517" height="415" alt="ESEM-homepage" src="https://github.com/user-attachments/assets/350d06c4-bd06-47cf-a973-2fe36ae5723f" />

"Answer a quick questionnaire" / "Analyze my skin with a photo" and the Skin Journey section


2. **Questionnaire flow** — a filled-in question screen

<img width="559" height="416" alt="Questionnaire" src="https://github.com/user-attachments/assets/7bf1bab3-a6b5-49a7-9e79-08cc8864f0f7" />


3. **AI visual scan**

<img width="610" height="417" alt="Photo visual scan" src="https://github.com/user-attachments/assets/0e80c2f0-dfb9-419b-841d-ecd64d877f63" />


4. **Results screen** — a generated routine card (skin type, concerns, AM/PM routine, ingredients)

<img width="583" height="420" alt="Morning routine" src="https://github.com/user-attachments/assets/430c6e21-9d20-40b0-807a-e030501e7e4b" />

<img width="582" height="420" alt="Night Routine" src="https://github.com/user-attachments/assets/9fb15dac-b837-4d28-8c7d-02b16c361151" />


5. **Routine Check-In** — the feedback form and an updated routine with the "what changed" explanation

<img width="547" height="415" alt="Routine check-in" src="https://github.com/user-attachments/assets/9323797a-1c55-40c7-89f0-6328a8fb0ea5" />

<img width="509" height="420" alt="Routine check-in result" src="https://github.com/user-attachments/assets/41593e58-bd9a-4d3f-b0d4-72ecc7118312" />


6. **Ingredient Checker** — a checked ingredient list with its verdict

<img width="609" height="419" alt="Product ingredient safety checker" src="https://github.com/user-attachments/assets/53d403d6-9265-4fd2-b2c8-ac7856bc8d3c" />

<img width="612" height="419" alt="Safety checker result" src="https://github.com/user-attachments/assets/d8ab6b3e-f2bf-4fdd-a36b-6ff7d904223b" />


## g. How to run this project locally

**Requirements:** Node.js 18+, a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

```bash
# 1. Clone the repository
git clone https://github.com/SanaHumayunpk/ESEM-by-Sana.git
cd ESEM-by-Sana

# 2. Install dependencies
npm install

# 3. Add your Gemini API key
# Create a .env file in the root folder with:
GEMINI_API_KEY=your_api_key_here

# 4. Run in development mode
npm run dev

# 5. Or build and run in production mode
npm run build
npm start
```

The app will be available at `http://localhost:3000`.

**Deploying your own copy on Vercel:**
1. Fork or push this repo to your own GitHub account
2. Import the repo into [Vercel](https://vercel.com)
3. Add `GEMINI_API_KEY` under Project Settings → Environment Variables
4. Deploy — Vercel will pick up the included `vercel.json` and `api/index.ts` automatically

---

## A note on the AI guidance

Everything ESEM generates is **general skincare guidance, not a medical diagnosis**. The app is built to stay in that lane deliberately — every AI response includes a disclaimer, and the system prompt explicitly instructs the model to defer to a dermatologist for anything beyond routine skincare concerns.

---

*Built as a final project — an idea that started as "I keep getting asked what skincare to use" and turned into something I actually want to keep building toward my own brand.*
