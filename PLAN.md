# What a Founder — Implementation Plan

## Starting Point
- Empty git repo on branch `claude/read-external-docs-E4TMu`
- Stack: Next.js 14 (App Router) + Tailwind CSS + Supabase + Vercel
- basePath: `/whatafounder`

---

## Phase 1 — Project Setup & Foundation

### Step 1.1: Scaffold Next.js project
- `npx create-next-app@14` with App Router, Tailwind, TypeScript
- Configure `next.config.js` with `basePath: '/whatafounder'`
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `web-push`, `@vercel/og`
- Create `.env.example` with all required env vars (Supabase, Revolut, Resend, VAPID, APP_URL)
- Create `.env.local` placeholder (gitignored)

### Step 1.2: Supabase client setup
- `lib/supabase/client.ts` — browser client
- `lib/supabase/server.ts` — server client (cookies-based)
- `middleware.ts` — refresh auth session on every request

### Step 1.3: Supabase schema (SQL ready to run)
- Create `supabase/schema.sql` with all 7 tables from spec:
  - `users`, `user_consents`, `questions`, `answers`, `dimension_scores`, `founder_profiles`, `referrals`
- Create `supabase/rls.sql` — all RLS policies
- Create `supabase/seed.sql` — 12 questions seed data
- Create `supabase/auth-trigger.sql` — trigger to create `users` row on signup

### Step 1.4: Project structure
```
app/
  layout.tsx              — root layout, global styles, Supabase provider
  page.tsx                — landing page (/)
  auth/
    check-email/page.tsx  — "Check your email" screen
    callback/route.ts     — magic link callback handler
  (protected)/            — route group with auth middleware
    onboarding/page.tsx
    consent/page.tsx
    today/page.tsx        — daily session
    profile/page.tsx      — founder profile
    settings/page.tsx
  share/[code]/page.tsx   — public share page (no auth)
  types/[slug]/page.tsx   — archetype SEO pages (no auth)
  api/
    session/submit/route.ts
    profile/generate/route.ts
    revolut/create-order/route.ts
    revolut/webhook/route.ts
    push/subscribe/route.ts
    og/profile/[code]/route.tsx
    cron/discount-emails/route.ts
lib/
  supabase/client.ts
  supabase/server.ts
  scoring.ts              — scoring logic from spec Section 9
  templates.ts            — extended report templates from spec Section 10
  archetypes.ts           — archetype definitions + descriptions
  dimensions.ts           — dimension definitions (names, emojis, colors)
  questions.ts            — question type definitions
  constants.ts            — shared constants
components/
  ui/                     — reusable UI primitives
  LikertScale.tsx         — horizontal tappable pills
  ForcedChoice.tsx        — A/B card selection
  ReflectionInput.tsx     — textarea with min char counter
  DimensionBar.tsx        — animated progress bar with emoji
  LockedSection.tsx       — blurred/locked extended report section
  ShareCard.tsx           — share button group
  PWAInstallPrompt.tsx
  PushPermissionPrompt.tsx
```

**Commit:** "Initialize Next.js 14 project with Tailwind, Supabase config, and project structure"

---

## Phase 2 — Auth & Onboarding

### Step 2.1: Magic link auth
- Landing page email input → Supabase `signInWithOtp`
- `/auth/check-email` — confirmation screen
- `/auth/callback/route.ts` — exchange code for session
- Redirect logic: new user → `/onboarding`, returning user → `/today` or `/profile`

### Step 2.2: Auth middleware
- `middleware.ts` — protect `(protected)` routes
- Redirect unauthenticated users to landing page
- Redirect authenticated users away from landing page (to `/today`)

### Step 2.3: Onboarding (3 swipeable screens)
- Step 1: "This isn't a 5-minute quiz"
- Step 2: "5 dimensions, 1 archetype"
- Step 3: "Day 3: your Founder Profile"
- Mark `onboarding_completed = true` in DB
- Skip if already completed (returning users)

### Step 2.4: Consent screen
- Required checkbox: data storage consent
- Optional checkbox: AI processing consent
- Store in `user_consents` table with IP + timestamp
- Continue only when required consent is granted

