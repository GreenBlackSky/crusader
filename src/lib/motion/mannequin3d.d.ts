/* Types for mannequin3d.js — the 3D figure (three.js, kept as JavaScript). */
import type { Spec } from './engine.js';
import type { Exercise } from './library.js';

export type CameraPreset = '3d' | 'side' | 'front' | 'top' | 'free';

export interface Info3D {
  spec: Spec;
  plane: 'side' | 'front' | 'top';
  w3: Record<string, unknown>;
  label: string;
}

export interface Handle3D {
  playing: boolean;
  phase(): number;
  setPlaying(on: boolean): void;
  setPreset(name: CameraPreset): void;
  stop(): void;
  /** called when the camera preset changes (dragging makes it 'free') */
  onPreset?: (name: CameraPreset) => void;
}

export declare const A3: {
  /** false when WebGL is unavailable */
  ok: boolean;
  available(): boolean;
  infoFor(exercise: Exercise): Info3D;
  /** One 3D view at a time: mounting moves the shared canvas into `host`. */
  mount(
    host: HTMLElement,
    info: Info3D,
    options?: { play?: boolean; at?: number; preset?: CameraPreset },
  ): Handle3D | null;
  current(): Handle3D | null;
};
