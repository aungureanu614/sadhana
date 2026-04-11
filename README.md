# 🕉 Sadhana

A yoga & spiritual practice companion app built with React Native and Expo. Sadhana guides users through structured learning paths covering asana, pranayama, meditation, and dharana — with journaling, quizzes, and progress tracking along the way.

## ✨ Features

- **Structured Learning Paths** — Browse curated paths, each containing modules and lessons with rich teaching content.
- **Interactive Lessons** — Quizzes, reflections, challenges, and journal prompts built into every lesson.
- **Practice Library** — Guided asana, pranayama, meditation, and dharana practices with step-by-step instructions.
- **Dosha Awareness** — Practices tagged with Ayurvedic dosha affinities (Vata, Pitta, Kapha).
- **Journaling** — Reflect on lessons and track your mood over time.
- **Progress Tracking** — Mark lessons complete and watch your journey unfold.
- **Auth & Profiles** — Secure email-based authentication via Supabase with user profiles and tier support (free / premium).

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) (SDK 54) / React Native 0.81 |
| Routing | [Expo Router](https://docs.expo.dev/router/introduction/) v6 (file-based) |
| State Management | [Zustand](https://github.com/pmndrs/zustand) |
| Backend & Auth | [Supabase](https://supabase.com) (Postgres, Auth, Row-Level Security) |
| Language | TypeScript 5.9 |

## 📁 Project Structure

```
app/
  _layout.tsx          # Root layout — auth listener & redirect logic
  index.tsx            # Entry redirect
  (auth)/
    login.tsx          # Login / sign-up screen
  (main)/
    _layout.tsx        # Tab navigator (Today, Journey, Library, Profile)
    home.tsx           # Daily view
    journey.tsx        # Learning journey overview
    library.tsx        # Practice library
    profile.tsx        # User profile & settings
    path/
      [moduleSlug].tsx # Dynamic module detail screen
components/
  ActionRenderer.tsx   # Renders quiz / reflection / challenge / journal actions
  LessonCard.tsx       # Lesson list item
constants/
  theme.ts             # Design tokens — colors, spacing, typography
lib/
  store.ts             # Zustand store (auth, content, progress, journal)
  supabase.ts          # Supabase client initialisation
types/
  index.ts             # TypeScript types mirroring the Supabase schema
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — comes with `npx expo`
- A [Supabase](https://supabase.com) project with the required tables (see types in `types/index.ts`)

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd sadhana
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Start the dev server

```bash
npx expo start
```

Then press **i** for iOS Simulator, **a** for Android Emulator, or scan the QR code with Expo Go on a physical device.

## 🎨 Design

The app uses a warm, earthy colour palette inspired by natural materials:

| Token | Hex | Usage |
|---|---|---|
| `sand` | `#F5F0E8` | Primary background |
| `clay` | `#C4956A` | Warm accent |
| `earth` | `#5C4033` | Primary text |
| `sage` | `#7A8B6F` | Success / progress |
| `terracotta` | `#C75B39` | Alerts / important actions |

## 📜 License

This project is private.
