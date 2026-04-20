# Sadhana — App Scaffold

*Paste this into Claude Code (VS Code) as the implementation spec. It covers every screen, both user states, data requirements, and design direction.*

---

## Overview

Sadhana is a yoga and spiritual practice companion app. The free tier is a complete learning experience. The paid tier (future) adds personalized daily practice.

Two user states exist throughout the app:
- **Anonymous** — no auth session. Can browse all content, take the dosha quiz (results stored locally in Zustand), and complete lessons (progress not persisted). Signup prompts appear contextually.
- **Authenticated** — Supabase auth session. Full personalization: intentions, mood tracking, progress persistence, dosha-based recommendations.

**Tech stack:** Expo SDK 54, React Native 0.81, Expo Router v6, Zustand, Supabase, TypeScript.

**Design system:** Warm, earthy palette. Use existing tokens from `constants/theme.ts`:
- `colors.sand` (#F5F0E8) — primary background
- `colors.clay` (#C4956A) — warm accent, CTAs
- `colors.earth` (#5C4033) — primary text, dark cards
- `colors.sage` (#7A8B6F) — success, progress bars
- `colors.terracotta` (#C75B39) — alerts, important actions
- `colors.sandLight`, `colors.sandDark`, `colors.earthDark`, `colors.clayLight`, `colors.earthMuted` — supporting shades

---

## Entry flow — Candle ritual

**File:** `app/(main)/intention.tsx` (already exists)
**Component:** `components/Candle.tsx` (already exists)

### Behavior
- On app open, check AsyncStorage for key `lastIntentionTimestamp`
- If null or > 24 hours ago → show intention screen
- If < 24 hours ago → skip directly to Today screen
- Works identically for anonymous and authenticated users (AsyncStorage is device-local)

### Screen layout
1. **App name** — "Sadhana" in large, light-weight font (sand color on earthDark background). Centered above the greeting. Understated — not a logo, just the word.
2. **Greeting** — "Good morning/afternoon/evening, {display_name}" (or just "Good morning" for anonymous). Already implemented.
3. **Subtitle** — "Set your intention and light the candle"
4. **Candle** — existing animated candle component. Tap to light.
5. **Quote** — fades in after candle is lit. From `quotes` table (public read, works for both user states).
6. After 3 seconds, screen fades out and navigates to Today.
7. Save `Date.now()` to AsyncStorage key `lastIntentionTimestamp`.

### Changes needed
- Add "Sadhana" title text above the greeting
- Add AsyncStorage timestamp check in root layout (`app/(main)/_layout.tsx`) to gate whether intention screen shows
- The existing implementation handles most of this already — mainly need the 24-hour gating logic

---

## Tab 1 — Today

**File:** `app/(main)/home.tsx`

### Anonymous state

**Sections (top to bottom):**

1. **Greeting**
   - "Namaste"
   - Subtitle: "Your practice begins here."

2. **Begin your journey card**
   - Clay background, sand text
   - Headline: "Explore the 8 Limbs of Yoga"
   - Subtitle: "Start learning with no account needed"
   - Button: "Start learning →" → navigates to Journey tab

3. **Dosha quiz teaser**
   - Outlined card with dashed clay border
   - Headline: "Discover your dosha"
   - Subtitle: "Take a 2-minute quiz to unlock personalized practice recommendations."
   - Button: "Take the quiz" → navigates to dosha quiz screen
   - If quiz already taken (check Zustand), show results summary instead

4. **Quote**
   - Random quote from `quotes` table where `is_active = true`
   - Body in italic, source below, centered

### Authenticated state

**Sections (top to bottom):**

1. **Greeting**
   - "Namaste, {display_name}"
   - Subtitle: "What calls to your practice today?"

2. **Daily intention**
   - Card with 3px left border in clay color, `border-radius: 0` (single-sided border)
   - Label: "TODAY'S INTENTION" (small, uppercase, clay color)
   - If intention exists for today → show in italic
   - If not → show tappable text "Set your intention for today" → inline text input, save on submit
   - Data: `daily_intentions` table, upsert on `(user_id, date)` unique constraint

3. **How are you feeling?**
   - Label: "How are you feeling?" (small, uppercase)
   - Row of 4 equal-width buttons: Energized, Restless, Heavy, Balanced
   - Tapping one saves to `daily_intentions.mood` column via upsert
   - If mood already set today, pre-select that button (highlighted: clay background, white text)

4. **Recommended practice** (hero card)
   - Dark earth background, largest element on screen
   - Label: "RECOMMENDED PRACTICE" (small, uppercase, clay)
   - Practice title (large, sand color)
   - Description (one line, muted)
   - Metadata: duration + type + difficulty
   - Dosha and chakra tags as small pills
   - Button: "Begin practice" (clay background, white text) → navigates to practice detail
   - Logic: fetch one practice from `practices` where user's primary dosha (from most recent `dosha_results`) has the highest score in `dosha_affinity` JSONB
   - If no dosha results → show a generic beginner practice and add note: "Take the dosha quiz for personalized recommendations"

5. **Continue learning**
   - Label: "CONTINUE LEARNING" (small, uppercase)
   - Single card showing next uncompleted lesson
   - Left icon: module's first Sanskrit character or number, in earth-colored circle
   - Lesson title (bold), path + module name (small, clay), progress bar (sage fill)
   - Arrow button → navigates directly to that lesson
   - Logic: query `user_progress` for completed lesson IDs, find first uncompleted lesson by `sort_order` in the user's most recent active module
   - If no progress exists → "Begin your journey" card linking to Journey tab
   - If all lessons complete → congratulatory message

6. **Journal button**
   - Small, subtle link-style button: "Write in your journal"
   - Opens journal writing screen/modal for freeform entry

7. **Quote**
   - Same as anonymous state

### What to remove
- Remove ALL learning path cards (8 Limbs, Chakras, Mantras, Mudras, Sanskrit) from this screen. Those live in the Journey tab.

---

## Tab 2 — Journey

**File:** `app/(main)/journey.tsx`

### Layout (same for both user states)

1. **Screen title** — "Your journey"

2. **Active path hero** (if authenticated and has progress; otherwise first published path)
   - Earth background card
   - Sanskrit name (small, clay, uppercase)
   - Path name (large, sand)
   - Description (muted, 1-2 lines)
   - Progress bar with "X / Y lessons" label (authenticated only — anonymous users don't see progress)

3. **Module list** (within the active path)
   - Vertical list of module cards
   - Each shows: number circle (left), module name, subtitle (e.g. "Ethical disciplines"), lesson count or "Coming soon"
   - Active module (the one with uncompleted lessons) has clay border highlight
   - Completed modules show green checkmark instead of arrow
   - Tapping a module navigates to `app/(main)/path/[moduleSlug].tsx`
   - Modules without lessons show "Coming soon" in muted text, arrow is grayed out, not tappable

4. **More paths section**
   - Label: "MORE PATHS" (small, uppercase)
   - Smaller cards for other paths from `paths` table where `is_active = true`
   - Each shows: icon, path name, subtitle, "Coming soon" badge if no modules/lessons exist yet
   - These are just rows in the `paths` table — add new ones anytime via Supabase

### Data
- `paths` where `is_active = true`, ordered by `sort_order`
- `modules` where `path_id` matches, ordered by `sort_order`
- `user_progress` joined to `lessons` for completion counts (authenticated only)

---

## Module detail screen

**File:** `app/(main)/path/[moduleSlug].tsx` (already exists)

### Layout

1. **Back button** — "← {path name}" (clay color)

2. **Module header**
   - Module name (large)
   - Sanskrit name + subtitle (e.g. "यम · Ethical disciplines")
   - Description text

3. **Lesson list**
   - All lessons listed vertically, all tappable (unlocked — users can jump to any)
   - Each lesson card shows:
     - Left dot: checkmark (done, sage), arrow (next suggested, clay), empty circle (not started, muted)
     - Lesson title
     - Subtitle
     - Metadata row: estimated time + action type badges (quiz, challenge, journal)
   - The "next" lesson (first uncompleted by sort_order) has a highlighted border (clay)
   - For anonymous users: no completion dots shown (nothing to track), all lessons look the same

### Data
- `lessons` where `module_id` matches, ordered by `sort_order`
- `user_progress` for completion state (authenticated only)

---

## Lesson detail screen

**File:** Create `app/(main)/lesson/[lessonSlug].tsx`

### Layout — sequential flow, not tabs

The lesson is a single scrollable screen with sections that flow into each other:

1. **Teaching content**
   - Render the `teaching_content` JSONB blocks
   - Block types: `text` (paragraph), `highlight` (emphasized card with clay left border)
   - Scroll through at the user's pace

2. **Quiz section** (always present)
   - Appears after teaching content with a subtle divider
   - Question text
   - Tappable option buttons (single select)
   - On answer: highlight correct (sage) and incorrect (terracotta), show explanation text below
   - User must answer to proceed (but can answer incorrectly)

3. **Challenge section** (always present)
   - Appears after quiz
   - Challenge title + description
   - Duration indicator (e.g. "24-hour challenge")
   - "Accept challenge" button — marks it as acknowledged
   - This is a commitment, not something completed in-app

4. **Journal reflection** (optional)
   - Appears after challenge
   - Prompt text shown in italic
   - Text input area
   - "Save reflection" button + "Skip" option
   - For authenticated users: saves to `journal_entries` with `lesson_id` reference
   - For anonymous users: "Save reflection" triggers the signup prompt modal

5. **Completion**
   - After finishing all sections, show a brief completion state
   - For authenticated users: save to `user_progress` with `action_response` containing quiz answer and journal text
   - For anonymous users: show signup prompt modal ("Save your progress") — once per session only
   - "Back to module" button

### Data
- `lessons` by slug for content
- `user_progress` insert on completion (authenticated)
- `journal_entries` insert for reflections (authenticated)

---

## Tab 3 — Library

**File:** `app/(main)/library.tsx`

### Layout (same for both user states)

1. **Screen title** — "Library"

2. **Toggle** — "I need..." (default) / "Browse" — pill toggle at the top

3. **Needs-based view** (default)
   - Label: "What do you need right now?"
   - Grid of 6 tappable buttons (3x2): Calm, Energy, Grounding, Focus, Release, Rest
   - Tapping one filters practices where `emotional_needs` JSONB array contains that value
   - Selected button gets highlighted state (earth background, sand text)
   - Results list below showing matching practices

4. **Browse view**
   - Horizontal scrolling type chips: All, Asana, Pranayama, Meditation, Dharana
   - Filters practices by `type` enum
   - "All" selected by default

5. **Practice cards** (shared by both views)
   - Each card shows: type icon (left, colored circle), practice name, short description, metadata pills (type, duration, difficulty)
   - Arrow on right → navigates to practice detail
   - For authenticated users with dosha results: could show dosha compatibility, but not required for v1

6. **Recommended reading section** (below practices in both views)
   - Label: "RECOMMENDED READING"
   - Cards from `resources` table where `is_active = true`
   - Each shows: book icon, title, author, curator_note in italic, path tag pill
   - In needs-based view: show resources matching the category of the selected need (optional — can just show all)
   - In browse view: show all resources, optionally filtered by category matching the selected type chip
   - Tapping a resource with a URL could open it externally

### Data
- `practices` filtered by `emotional_needs` or `type`
- `resources` where `is_active = true`, ordered by `sort_order`

---

## Tab 4 — Profile

**File:** `app/(main)/profile.tsx`

### Anonymous state

1. **Screen title** — "Profile"

2. **Hero section** (centered)
   - Large icon/circle (muted)
   - "Your practice, saved"
   - Description: "Create a free account to track your progress, save journal reflections, and get personalized recommendations."
   - Button: "Create free account" (clay background) → navigates to signup screen
   - Link: "Already have an account? Sign in" → navigates to login screen

3. **Dosha quiz teaser**
   - Same dashed-border card as Today anonymous state
   - "Discover your dosha" + "Take the quiz" button

4. **Feature list**
   - "What you'll unlock" label
   - Checkmark list: save progress, set intentions, track mood, private journal, personalized recommendations

### Authenticated state

1. **Screen title** — "Profile"

2. **User header**
   - Avatar circle with initial (earth background, sand text)
   - Display name (large)
   - "Practicing since {month year}" (from `profiles.created_at`)
   - Tier badge: "Free" (sage background)

3. **Stats row** (3 equal cards)
   - **Lessons** — count of `user_progress` rows
   - **Day streak** — computed from consecutive days with `user_progress.completed_at` entries
   - **Minutes** — sum of `practices.duration_minutes` for completed practices (or estimated_minutes from lessons)
   - Streak value in clay color for emphasis

4. **Dosha card**
   - Earth background (like Today's practice card)
   - Label: "YOUR CONSTITUTION"
   - Dosha type name (e.g. "Vata-Pitta")
   - Short description
   - Three horizontal bars showing vata/pitta/kapha scores from `dosha_results`
   - "Retake quiz →" link at bottom
   - If no quiz taken: show the quiz teaser card instead

5. **Settings section**
   - Label: "SETTINGS"
   - Grouped list items with borders:
     - Edit profile → (future)
     - Subscription → shows "Free"
     - Notifications → (future)
   - Sign out button (terracotta text, outlined card)

### Data
- `profiles` for name, tier, created_at
- `user_progress` for lesson count and streak calculation
- `dosha_results` for most recent quiz scores

---

## Practice detail screen

**File:** Create `app/(main)/practice/[practiceSlug].tsx`

### Layout (placeholder — build basic version)

1. **Back button**
2. **Practice title** (large)
3. **Metadata** — type, duration, difficulty, dosha affinity tags
4. **Description**
5. **Instructions** — render `practices.instructions` JSONB array as a step-by-step list
   - Each step: step number, name, description, duration in seconds
   - Optional: timer that counts down per step
6. **Begin / Complete buttons**
   - For authenticated users: completion could be logged (future: `practice_logs` table)
   - For anonymous users: just a visual completion state, nothing persisted

---

## Dosha quiz screen

**File:** Create `app/(main)/quiz.tsx`

### Layout (placeholder — build basic version)

1. **Header** — "Discover your dosha" + progress indicator (e.g. "3 / 10")
2. **Question card** — question text from `dosha_questions` table, ordered by `sort_order`
3. **Options** — tappable buttons, each with `vata_score`, `pitta_score`, `kapha_score` in the JSONB
4. **Navigation** — Next button (enabled after selecting an option), back button
5. **Results screen** — after final question:
   - Calculate totals for each dosha
   - Show primary dosha (and secondary if close)
   - Visual bars for each score
   - Brief description of their type
   - For authenticated users: save to `dosha_results` table, update `profiles.dosha_result`
   - For anonymous users: save to Zustand store only. On future signup, persist to `dosha_results`

### Data
- `dosha_questions` ordered by `sort_order` (public read)
- `dosha_results` insert (authenticated only)

---

## Journal screen/modal

**File:** Create `components/JournalModal.tsx` or `app/(main)/journal.tsx`

### Entry points
1. From Today screen — "Write in your journal" button (freeform)
2. After lesson completion — triggered for reflection/journal actions (prompted)

### Layout

1. **Header** — "Journal" or the lesson's journal prompt if coming from a lesson
2. **Prompt text** (if from a lesson) — shown in italic above the input
3. **Text input** — multi-line, auto-expanding
4. **Mood selector** (optional) — small row of mood options (calm, restless, grateful, etc.)
5. **Save button** → saves to `journal_entries`:
   - `user_id` — current user
   - `lesson_id` — if coming from a lesson, otherwise null
   - `prompt` — the prompt text if applicable
   - `body` — user's text
   - `mood` — selected mood or null
6. **Cancel / Skip** — dismisses without saving

---

## Signup / Login screen

**File:** `app/(auth)/login.tsx` (already exists)

### Changes needed
- Add "Welcome to Sadhana" header
- Warm, inviting tone — not corporate
- Email + password fields
- "Create account" primary button
- "Sign in" toggle for existing users
- On successful signup:
  - Profile auto-created by existing `handle_new_user()` trigger
  - If dosha quiz results exist in Zustand → persist to `dosha_results` table
  - Navigate to Today (now authenticated)

---

## Signup prompt modal

**File:** Create `components/SignupPrompt.tsx`

### Behavior
- Appears after lesson completion when user is anonymous
- Only shown once per session (track with Zustand flag `hasSeenSignupPrompt`)
- Bottom sheet or centered modal

### Layout
- Headline: "Save your progress"
- Body: "Create a free account to track your journey, set daily intentions, and get personalized recommendations."
- Primary button: "Create account" → navigates to login screen
- Text button: "Not now" → dismisses, returns to module detail

---

## Store additions (lib/store.ts)

Add these methods to the Zustand store:

```typescript
// --- Daily intention + mood ---
fetchDailyIntention: (date: string) => Promise<void>
// Query daily_intentions where user_id = current user AND date = today

upsertIntention: (intention: string) => Promise<void>
// Upsert into daily_intentions with user_id + today's date

upsertMood: (mood: 'energized' | 'restless' | 'heavy' | 'balanced') => Promise<void>
// Upsert mood column on daily_intentions with user_id + today's date

// --- Practice recommendation ---
fetchRecommendedPractice: () => Promise<void>
// 1. Get user's primary dosha from most recent dosha_results
// 2. Fetch practices, pick one where dosha_affinity[primaryDosha] is highest
// 3. If no dosha result, return any beginner practice

// --- Continue learning ---
fetchNextLesson: () => Promise<void>
// 1. Get completed lesson IDs from user_progress
// 2. Find the module user was most recently in
// 3. Find first uncompleted lesson by sort_order
// 4. Join to get module name, path name, total/completed counts

// --- Quote ---
fetchRandomQuote: () => Promise<void>
// Fetch all active quotes, pick one randomly client-side

// --- Resources ---
fetchResources: (pathId?: string, category?: string) => Promise<void>
// Query resources, optionally filtered by path_id or category

// --- Library filtering ---
fetchPracticesByNeed: (need: string) => Promise<void>
// Query practices where emotional_needs JSONB contains the need value

fetchPracticesByType: (type?: string) => Promise<void>
// Query practices filtered by type enum, or all if no type

// --- Anonymous dosha quiz ---
localDoshaResult: { vata: number, pitta: number, kapha: number } | null
// Stored in Zustand for anonymous users, persisted to dosha_results on signup

// --- Signup prompt ---
hasSeenSignupPrompt: boolean
// Prevents showing the signup modal more than once per session
```

---

## Schema reference

Current tables (already in Supabase):
- `profiles` — user data, tier, dosha_result
- `paths` — learning paths (8 Limbs, future: Chakras, Mantras, etc.)
- `modules` — units within a path (Yama, Niyama, etc.)
- `lessons` — teaching content + actions (quiz, challenge, journal)
- `practices` — guided asana, pranayama, meditation, dharana
- `dosha_questions` — quiz questions with scoring
- `dosha_results` — user quiz results with per-dosha scores
- `user_progress` — lesson completion tracking
- `journal_entries` — user reflections
- `daily_sadhana` — personalized daily practice (future paid tier)
- `daily_intentions` — daily intention text + mood
- `quotes` — rotating quotes
- `resources` — curated reading recommendations (NEW)

Key relationships:
- `paths` → `modules` → `lessons` (learning hierarchy)
- `practices` are standalone, linked to modules optionally
- `resources` are standalone, linked to paths optionally
- `user_progress` links users to completed lessons
- `dosha_results` links users to quiz outcomes
- `daily_intentions` is one row per user per day (intention + mood)

---

## Implementation order

Suggested build sequence:

1. **Root layout + candle gating** — add 24-hour AsyncStorage check
2. **Today screen** — anonymous state first, then authenticated
3. **Journey tab** — path list + module navigation
4. **Module detail** — lesson list with completion states
5. **Lesson detail** — teaching content + quiz + challenge + journal flow
6. **Signup prompt modal** — triggered after lesson completion for anonymous users
7. **Library tab** — needs-based view first, then browse view
8. **Profile tab** — authenticated state first, then anonymous
9. **Practice detail** — step-by-step instructions (placeholder)
10. **Dosha quiz** — question flow + results (placeholder)
11. **Journal modal** — freeform + prompted entry points
12. **Login/signup** — add Sadhana branding, persist local dosha results on signup

---

## Future (do not build now)

- Paid tier: personalized daily sadhana, multi-week plans, practice logging with felt_before/felt_after
- Additional paths: Chakras, Mantras, Mudras, Sanskrit, Ayurveda (just add rows to `paths` table when ready)
- Taxonomy tables (doshas, chakras, koshas, yoga_limbs as reference tables with FKs) — add when building the personalization engine
- Recipes table — add when building the Ayurveda path
- Advanced practice prerequisites (prerequisite_id chain) — add when gating paid content
- Streak notifications
- is_free flags for premium gating — flags already exist on modules, lessons, practices
