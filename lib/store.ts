// lib/store.ts
import { create } from 'zustand';
import { supabase } from './supabase';
import type {
  Profile,
  Path,
  Module,
  Lesson,
  Practice,
  UserProgress,
  JournalEntry,
  Quote,
  DailyIntention,
} from '../types';
import type { Session } from '@supabase/supabase-js';

interface AppState {
  // Auth
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;

  // Content
  paths: Path[];
  modules: Module[];
  lessons: Lesson[];
  practices: Practice[];

  // User data
  progress: UserProgress[];
  journalEntries: JournalEntry[];
  todayIntention: DailyIntention | null;
  currentQuote: Quote | null;
  hasSeenIntention: boolean;

  // Actions — Auth
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;

  // Actions — Content
  fetchPaths: () => Promise<void>;
  fetchModules: (pathId: string) => Promise<void>;
  fetchLessons: (moduleId: string) => Promise<void>;
  fetchPractices: () => Promise<void>;

  // Actions — Progress
  fetchProgress: () => Promise<void>;
  completeLesson: (lessonId: string, response?: Record<string, unknown>) => Promise<void>;

  // Actions — Journal
  fetchJournalEntries: () => Promise<void>;
  saveJournalEntry: (entry: {
    lessonId?: string;
    prompt?: string;
    body: string;
    mood?: string;
  }) => Promise<void>;

  // Actions — Intention
  fetchRandomQuote: () => Promise<void>;
  fetchTodayIntention: () => Promise<void>;
  saveIntention: (intention: string) => Promise<void>;
  setHasSeenIntention: (seen: boolean) => void;

  // Helpers
  getModulesForPath: (pathId: string) => Module[];
  getLessonsForModule: (moduleId: string) => Lesson[];
  isLessonCompleted: (lessonId: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  // ---- Initial state ----
  session: null,
  profile: null,
  isLoading: true,
  paths: [],
  modules: [],
  lessons: [],
  practices: [],
  progress: [],
  journalEntries: [],
  todayIntention: null,
  currentQuote: null,
  hasSeenIntention: false,

  // ---- Auth ----
  setSession: (session) => set({ session, isLoading: false }),

  fetchProfile: async () => {
    const { session } = get();
    if (!session) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!error && data) {
      set({ profile: data as Profile });
    }
  },

  // ---- Content fetching ----
  fetchPaths: async () => {
    const { data, error } = await supabase
      .from('paths')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data) {
      set({ paths: data as Path[] });
    }
  },

  fetchModules: async (pathId: string) => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('path_id', pathId)
      .order('sort_order');

    if (!error && data) {
      // Merge with existing modules from other paths
      const existing = get().modules.filter((m) => m.path_id !== pathId);
      set({ modules: [...existing, ...(data as Module[])] });
    }
  },

  fetchLessons: async (moduleId: string) => {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order');

    if (!error && data) {
      const existing = get().lessons.filter((l) => l.module_id !== moduleId);
      set({ lessons: [...existing, ...(data as Lesson[])] });
    }
  },

  fetchPractices: async () => {
    const { data, error } = await supabase.from('practices').select('*').order('type');

    if (!error && data) {
      set({ practices: data as Practice[] });
    }
  },

  // ---- Progress ----
  fetchProgress: async () => {
    const { session } = get();
    if (!session) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', session.user.id);

    if (!error && data) {
      set({ progress: data as UserProgress[] });
    }
  },

  completeLesson: async (lessonId: string, response?: Record<string, unknown>) => {
    const { session } = get();
    if (!session) return;

    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: session.user.id,
        lesson_id: lessonId,
        action_response: response || null,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('completeLesson error:', error.message);
    }

    if (!error && data) {
      const existing = get().progress.filter((p) => p.lesson_id !== lessonId);
      set({ progress: [...existing, data as UserProgress] });
    }

    // Auto-save to journal if the action response indicates it
    if (response) {
      // Reflection with save_to_journal flag
      if (response.saved_to_journal && response.reflection) {
        const lesson = get().lessons.find((l) => l.id === lessonId);
        const prompt = lesson ? (lesson.action_data as { prompt?: string }).prompt : undefined;

        await get().saveJournalEntry({
          lessonId,
          prompt,
          body: response.reflection as string,
        });
      }

      // Journal action entries
      if (response.journal_entries) {
        const lesson = get().lessons.find((l) => l.id === lessonId);
        const prompts = lesson ? (lesson.action_data as { prompts?: string[] }).prompts : undefined;
        const entries = response.journal_entries as string[];

        for (let i = 0; i < entries.length; i++) {
          await get().saveJournalEntry({
            lessonId,
            prompt: prompts?.[i],
            body: entries[i],
          });
        }
      }
    }
  },

  // ---- Journal ----
  fetchJournalEntries: async () => {
    const { session } = get();
    if (!session) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      set({ journalEntries: data as JournalEntry[] });
    }
  },

  saveJournalEntry: async ({ lessonId, prompt, body, mood }) => {
    const { session } = get();
    if (!session) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .insert({
        user_id: session.user.id,
        lesson_id: lessonId || null,
        prompt: prompt || null,
        body,
        mood: mood || null,
      })
      .select()
      .single();

    if (error) {
      console.error('saveJournalEntry error:', error.message);
    }

    if (!error && data) {
      set({ journalEntries: [data as JournalEntry, ...get().journalEntries] });
    }
  },

  // ---- Intention ----
  fetchRandomQuote: async () => {
    // Fetch all active quotes and pick one at random (small table, fine to fetch all)
    const { data, error } = await supabase.from('quotes').select('*').eq('is_active', true);

    if (!error && data && data.length > 0) {
      const randomIndex = Math.floor(Math.random() * data.length);
      set({ currentQuote: data[randomIndex] as Quote });
    }
  },

  fetchTodayIntention: async () => {
    const { session } = get();
    if (!session) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_intentions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', today)
      .single();

    if (!error && data) {
      set({ todayIntention: data as DailyIntention, hasSeenIntention: true });
    }
  },

  saveIntention: async (intention: string) => {
    const { session } = get();
    if (!session) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_intentions')
      .upsert({
        user_id: session.user.id,
        intention,
        date: today,
      })
      .select()
      .single();

    if (error) {
      console.error('saveIntention error:', error.message);
    }

    if (!error && data) {
      set({ todayIntention: data as DailyIntention, hasSeenIntention: true });
    }
  },

  setHasSeenIntention: (seen: boolean) => set({ hasSeenIntention: seen }),

  // ---- Helpers ----
  getModulesForPath: (pathId: string) => {
    return get().modules.filter((m) => m.path_id === pathId);
  },

  getLessonsForModule: (moduleId: string) => {
    return get().lessons.filter((l) => l.module_id === moduleId);
  },

  isLessonCompleted: (lessonId: string) => {
    return get().progress.some((p) => p.lesson_id === lessonId);
  },
}));
