// types/index.ts
// Mirrors your Supabase schema — update if you change tables

export type Dosha =
  | 'vata'
  | 'pitta'
  | 'kapha'
  | 'vata_pitta'
  | 'pitta_kapha'
  | 'vata_kapha'
  | 'tridoshic';

export type PracticeType = 'asana' | 'pranayama' | 'meditation' | 'dharana';
export type ActionType = 'quiz' | 'reflection' | 'challenge' | 'journal';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type Tier = 'free' | 'premium';

// ---- Database row types ----

export interface Path {
  id: string;
  slug: string;
  name: string;
  name_sanskrit: string | null;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Module {
  id: string;
  path_id: string;
  slug: string;
  name: string;
  name_sanskrit: string | null;
  subtitle: string | null;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
  is_free: boolean;
}

export interface Lesson {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  teaching_content: TeachingContent;
  action_type: ActionType;
  action_data: QuizAction | ReflectionAction | ChallengeAction | JournalAction;
  sort_order: number;
  is_free: boolean;
  estimated_minutes: number | null;
}

export interface Practice {
  id: string;
  module_id: string | null;
  slug: string;
  type: PracticeType;
  title: string;
  description: string | null;
  instructions: PracticeStep[];
  duration_minutes: number;
  difficulty: Difficulty;
  dosha_affinity: Record<string, number>;
  chakra_affinity: { primary?: string; secondary?: string } | null;
  is_free: boolean;
  image_name: string | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  dosha_result: Dosha | null;
  tier: Tier;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  action_response: Record<string, unknown> | null;
  completed_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  lesson_id: string | null;
  prompt: string | null;
  body: string;
  mood: string | null;
  created_at: string;
}

export interface Quote {
  id: string;
  body: string;
  source: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
}

export interface DailyIntention {
  id: string;
  user_id: string;
  intention: string;
  date: string;
  created_at: string;
}

// ---- Content block types ----

export interface TeachingContent {
  blocks: ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'highlight' | 'quote' | 'image';
  content: string;
}

export interface PracticeStep {
  step: number;
  name: string;
  description: string;
  duration_seconds: number;
}

// ---- Action data types ----

export interface QuizAction {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface ReflectionAction {
  prompt: string;
  save_to_journal: boolean;
}

export interface ChallengeAction {
  title: string;
  description: string;
  duration_hours: number;
  check_in_prompt: string;
}

export interface JournalAction {
  prompts: string[];
  save_to_journal: boolean;
}
