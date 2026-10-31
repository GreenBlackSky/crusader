/* What the app saves, document by document, in the 'user' collection:

     user/profile    Profile   settings: weight, schedule, equipment…
     user/progress   Progress  levels, per-exercise stats, picks, routines
     user/body       { entries: BodyEntry[] }   weight and waist check-ins
     user/ses_<ts>   Session   one finished workout each

   The names are the original app's, so its backup restores as it is. Never
   rename a field: old saves must keep loading. */

import type { RoutineId, TemplateId } from './motion/library';

export type Units = 'kg' | 'lb';
export type View = 'side' | 'front' | 'both';

export interface Profile {
  /** kg, always (shown in lb when units is 'lb') */
  weight: number;
  /** false until the person enters it: calories then use 70 kg */
  weightSet: boolean;
  units: Units;
  /** equipment owned, by EQUIP key */
  equip: Record<string, boolean>;
  /** weekdays, 0 = Sunday */
  trainDays: number[];
  boxDays: number[];
  /** a lighter session on days that are both */
  lightBox: boolean;
  /** set once Tuesday and Thursday were added to old schedules */
  v2days: boolean;
  /** session length: 15, 20 or 25 */
  minutes: number;
  /** a lighter week every 4th week */
  deload: boolean;
  /** the day the plan started: weeks count from here */
  start: string;
  /** animation style; missing means 3D */
  mode?: '2d' | '3d';
  /** chosen camera view per exercise (2D, exercises with a second angle) */
  views?: Record<string, View>;
  [other: string]: unknown;
}

export interface ExerciseStat {
  /** sessions in a row with every set at target */
  hits: number;
  /** of those, sessions in a row at the exercise's goal */
  atGoal: number;
  /** the target for next time */
  next?: number;
  /** best single set ever */
  best?: number;
}

export interface LevelUp {
  date: string;
  ladder: string;
  from: string;
  to: string;
}

export interface Progress {
  /** ladder id → index of the current exercise */
  levels: Record<string, number>;
  stats: Record<string, ExerciseStat>;
  pinned: string[];
  hidden: string[];
  /** exercise id → the day last done */
  lastDone: Record<string, string>;
  /** 'template:role' → the exercise picked last time */
  lastPick: Record<string, string>;
  levelups: LevelUp[];
  sessionsDone: number;
  /** day → stretch routines done that day */
  routines: Record<string, RoutineId[]>;
  /** 'day:routine' → that day's stretches (so they stay put all day) */
  rplan: Record<string, string[]>;
  /** bumped by "shuffle" so a routine gets new stretches */
  rsalt: number;
  /** routine → the stretches done last time */
  lastRoutine: Record<string, string[]>;
}

export interface BodyEntry {
  date: string;
  /** kg */
  weight?: number;
  /** cm */
  waist?: number;
}

export interface SessionItem {
  id: string;
  /** reps or seconds, one per set done */
  sets: number[];
  target: number;
  planned: number;
}

export interface Session {
  ts: number;
  date: string;
  tpl: TemplateId;
  format: Format;
  week: number;
  /** seconds */
  duration: number;
  kcal: number;
  weight: number;
  items: SessionItem[];
}

/* ---------------- not saved: today's plan and the runner ---------------- */

export type Format = 'straight' | 'circuit' | 'emom';
export type PlanRole = 'warm' | 'main' | 'second' | 'third' | 'core' | 'balance' | 'cool';

export interface WeekInfo {
  week: number;
  deload: boolean;
  sets: number;
  phase: string;
  light?: boolean;
}

export interface PlanItem {
  id: string;
  role: PlanRole;
  sets: number;
  /** reps or seconds per set */
  amount: number;
}

export interface Plan {
  tpl: TemplateId;
  date: string;
  week: WeekInfo;
  format: Format;
  items: PlanItem[];
  light: boolean;
}

/** A timed step: warm-up, cool-down or a stretch. */
export interface TimeStep {
  k: 'time';
  id: string;
  secs: number;
  label: string;
  side?: string;
}

/** One set of an exercise. */
export interface SetStep {
  k: 'set';
  id: string;
  n: number;
  of: number;
  amount: number;
  /** seconds of rest after it */
  rest: number;
  round?: number;
  rounds?: number;
  /** EMOM: the set and its rest share a block of this many seconds */
  block?: number;
  emom?: boolean;
}

export type Step = TimeStep | SetStep;
