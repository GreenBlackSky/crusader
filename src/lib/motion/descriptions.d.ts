/* Types for descriptions.js — what each exercise is and how to do it. */

export interface Description {
  /** [heading, text] pairs: Start, Move, Finish, Watch for */
  how: Array<[string, string]>;
  /** captions that follow the animation: [share of the cycle 0–1, text] */
  phases?: Array<[number, string]>;
  /** facts the 3D figure is checked against */
  intent?: Record<string, unknown>;
}

export declare const DESC: Record<string, Description>;
