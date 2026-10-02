export interface Exercise {
  n: string; // name
  d: string; // duration or sets x reps
  b: number; // burned calories
  sec?: number; // duration in seconds if timed
  tip?: string; // coaching tip
  alts?: string[]; // alternative exercises
}

export interface WorkoutSession {
  t: string;
  ex: Exercise[];
}

export interface WorkoutPhase {
  title: string;
  weeks: string[];
  sessions: WorkoutSession[];
}

export interface MealItem {
  n: string;
  c: number;
  opts: string[];
}

export interface DrinkItem {
  e: string;
  n: string;
  d: string;
  b: string;
}

export interface RecipeItem {
  t: string; // category
  n: string; // title
  c: number; // calories
  ing: string; // ingredients
  how: string; // preparation
}

export interface BadgeItem {
  id: string;
  e: string;
  n: string;
  desc: string;
  check: (state: AppState) => boolean;
}

export interface BuddyItem {
  name: string;
  avatar: string;
  msgs: string[];
}

export interface DailyQuest {
  id: string;
  desc: string;
  reward: number;
  icon: string;
  check: (state: AppState) => boolean;
}

export interface LevelInfo {
  name: string;
  icon: string;
  min: number;
}

export interface WeightRecord {
  d: string; // YYYY-MM-DD
  v: number; // kg
}

export interface BodyMeasures {
  w?: string; // waist
  c?: string; // chest
  a?: string; // arm
}

export interface SleepRecord {
  sleep: string;
  wake: string;
  quality: number; // 1-5
  hours: number;
}

export interface ProgressPhoto {
  id: string;
  url: string;
  type: 'before' | 'progress' | 'after';
  weight?: number;
  date: string;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  text: string;
  image?: string;
  ts: number;
}

export interface UserProfile {
  name: string;
  email: string;
  join: string;
}

export interface FastingState {
  mode: '16:8' | '18:6' | '20:4' | 'OMAD';
  startTime: number | null;
  sessions: number;
  totalHours: number;
}

export interface EmailSettings {
  reportDay: number;
  lastSent: string | null;
}

export interface AppState {
  user: UserProfile | null;
  dark: boolean;
  days: number; // 3, 4, 5, 6
  phase: number; // 0, 1, 2
  week: number;
  day: number; // 0..6
  water: { d: string; ml: number };
  eaten: Record<string, number>;
  done: Record<string, number>;
  swaps: Record<string, number>;
  mealCh: Record<string, number>;
  bonus: Record<string, number>;
  weights: WeightRecord[];
  measures: BodyMeasures;
  totals: {
    ex: number;
    meals: number;
    water: number;
    points: number;
    xp: number;
  };
  profile: {
    cal: number;
    water: number;
  } | null;
  fast: FastingState;
  sleep: Record<string, SleepRecord>;
  photos: ProgressPhoto[];
  questsDone: Record<string, Record<string, boolean>>;
  weeklyChallenge: number;
  aiMessages: AiChatMessage[];
  emailSettings: EmailSettings;
}
