/* Types for engine.js — the 2D figure animation engine (kept as JavaScript). */

export type Point = [number, number];

/** Muscle groups to colour: p = working, s = supporting, st = stretching. */
export interface Muscles {
  p?: string[];
  s?: string[];
  st?: string[];
}

/** One keyframe. Its many short fields (hip, t, sb, hand, foot, eb, kb, …)
    are documented where they are read, in engine.js `resolve()`. */
export type Key = Record<string, unknown>;

/** An animation: props, keyframes, timing and the muscles it shows. */
export interface Spec {
  keys: Key[];
  props?: unknown[][];
  /** seconds per cycle */
  dur?: number;
  /** 'yoyo' plays the keys forward then back; 'loop' wraps around */
  mode?: 'yoyo' | 'loop';
  view?: 'side' | 'front';
  mus?: Muscles;
  noFloor?: boolean;
  vb?: number[];
  scroll?: (phase: number) => number;
  [field: string]: unknown;
}

export interface MountOptions {
  play?: boolean;
  /** where in the cycle to start (0–1) */
  at?: number;
  /** width / height of the view */
  asp?: number;
  label?: string;
}

export interface AnimHandle {
  svg: SVGSVGElement;
  playing: boolean;
  t: number;
  draw(phase: number): void;
  /** where in the cycle it is now (0–1) */
  phase(): number;
  setPlaying(on: boolean): void;
}

export declare const AN: {
  /** Draw `spec` into `host` (replacing its contents); returns a handle. */
  mount(host: HTMLElement, spec: Spec, options?: MountOptions): AnimHandle;
  [member: string]: unknown;
};
