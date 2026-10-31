/* The app's line icons (24 × 24, drawn with the current text colour). */

export const ICON = {
  today:
    '<path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/><circle cx="12" cy="12" r="4"/>',
  lib: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  prog: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  me: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.5 4.2-6.5 8-6.5s7 2 8 6.5"/>',
  shuffle:
    '<path d="M3 7h3.5c2 0 3.2 1 4.3 2.7l2.4 3.6c1.1 1.7 2.3 2.7 4.3 2.7H21M3 17h3.5c2 0 3.2-1 4.3-2.7M21 7h-3.5c-2 0-3.2 1-4.3 2.7M18.5 4.5L21 7l-2.5 2.5M18.5 14.5L21 17l-2.5 2.5"/>',
  pin: '<path d="M9 4h6l-1 6 3 3H7l3-3-1-6zM12 13v7"/>',
  lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
} as const;

export type IconName = keyof typeof ICON;

/** An icon as SVG markup (for elements built outside Svelte). */
export const iconSvg = (name: IconName, cls = ''): string =>
  `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[name]}</svg>`;
