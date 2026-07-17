# AGENT.md — SwipeHabit

## Role
You are the engineering agent building **SwipeHabit**, a mobile-only, swipe-based habit tracker PWA. You write production-quality JavaScript / React, follow the schema below exactly, and do not invent architecture that isn't specified here. If something is ambiguous, ask — don't assume.

---

## Product Summary
One habit = one question on a card. The user answers by swiping.

- **Swipe right** → Yes (`status: true`)
- **Swipe left** → No (`status: false`)
- **Chevron button** → Skip. Card moves to the **end of today's deck**, revisited later in the same session. No log is written on skip.
- **No tap, no drag-to-reveal, no long-press.** Three gestures only: left, right, chevron-skip.
- **Unanswered at end of day = No.** If a habit's card is never swiped (deck abandoned, app closed, whatever), it counts as `false` for that `log_date`. This is computed at read-time by absence of a row — **no cron job, no background worker.** A missing `(habit_id, log_date)` row for a past date is implicitly "No."

---

## Platform
- **Mobile only.** Do not design or reason about desktop breakpoints, hover states, or wide layouts. Every screen is a phone viewport.
- **PWA**, installable, offline-shell via Serwist.
- No analytics SDK, no third-party tracking. The "Analytics" icon refers to the in-app stats screen only (see below).

---

## Stack
- **Next.js 15**, App Router
- **Supabase** — Postgres + RLS + Google OAuth (PKCE flow)
- **framer-motion** — swipe gesture + card transitions
- **Recharts** — analytics bar charts
- **Serwist** — PWA/offline shell
- **Vercel** — deploy target
- **JS** throughout. JSDoc-style comments allowed where logic isn't self-evident (max 2 lines per comment).

---

## Database Schema (authoritative — do not modify)

```sql
create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,               -- short label, e.g. 'Hit Gym'
  question    text not null,               -- the text shown on the card
  sort_order  int  not null default 0,     -- deck order
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  habit_id   uuid not null references public.habits(id) on delete cascade,
  log_date   date not null,                -- the LOCAL day this answers
  status     boolean not null,             -- true = yes (right), false = no (left)
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)              -- enforces one answer per habit per day
);
```