**Commit:** "Add magic link auth, onboarding flow, and consent screen"

---

## Phase 3 — Daily Session (Core Product)

### Step 3.1: Session routing logic
- `/today` checks `users.current_day` and `last_session_date`
- Day 0 + onboarding done + consent → show Day 1
- Already answered today → "Come back tomorrow" screen
- All 3 days done → "View your Founder Profile" link
- Day 1/2 complete, new day → show next day's session

### Step 3.2: Question components
- `LikertScale` — horizontal pills (1-5 or 1-7), dimension emoji + color header
- `ForcedChoice` — two tappable cards (A/B)
- `ReflectionInput` — textarea, 20 char minimum, character counter
- Shared: progress dots (● ● ○ ○), day/question header, context text

### Step 3.3: Session flow
- Load 4 questions for current day from DB (or hardcoded from spec)
- Present one at a time with animations
- Collect all 4 answers client-side
- Submit as batch POST to `/api/session/submit`

### Step 3.4: Session submit API (`/api/session/submit`)
- Validate: correct day, not already submitted today
- Insert 4 rows into `answers` table
- Score likert/choice answers → `scored_value` (0-1)
- Calculate founder dimension scores → upsert `dimension_scores`
- Update `users`: increment `current_day`, update streak, `last_session_date`
- If Day 3: trigger profile generation (call generate logic inline)
- Return: updated dimension scores + archetype (if Day 3)

### Step 3.5: Session complete screen
- Day 1/2: show dimension bars (animated), teaser text, "Come back tomorrow"
- Day 3: redirect directly to `/profile` (no intermediate screen)

**Commit:** "Add daily session with 3 question types, scoring, and session complete"

---

## Phase 4 — Scoring & Profile

### Step 4.1: Scoring engine (`lib/scoring.ts`)
- `scoreLikert(value, maxScale, reverseScored)` → 0-1
- `scoreChoice(choice)` → 0 or 1
- `calculateFounderDimension(key, psychScores)` → 0-100
- `assignArchetype(dimensionScores)` → archetype object
- All logic from spec Section 9

### Step 4.2: Profile generation (`/api/profile/generate`)
- Called after Day 3 submit
- Compute all 5 dimension scores
- Assign archetype based on top 2 dimensions
- Pull reflection quotes from answers
- Generate template-based extended report content (strengths, growth, cofounder, warnings)
- Insert into `founder_profiles` table
- Generate `referral_code` for share URL
- Generate `discount_token` + 48h expiry for Day 4 email

### Step 4.3: Profile page (`/profile`)
- Basic (free): archetype name + emoji + one-liner, 5 dimension bars, reflection quotes
- Extended (locked): strengths, growth zones, co-founder match, warnings — shown as blurred/locked
- If `has_purchased = true`: show full extended report
- If `?purchased=true` query param: celebration animation
- If `?offer=discount&token=X`: validate token, show €4.99 price

### Step 4.4: Extended report templates (`lib/templates.ts`)
- Strengths: text for dimensions > 65
- Growth zones: text for dimensions < 40
- Co-founder match: based on lowest dimension
- Warnings: conditional on specific score patterns
- All from spec Section 10

**Commit:** "Add scoring engine, profile generation, and profile page with locked sections"

---

## Phase 5 — Payment (Stubbed)

### Step 5.1: Payment UI
- "Unlock Extended Report — €9.99" button on profile page
- Discount variant: "Unlock — €4.99" when valid token present
- Loading state during checkout creation

### Step 5.2: Revolut stub API
- `POST /api/revolut/create-order` — returns mock `checkout_url` (just redirects back to `/profile?purchased=true`)
- `POST /api/revolut/webhook` — accepts webhook payload, logs it
- TODO: REVOLUT tags throughout for real implementation later

### Step 5.3: Purchase flow
- Click → create order → redirect to mock checkout → redirect back with `purchased=true`
- Update `users.has_purchased = true`
- Profile page re-renders with unlocked sections

**Commit:** "Add stubbed Revolut payment flow with UI and mock checkout"

