/* Types for library.js — the exercise library (kept as JavaScript). */
import type { Muscles } from './engine.js';

export type ExerciseKind = 'reps' | 'hold' | 'time';
export type FamilyId = 'push' | 'pull' | 'legs' | 'core' | 'balance' | 'mobility';
export type TemplateId = 'push' | 'pull' | 'legs' | 'full' | 'mobility';
export type RoutineId = 'am' | 'mid' | 'pm';
export type Role = 'warm' | 'main' | 'second' | 'third' | 'core' | 'balance' | 'cool';

export interface Exercise {
  id: string;
  name: string;
  /** the progression ladder it belongs to */
  ladder: string;
  fam: FamilyId;
  /** equipment needed (keys of EQUIP) */
  eq: string[];
  kind: ExerciseKind;
  /** reps, or seconds, to reach before moving up */
  goal: number;
  /** where a new person starts */
  start: number;
  /** energy cost (MET) for calorie estimates */
  met: number;
  /** side-view animation name and parameters */
  anim: string;
  params: Record<string, unknown>;
  cue: string;
  /** done per side */
  per: boolean;
  /** position in its ladder (0 = easiest) */
  idx: number;
  /** reference number shown as #n; never changes */
  n: number;
  /** a second camera angle: animation, default view (0 side, 1 front, 2 both), label, params */
  front?: string;
  fdef?: number;
  flabel?: string;
  fparams?: Record<string, unknown>;
  /** 3D: 'side' to keep the side plane */
  p3?: string;
}

export interface Ladder {
  id: string;
  name: string;
  fam: FamilyId;
  /** exercise ids, easiest first */
  ids: string[];
}

export interface Routine {
  name: string;
  sub: string;
  thumb: string;
  secs: number;
  /** postures to leave out */
  avoid?: string[];
  /** each slot lists the body regions it may take */
  slots: string[][];
}

export interface Template {
  name: string;
  short: string;
  slots: Array<{ role: Role; ladders: string[] }>;
}

export declare const EQUIP: Array<{ k: string; label: string; hint: string; def?: boolean }>;
export declare const EQ_LABEL: Record<string, string>;
export declare const FAMS: Array<{ k: FamilyId; label: string }>;
export declare const MUSCLE_LABEL: Record<string, string>;
export declare const EX: Record<string, Exercise>;
export declare const LAD: Record<string, Ladder>;
export declare const STRETCH_TAGS: Record<string, [string, string]>;
export declare const POSTURE_ORDER: Record<string, number>;
export declare const ROUTINES: Record<RoutineId, Routine>;
export declare function stretchTag(id: string): { r: string[]; p: string } | null;
export declare const ALL_IDS: string[];
export declare function musOf(exercise: Exercise): Muscles;
export declare function missingEq(exercise: Exercise, equipment: Record<string, boolean>): string[];
export declare const TEMPLATES: Record<TemplateId, Template>;
export declare const ROTATION: TemplateId[];