**Rules that follow from this schema:**
- Writes are `upsert` on `(habit_id, log_date)` — if a write for the same habit/date arrives twice (network retry, app crash + resume), the second write overwrites the first. This prevents duplicate rows, not duplicate swipes (cards are removed from deck after swiping, so users can't tap them twice in a session).
- `log_date` is the **user's local date**, not UTC server date. Compute it client-side before sending, or pass timezone offset — don't let Postgres `now()` decide the day.
- RLS: every query filters by `auth.uid() = user_id`. Never trust client-supplied `user_id`.
- `active = false` on a habit removes it from the deck but preserves historical `habit_logs` — this is a soft delete, not a hard delete, for analytics integrity.

---

## Screens / Routes

### 1. `/` — The Deck (home)
- Stack of cards, one per active habit, ordered by `sort_order`.
- Card shows `question` text.
- Swipe right/left writes to `habit_logs`, **removes the card from the deck immediately** — it does not reappear for the rest of today's session.
- Chevron button sends current card to the back of today's in-memory deck order (does not touch `sort_order` in DB — this is session-local resequencing only).

#### Card Removal (Once Swiped)
- A swiped card (left or right) is **removed from the deck immediately** — it does not reappear for the rest of today's session.
- **Session-local state only.** Do not reorder or hide rows in the database.
- Implementation: maintain an in-memory `Set<habitId>` of answered habits for today. After each swipe, add the `habit_id` to this Set. Filter the visible deck to exclude these IDs.
- User refreshes or closes app? Deck resets to show all unanswered habits for today (recomputed from DB on load).

#### Done State: "All Went Well for the Day"
- When all active habits have been swiped (the in-memory deck is empty), replace the card stack with a done state.
- **Copy:** "All Went Well for the Day" — calm, affirming, not urgent or gamified.
- **UI:** centered, full screen, muted colors, single icon (checkmark, plant, sunrise). No confetti, no notifications, no share CTAs.
- Show the local date, e.g., "Monday, January 15 — all done."
- Optional: provide a button to dismiss and return to home, or user can just close the app (deck state is preserved in memory for the session).

### 2. `/questions` — Manage Questions
- Full CRUD on `habits`: list, add, edit, delete (delete = set `active = false`).
- List should respect `sort_order`; allow reordering if time permits (stretch, not MVP-blocking).
- Add form: `title` + `question` fields. Both required per schema (`not null`).

### 3. `/analytics` — Stats
- Four views: **Today, Weekly, Monthly, Overall.**
- Each is a completion-rate bar chart (Recharts), matching this pattern: bars per period-unit (day for weekly, etc.), average % shown top-right, label row underneath (see attached reference image style — dark card, muted green bars, day-initial labels).
- Completion % = `(count of status=true) / (count of active habits expected to answer)` for that period, accounting for the "unanswered = No" rule.
- **Today**: single-day snapshot, likely a simpler stat block, not a 7-bar chart (adapt from the weekly pattern — one bar or a ring, your call, ask if unsure).
- **Weekly**: 7 bars (M–S), matches reference image exactly — avg % top-right, day-initial labels bottom.
- **Monthly**: bars aggregated by week-of-month or by day depending on space constraints — ask before deciding.
- **Overall**: lifetime aggregate, likely month-over-month bars.

### Top Navigation
Three icons, top-middle of screen, in this exact order:
1. **Write Question icon** → navigates to `/questions`
2. **Theme Toggle icon** → cycles theme
3. **Analytics icon** → navigates to `/analytics`

### Theme
- Default = **system** (respects OS light/dark on first load).
- Toggle icon lets user override to light/dark/system explicitly. Persist choice (Supabase user preference row or local device storage — local storage is fine here since it's a UI preference, not app data).

---

## Authentication (Google OAuth via Supabase)

### Flow
1. User taps "Sign in with Google" on the login screen.
2. Supabase redirects to Google's OAuth consent screen (PKCE flow, handles token refresh automatically).
3. User grants permission. Supabase exchanges the code for a session token.
4. Session is stored in browser's `localStorage` (encrypted, Supabase handles it).
5. **All subsequent API calls include the session token in the `Authorization: Bearer <token>` header.** Supabase SDK does this automatically.
6. Supabase validates the token server-side. If valid, `auth.uid()` is available in RLS policies.

### Implementation
**Client-side (login screen):**
```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function signInWithGoogle() {
  // PKCE flow built in; Supabase handles token refresh on app resume.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
}
```

**OAuth callback route (`/auth/callback`):**
```javascript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // Supabase automatically exchanges code for session, stores in localStorage.
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home after session is set.
  return NextResponse.redirect(new URL("/", request.url));
}
```

**Check auth state (in Server Component):**
```javascript
// app/page.tsx (Server Component)
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // user.id is available; use it for queries filtered by RLS.
  return <HabitDeck userId={user.id} />;
}
```

### Session Persistence (PWA)
- Supabase SDK stores the session in `localStorage` automatically.
- On app resume (PWA installed, user re-opens), `getUser()` returns the cached session without a network call.
- If the session is expired (token older than 1 hour by default), `getUser()` refreshes it silently using the refresh token.
- **No manual session sync needed.** Supabase handles it.

### RLS (Row Level Security) — Enforces User Isolation
Every `habits` and `habit_logs` query must be scoped to the authenticated user.

**Example RLS policy on `habits` table:**
```sql
create policy "users_can_only_see_own_habits"
  on public.habits
  for select
  using (auth.uid() = user_id);

create policy "users_can_only_insert_own_habits"
  on public.habits
  for insert
  with check (auth.uid() = user_id);

create policy "users_can_only_update_own_habits"
  on public.habits
  for update
  using (auth.uid() = user_id);

create policy "users_can_only_delete_own_habits"
  on public.habits
  for delete
  using (auth.uid() = user_id);
```

**Same policies apply to `habit_logs`.** Without these, a malicious client could query another user's data by guessing their UUID. RLS makes this impossible.

**Client-side query (after RLS is in place):**
```javascript
// No need to filter by user_id; RLS does it automatically.
const { data: habits, error } = await supabase
  .from("habits")
  .select("*")
  .eq("active", true);

// Even if you try: .eq("user_id", "someone-elses-uuid"), RLS blocks it.
```

### Logout
```javascript
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  // localStorage is cleared. Session gone. Redirect to /login.
}
```

### Key Rules
- **Never trust client-supplied `user_id`.** Always derive it from `auth.uid()` server-side.
- **RLS is not optional.** If a policy is missing from a table, Supabase defaults to denying all access — good default, but you must explicitly allow reads/writes.
- **Tokens expire.** Supabase auto-refreshes them. If a refresh fails (user revoked Google access), `getUser()` returns `null`. Redirect to login.
- **Test RLS in development.** Try querying as a different user UUID; RLS should reject it. If it doesn't, your policy is broken.

---

## PWA (Progressive Web App) — Installation & Offline

### The Three Pieces


**1. Manifest (`public/manifest.json`)**
- Defines app metadata: name, icon, colors, display mode.
- Browser reads this to decide if PWA is installable.
- Appears on "Add to Home Screen" prompt.

**2. Service Worker (Serwist)**
- Intercepts all network requests from the app.
- Caches responses on first load.
- Serves cached responses when offline.
- Keeps the app shell (HTML, JS, CSS) fresh, but caches it aggressively.

**3. Browser Prompt**
- After service worker installs, browser automatically shows "Add to Home Screen" prompt (iOS/Android).
- User taps → icon added to home screen → app opens in fullscreen, looks native.

### Implementation

**Manifest (`public/manifest.json`):**
```json
{
  "name": "SwipeHabit",
  "short_name": "Habits",
  "description": "Tinder-style habit tracker",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff"
}
```

**Link manifest in `app/layout.tsx`:**
```javascript
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Service Worker (Serwist) in `next.config.ts`:**
```javascript
import { withSerwistInit } from "@serwist/next";

const nextConfig = {
  // ...existing config
};

export default withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
})(nextConfig);
```

**Service Worker code (`app/sw.ts`):**
```javascript
// Serwist handles caching automatically.
// On first load: caches all static assets (JS, CSS, icons, fonts).
// On subsequent loads: serves from cache if available, falls back to network.
// When offline: returns cached responses. If no cache, shows offline fallback.

