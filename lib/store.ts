// lib/store.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Mood,
} from '../types';
import type { Session } from '@supabase/supabase-js';

export interface Resource {
  id: string;
  title: string;
  author: string | null;
  curator_note: string | null;
  url: string | null;
  path_id: string | null;
  category: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface DoshaQuestion {
  id: string;
  question: string;
  options: { text: string; vata_score: number; pitta_score: number; kapha_score: number }[];
  sort_order: number;
}

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
  resources: Resource[];
  doshaQuestions: DoshaQuestion[];

  // User data
  progress: UserProgress[];
  journalEntries: JournalEntry[];
  todayIntention: DailyIntention | null;
  currentQuote: Quote | null;
  hasSeenIntention: boolean;
  intentionChecked: boolean;
  hasSeenSignupPrompt: boolean;
  localDoshaResult: { vata: number; pitta: number; kapha: number } | null;

  // Actions — Auth
  setSession: (session: Session | null) => void;
  fetchProfile: () => Promise<void>;

  // Actions — Content
  fetchPaths: () => Promise<void>;
  fetchModules: (pathId: string) => Promise<void>;
  fetchLessons: (moduleId: string) => Promise<void>;
  fetchPractices: () => Promise<void>;
  fetchResources: (pathId?: string, category?: string) => Promise<void>;
  fetchPracticesByNeed: (need: string) => Promise<void>;
  fetchPracticesByType: (type?: string) => Promise<void>;
  fetchDoshaQuestions: () => Promise<void>;

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
  upsertMood: (mood: Mood) => Promise<void>;
  setHasSeenIntention: (seen: boolean) => void;
  checkIntentionTimestamp: () => Promise<void>;
  saveIntentionTimestamp: () => Promise<void>;

  // Actions — Recommendations
  fetchRecommendedPractice: () => Promise<void>;
  recommendedPractice: Practice | null;
  nextLesson: {
    lesson: Lesson;
    moduleName: string;
    pathName: string;
    completedCount: number;
    totalCount: number;
  } | null;
  fetchNextLesson: () => Promise<void>;

  // Signup prompt
  setHasSeenSignupPrompt: (seen: boolean) => void;

  // Dosha
  setLocalDoshaResult: (result: { vata: number; pitta: number; kapha: number }) => void;
  saveDoshaResult: (result: { vata: number; pitta: number; kapha: number }) => Promise<void>;

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
  resources: [],
  doshaQuestions: [],
  progress: [],
  journalEntries: [],
  todayIntention: null,
  currentQuote: null,
  hasSeenIntention: false,
  intentionChecked: false,
  hasSeenSignupPrompt: false,
  localDoshaResult: null,
  recommendedPractice: null,
  nextLesson: null,

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

  fetchResources: async (pathId?: string, category?: string) => {
    let query = supabase.from('resources').select('*').eq('is_active', true).order('sort_order');
    if (pathId) query = query.eq('path_id', pathId);
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (!error && data) set({ resources: data as Resource[] });
  },

  fetchPracticesByNeed: async (need: string) => {
    const { data, error } = await supabase
      .from('practices')
      .select('*')
      .contains('emotional_needs', [need]);
    if (!error && data) set({ practices: data as Practice[] });
  },

  fetchPracticesByType: async (type?: string) => {
    let query = supabase.from('practices').select('*').order('type');
    if (type) query = query.eq('type', type);
    const { data, error } = await query;
    if (!error && data) set({ practices: data as Practice[] });
  },

