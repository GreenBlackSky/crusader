/* Dates as the app saves them: local calendar days, 'YYYY-MM-DD'. */

export const DAY_MS = 86_400_000;

export const pad2 = (n: number): string => String(n).padStart(2, '0');

export function ymd(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** A 'YYYY-MM-DD' day as a local Date at midnight. */
export function parseYmd(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(year, month - 1, date);
}

/** Whole days from `a` to `b` (both 'YYYY-MM-DD'). */
export const daysBetween = (a: string, b: string): number =>
  Math.round((parseYmd(b).getTime() - parseYmd(a).getTime()) / DAY_MS);

export const todayStr = (): string => ymd(new Date());

/** The current moment, as a Date. */
export const now = (): Date => new Date();

/** The day `days` after `day`. */
export const addDays = (day: string, days: number): string => {
  const date = parseYmd(day);
  return ymd(new Date(date.getFullYear(), date.getMonth(), date.getDate() + days));
};

/** The Monday that starts the week containing `day`. */
export function weekStart(day: string): string {
  const date = parseYmd(day);
  return ymd(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() - ((date.getDay() + 6) % 7)),
  );
}

/** 'MM/DD' for chart labels: '2026-10-04' → '10/04'. */
export const shortDay = (day: string): string => day.slice(5).replace('-', '/');

export const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DOWS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Seconds as m:ss. */
export const mmss = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${pad2(Math.max(0, Math.round(seconds)) % 60)}`;

/** Seconds as "N min" (at least 1). */
export const minsTxt = (seconds: number): string => `${Math.max(1, Math.round(seconds / 60))} min`;

export const hourNow = (): number => new Date().getHours();

/** Today's weekday, day of the month and month name, for headings. */
export function todayParts(): { weekday: string; date: number; month: string } {
  const now = new Date();
  return { weekday: DOW[now.getDay()], date: now.getDate(), month: MONTH[now.getMonth()] };
}