---

## Phase 6 — Push Notifications & PWA

### Step 6.1: PWA setup
- `public/manifest.json` — app name, icons, theme color, start_url with basePath
- Service worker registration (`public/sw.js`)
- Install prompt component — shown after Day 1 complete
- iOS detection + manual install instructions

### Step 6.2: Push notifications
- Pre-permission screen: "Don't forget Day 2" prompt
- If accepted → trigger native browser permission prompt
- `POST /api/push/subscribe` — store subscription in `users.push_subscription`
- Push sending logic (server-side, `web-push` library)
- Day 2 + Day 3 morning notifications only
- TODO: cron trigger for scheduled sends

**Commit:** "Add PWA manifest, service worker, install prompt, and push notification flow"

---

## Phase 7 — Share & Growth Loops

### Step 7.1: OG share card
- `/api/og/profile/[code]/route.tsx` — generates card image with @vercel/og
- Shows: archetype name, 5 dimension bars, CTA
- Proper OG meta tags on share page

### Step 7.2: Public share page (`/share/[code]`)
- Displays profile card (no auth required)
- "Discover your founder type →" CTA → links to landing page
- OG meta tags for social previews

### Step 7.3: Share buttons on profile
- Twitter/X, LinkedIn, Copy Link, Download Image
- Co-founder invite link (tracks in `referrals` table)

**Commit:** "Add share card generation, public share page, and share buttons"

---

## Phase 8 — Landing Page & Polish

### Step 8.1: Landing page
- Hero + email CTA
- 6 archetype grid (icons + names + one-liners)
- "How it works" (3 steps)
- 5 dimensions section
- Science section
- Final CTA
- Footer

### Step 8.2: Settings page
- Email (read-only)
- Consent toggles
- Push notification toggle
- Purchase info
- Delete account (hard delete: all user data)

### Step 8.3: Archetype SEO pages (`/types/[slug]`)
- 6 static pages with placeholder content
- TODO: CONTENT tags for real copy later

### Step 8.4: Legal placeholders
- Privacy Policy page — TODO: LEGAL
- Terms of Service page — TODO: LEGAL

### Step 8.5: Day 4 discount email cron (stubbed)
- `/api/cron/discount-emails` — finds eligible users, console.logs email
- TODO: RESEND tag for real email sending

**Commit:** "Add landing page, settings, archetype pages, legal placeholders, and discount cron stub"

---

## Phase 9 — Mobile QA & Final Polish

### Step 9.1: Mobile responsiveness
- All screens tested at 375px width
- Touch targets ≥ 44px
- Likert pills properly spaced on small screens

### Step 9.2: Run through 14 acceptance checks
1. New user flow: landing → magic link → onboarding → consent → Day 1
2. Day 1: 3 questions + reflection → 3 dimension bars
3. Day 1 revisit: "Come back tomorrow"
4. Day 2: session → 5 dimension bars
5. Day 3: session → profile reveals directly
6. Profile: archetype + dimensions + reflections + locked sections
7. Payment stub works (€9.99 → purchased → unlocked)
8. Discount token validates (€4.99)
9. Share card generates (OG image)
10. Push notification permission flow works
11. PWA install prompt works
12. All screens work at 375px mobile
13. Returning user bypasses onboarding
14. Delete account works

**Commit:** "Final polish and mobile responsiveness"

---

## Summary

| Phase | What | Commit |
|-------|------|--------|
| 1 | Project setup, Supabase config, file structure | Init project |
| 2 | Auth, onboarding, consent | Auth flow |
| 3 | Daily session, questions, scoring, submit | Core session |
| 4 | Scoring engine, profile generation, profile page | Profile |
| 5 | Payment UI + Revolut stub | Payment stub |
| 6 | PWA + push notifications | PWA & push |
| 7 | Share card + growth loops | Share |
| 8 | Landing page, settings, SEO pages, legal | Polish |
| 9 | Mobile QA + acceptance tests | Final |

Each phase builds on the previous. No phase has external blockers (Revolut and Resend are stubbed). The entire app can be built and tested locally with just Supabase credentials.