  fetchDoshaQuestions: async () => {
    const { data, error } = await supabase.from('dosha_questions').select('*').order('sort_order');
    if (error) {
      console.error('fetchDoshaQuestions error:', error.message);
    }
    if (!error && data) {
      set({ doshaQuestions: data as DoshaQuestion[] });
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

  checkIntentionTimestamp: async () => {
    try {
      const raw = await AsyncStorage.getItem('lastIntentionTimestamp');
      if (raw) {
        const elapsed = Date.now() - parseInt(raw, 10);
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (elapsed < twentyFourHours) {
          set({ hasSeenIntention: true, intentionChecked: true });
          return;
        }
      }
      set({ hasSeenIntention: false, intentionChecked: true });
    } catch {
      set({ hasSeenIntention: false, intentionChecked: true });
    }
  },

  saveIntentionTimestamp: async () => {
    try {
      await AsyncStorage.setItem('lastIntentionTimestamp', Date.now().toString());
      set({ hasSeenIntention: true });
    } catch (e) {
      console.error('Failed to save intention timestamp:', e);
    }
  },

  // ---- Mood ----
  upsertMood: async (mood: Mood) => {
    const { session } = get();
    if (!session) return;

    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_intentions')
      .upsert({
        user_id: session.user.id,
        intention: get().todayIntention?.intention || '',
        mood,
        date: today,
      })
      .select()
      .single();

    if (!error && data) {
      set({ todayIntention: data as DailyIntention });
    }
  },

  // ---- Recommended Practice ----
  fetchRecommendedPractice: async () => {
    const { profile } = get();
    const primaryDosha = profile?.dosha_result?.split('_')[0] || null;

    const { data, error } = await supabase.from('practices').select('*');
    if (error || !data || data.length === 0) return;

    const practices = data as Practice[];
    if (primaryDosha) {
      practices.sort((a, b) => {
        const scoreA = (a.dosha_affinity as Record<string, number>)?.[primaryDosha] || 0;
        const scoreB = (b.dosha_affinity as Record<string, number>)?.[primaryDosha] || 0;
        return scoreB - scoreA;
      });
    } else {
      // No dosha — pick a beginner practice
      const beginners = practices.filter((p) => p.difficulty === 'beginner');
      if (beginners.length > 0) {
        set({ recommendedPractice: beginners[0] });
        return;
      }
    }
    set({ recommendedPractice: practices[0] });
  },

  // ---- Next Lesson ----
  fetchNextLesson: async () => {
    const { session } = get();
    if (!session) {
      set({ nextLesson: null });
      return;
    }

    // Fetch progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('lesson_id, completed_at')
      .eq('user_id', session.user.id)
      .order('completed_at', { ascending: false });

    const completedIds = new Set(
      (progressData || []).map((p: { lesson_id: string }) => p.lesson_id),
    );

    if (completedIds.size === 0) {
      set({ nextLesson: null });
      return;
    }

    // Find the most recently completed lesson to determine active module
    const lastCompletedId = (progressData || [])[0]?.lesson_id;
    const { data: lastLesson } = await supabase
      .from('lessons')
      .select('module_id')
      .eq('id', lastCompletedId)
      .single();

    if (!lastLesson) {
      set({ nextLesson: null });
      return;
    }

    // Get all lessons in that module
    const { data: moduleLessons } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', lastLesson.module_id)
      .order('sort_order');

    if (!moduleLessons) {
      set({ nextLesson: null });
      return;
    }

    const next = (moduleLessons as Lesson[]).find((l) => !completedIds.has(l.id));
    const completedCount = (moduleLessons as Lesson[]).filter((l) => completedIds.has(l.id)).length;

    // Get module + path names
    const { data: mod } = await supabase
      .from('modules')
      .select('name, path_id')
      .eq('id', lastLesson.module_id)
      .single();

    const { data: path } = mod
      ? await supabase.from('paths').select('name').eq('id', mod.path_id).single()
      : { data: null };

    if (next && mod && path) {
      set({
        nextLesson: {
          lesson: next,
          moduleName: mod.name,
          pathName: path.name,
          completedCount,
          totalCount: moduleLessons.length,
        },
      });
    } else {
      set({ nextLesson: null });
    }
  },

  // ---- Signup prompt ----
  setHasSeenSignupPrompt: (seen: boolean) => set({ hasSeenSignupPrompt: seen }),

  // ---- Dosha ----
  setLocalDoshaResult: (result) => set({ localDoshaResult: result }),

  saveDoshaResult: async (result) => {
    const { session } = get();
    if (!session) {
      set({ localDoshaResult: result });
      return;
    }
    const maxDosha = Object.entries(result).reduce((a, b) => (b[1] > a[1] ? b : a));
    const doshaType = maxDosha[0];

    await supabase.from('dosha_results').insert({
      user_id: session.user.id,
      vata_score: result.vata,
      pitta_score: result.pitta,
      kapha_score: result.kapha,
    });

    await supabase.from('profiles').update({ dosha_result: doshaType }).eq('id', session.user.id);

    await get().fetchProfile();
  },

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