import { defaultHandler, NavigationRoute, cleanupOutdatedCaches } from "serwist";
import { registerRoute } from "serwist/legacy";

// Cache CSS, JS, fonts, images aggressively.
registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "font" ||
    request.destination === "image",
  new CacheFirst({
    cacheName: "static-assets",
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// API calls (Supabase) use network-first: try network, fall back to cache.
registerRoute(
  ({ url }) => url.origin === "your-supabase-project.supabase.co",
  new NetworkFirst({
    cacheName: "api-cache",
    networkTimeoutSeconds: 5, // Wait 5s, then use cache if available.
  })
);

// Clean up old caches on update.
cleanupOutdatedCaches();
```

### How Installation Works (User Flow)

1. **First visit:** User opens `https://swipenabits.vercel.app` in browser.
2. **Vercel serves app:** Next.js HTML + JS + Serwist service worker are delivered.
3. **Service worker installs:** Serwist runs `install` event, caches all static assets locally.
4. **Browser detects PWA:** Browser reads `manifest.json`, sees service worker is installed.
5. **Installation prompt:** Browser shows "Add to Home Screen" prompt (automatic on Android, manual on iOS via share menu).
6. **User taps "Add":** App icon appears on home screen.
7. **App opens from icon:** User taps icon → app launches in fullscreen, looks native. No browser chrome.
8. **Offline works:** Service worker intercepts requests, serves cached responses.
9. **Online sync:** When connection available, Supabase API calls resume, habit logs sync.

### Offline Behavior
- **App shell (UI):** Always cached, always works offline.
- **Habit data (read):** Cached from last sync. User can view yesterday's habits even without internet.
- **Habit data (write):** Queued locally, synced when online (handled by Supabase SDK + service worker network-first strategy).
- **No syncing indicator yet:** For MVP, assume good connectivity. Add a "syncing..." indicator later if needed.

### Key Configuration
- **Service Worker file:** must be at `public/sw.js` (Serwist handles compilation from `app/sw.ts`).
- **Manifest:** must be at `public/manifest.json`.
- **Icons:** must be at `public/icon-192.png` and `public/icon-512.png` (create these as part of design assets).
- **HTTPS only:** PWA requires HTTPS (Vercel provides this by default; localhost works too for dev).

### Testing PWA (Local Dev)
```bash
npm run build
npm run start
# Navigate to http://localhost:3000 in Chrome DevTools > Application > Service Workers
# You should see the service worker registered and running.
```

---
- Desktop/responsive web layout
- Any analytics SDK (Plausible, Fathom, GA, etc.) — "Analytics" = the in-app stats screen only
- Tap-to-expand, drag-reveal, long-press, or any gesture beyond swipe L/R + chevron skip
- Undo (not requested — don't add it speculatively)
- Notifications, social sharing, cloud sync beyond Supabase's native sync
- Cron jobs / scheduled functions for the midnight "No" logic — this must stay a read-time computation

---

## Working Style
- Ship one full vertical slice before moving to the next: deck screen working end-to-end (swipe → write → refetch) before touching `/questions` or `/analytics`.
- Comments: max 2 lines, explain *why*, not *what*.
- If a requirement here is ambiguous (e.g. monthly chart granularity), **ask before assuming.**
- Don't introduce new tables, columns, or libraries not listed above without flagging it first.

---

**Status:** Locked spec, ready to build.
**Platform:** Mobile PWA only.
**Gestures:** Swipe left, swipe right, chevron skip. Nothing else.