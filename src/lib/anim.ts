import { iconSvg } from './icons';
import { AN, type AnimHandle, type Spec } from './motion/engine';
import { ANIMF } from './motion/front-specs';
import { EX, type Exercise } from './motion/library';
import { A3, type CameraPreset, type Handle3D } from './motion/mannequin3d';
import { ANIMS } from './motion/side-specs';
import type { View } from './types';

/* Putting animations on the page. The engine (motion/engine.js) and the 3D
   figure (motion/mannequin3d.js) draw into an element they are given; this
   file decides which one, and with what. Svelte components call it from an
   $effect, which re-runs it when the exercise or the view changes. */

export type Playing = Pick<AnimHandle, 'phase' | 'playing' | 'setPlaying'> | Handle3D;

export const reduceMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** The 2D animation for one camera view. */
export function specFor(ex: Exercise, view: 'side' | 'front'): Spec {
  return view === 'front' && ex.front ? ANIMF[ex.front](ex.fparams) : ANIMS[ex.anim](ex.params);
}

export interface StageOptions {
  ex: Exercise;
  view: View;
  /** use the 3D figure (only one can show at a time) */
  in3d: boolean;
  preset: CameraPreset;
  /** called when dragging changes the 3D camera */
  onPreset: (name: CameraPreset) => void;
}

export interface Mounted {
  /** the first animation, for phase captions */
  main: Playing | null;
  destroy(): void;
}

/** A play/pause button, for people who asked their device for less motion. */
function addPlayButton(host: HTMLElement, handles: Playing[]): void {
  const button = document.createElement('button');
  button.className = 'playbtn';
  button.innerHTML = iconSvg('play') + '<span class="sr">Play animation</span>';
  button.onclick = () => {
    const on = !handles[0].playing;
    handles.forEach((h) => h.setPlaying(on));
    button.innerHTML = iconSvg(on ? 'pause' : 'play');
  };
  host.appendChild(button);
}

/** Draws an exercise into a `.stage` element: 3D, one 2D view, or two side by side. */
export function mountStage(host: HTMLElement, options: StageOptions): Mounted {
  const { ex, view } = options;
  const base = { play: !reduceMotion, at: reduceMotion ? 0.5 : 0 };
  host.classList.remove('is3d', 'both');
  if (options.in3d) {
    const handle = A3.mount(host, A3.infoFor(ex), { ...base, preset: options.preset });
    if (handle) {
      host.classList.add('is3d');
      handle.onPreset = options.onPreset;
      if (reduceMotion) {
        addPlayButton(host, [handle]);
      }
      return { main: handle, destroy: () => handle.stop() };
    }
  }
  const handles: AnimHandle[] = [];
  if (view === 'both') {
    host.textContent = '';
    host.classList.add('both');
    (['side', 'front'] as const).forEach((v) => {
      const half = document.createElement('div');
      half.className = 'half';
      host.appendChild(half);
      handles.push(
        AN.mount(half, specFor(ex, v), { ...base, asp: 1.1, label: `${ex.name}, ${v} view` }),
      );
    });
  } else {
    handles.push(AN.mount(host, specFor(ex, view), { ...base, label: ex.name }));
  }
  if (reduceMotion) {
    addPlayButton(host, handles);
  }
  /* the engine stops drawing an animation once it leaves the page */
  return { main: handles[0], destroy: () => handles.forEach((h) => h.setPlaying(false)) };
}

/* Thumbnails: a still frame, drawn when it scrolls near the screen. */

const pending = new Map<Element, () => void>();
let observer: IntersectionObserver | null = null;

function observe(element: Element, draw: () => void): void {
  if (typeof IntersectionObserver === 'undefined') {
    draw();
    return;
  }
  observer ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          observer!.unobserve(entry.target);
          pending.get(entry.target)?.();
          pending.delete(entry.target);
        }
      }),
    { rootMargin: '200px' },
  );
  pending.set(element, draw);
  observer.observe(element);
}

/** Svelte action: `<span use:thumb={{ id, view }}>` draws exercise `id` mid-move. */
export function thumb(node: HTMLElement, params: { id: string; view: View }) {
  let current = params;
  const draw = (): void => {
    const ex = EX[current.id];
    if (ex) {
      AN.mount(node, specFor(ex, current.view === 'front' ? 'front' : 'side'), { at: 0.5 });
    }
  };
  observe(node, draw);
  return {
    update(next: { id: string; view: View }) {
      if (next.id === current.id && next.view === current.view) {
        return;
      }
      current = next;
      if (pending.has(node)) {
        pending.set(node, draw);
      } else {
        draw();
      }
    },
    destroy() {
      pending.delete(node);
      observer?.unobserve(node);
    },
  };
}
