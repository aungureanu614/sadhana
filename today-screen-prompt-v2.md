Redesign the Today screen (app/(main)/home.tsx) to support two states: anonymous (no auth session) and authenticated. The Today screen's job is to be a daily touchpoint that answers "what should I do right now?"

Remove ALL learning path cards (8 Limbs, Chakras, Mantras, Mudras, Sanskrit) from this screen — those belong in the Journey tab.

---

## ANONYMOUS STATE (no auth session)

Show a welcoming, low-friction screen that gives a taste of the app without requiring signup.

### Sections (top to bottom):

1. **Greeting** — "Namaste" (no name). Subtitle: "Your practice begins here."

2. **Begin your journey card** — A warm, inviting card (clay background, sand text) that says "Explore the 8 Limbs of Yoga" with subtitle "Start learning with no account needed" and a button "Start learning →" that navigates to the Journey tab.

3. **Dosha quiz teaser** — A card with an earth-toned outline border. Headline: "Discover your dosha." Subtitle: "Take a 2-minute quiz to unlock personalized practice recommendations." Button: "Take the quiz" — navigates to the dosha quiz screen. If the quiz screen exists, let them take it and store results in Zustand state (not Supabase, since there's no user). If they sign up later, persist those results.

4. **Quote** — Pull a random quote from the quotes table (public read, no auth needed). Show body in italic, source below. Centered, subtle.

### No signup wall
- Don't show a login prompt on this screen. Let them browse freely.
- The Journey and Library tabs work fully without auth (content tables have public read RLS).
- Signup prompts appear contextually: when they complete a lesson and we can't save progress, or when they try to set an intention. Use a gentle modal: "Create a free account to save your progress" with options to sign up or dismiss.

---

## AUTHENTICATED STATE (auth session exists)

The full personalized experience.

### Sections (top to bottom):

1. **Greeting** — "Namaste, {display_name}" + subtitle "What calls to your practice today?"

2. **Daily intention** — Card with left clay-colored border (3px). If the user has set an intention for today (daily_intentions table, filtered by today's date), show it in italic. If not, show a tappable prompt "Set your intention for today" that opens a text input inline (not a new screen). Use upsert on daily_intentions with the (user_id, date) unique constraint.

3. **How are you feeling?** — A horizontal row of 4 equal-width buttons: Energized (☀), Restless (☁), Heavy (☾), Balanced (◎). Tapping one saves to the `mood` column on daily_intentions. Once selected, the chosen button gets a highlighted state (clay background). If the user already has a mood for today, pre-select it.

4. **Recommended practice** — The hero card (dark earth background, largest element on screen). Pull one practice from the `practices` table. For now, pick one where the user's primary dosha (from dosha_results) has the highest score in dosha_affinity JSONB. Show:
   - "RECOMMENDED PRACTICE" label (small, clay colored, uppercase)
   - Practice title (large, sand colored)
   - Description (one line, muted)
   - Duration + type + difficulty (small metadata line)
   - Dosha and chakra tags as small pills
   - "Begin practice" button (clay background, white text)
   
   If the user hasn't taken the dosha quiz yet, show a generic beginner practice instead, and add a subtle note: "Take the dosha quiz for personalized recommendations."

5. **Continue learning** — Query user_progress to find completed lessons. Find the first lesson (by sort_order) in the same module that ISN'T completed yet. Show:
   - Lesson title (bold)
   - Path name + module name (small, clay color)
   - Progress bar (sage fill color) showing completed/total lessons in that module
   - Arrow button to navigate to the lesson
   
   If the user hasn't started any path, show: "Begin your journey" card linking to Journey tab.
   If the user has completed all lessons in all modules, show a congratulatory message.

6. **Quote** — Same as anonymous state. One random active quote, centered, subtle.

---

## IMPLEMENTATION NOTES

### Auth state detection
Use the existing auth state from the Zustand store. Check if there's a valid session/user. Render the appropriate version of the screen based on this.

### Data fetching — add to Zustand store (lib/store.ts):

```
// Daily intention + mood
fetchDailyIntention: async (date: string) => {
  // Query daily_intentions where user_id = current user AND date = today
  // Returns { intention, mood } or null
}

upsertIntention: async (intention: string) => {
  // Upsert into daily_intentions with user_id + today's date
}

upsertMood: async (mood: 'energized' | 'restless' | 'heavy' | 'balanced') => {
  // Upsert into daily_intentions with user_id + today's date
}

// Practice recommendation
fetchRecommendedPractice: async () => {
  // 1. Get user's primary dosha from dosha_results (most recent)
  // 2. Fetch practices and pick one where dosha_affinity[primaryDosha] is highest
  // 3. If no dosha result, return any beginner practice
}

// Continue learning
fetchNextLesson: async () => {
  // 1. Get all completed lesson IDs from user_progress
  // 2. Find the module the user was most recently working in
  // 3. Find the first uncompleted lesson in that module by sort_order
  // 4. Join to get module name, path name, total lessons count
  // Returns: { lesson, moduleName, pathName, completedCount, totalCount } or null
}

// Quote
fetchRandomQuote: async () => {
  // Select one random row from quotes where is_active = true
  // Supabase doesn't have RANDOM(), so fetch all active quotes
  // and pick one client-side, or use .limit(1) with a random offset
}
```

### Signup prompt modal
Create a reusable component (components/SignupPrompt.tsx) — a bottom sheet or centered modal with:
- Headline: "Save your progress"
- Body: "Create a free account to track your journey, set daily intentions, and get personalized recommendations."
- Primary button: "Create account" → navigates to login screen
- Text button: "Not now" → dismisses

Trigger this modal from the Journey tab when a user completes a lesson but has no auth session. Store a flag so you don't show it more than once per session.

### Design
- Use existing theme tokens from constants/theme.ts
- Sand background, earth text, clay accents throughout
- The practice card should be the most visually prominent element
- The anonymous state should feel inviting, not empty — it's a welcome mat, not a locked door
- Smooth transitions between states if the user signs up mid-session
