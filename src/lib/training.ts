import { addDays, DAY_MS, daysBetween, hourNow, parseYmd, ymd } from './dates';
import {
  EX,
  LAD,
  POSTURE_ORDER,
  ROTATION,
  ROUTINES,
  STRETCH_TAGS,
  stretchTag,
  TEMPLATES,
  type Exercise,
  type RoutineId,
  type Template,
  type TemplateId,
} from './motion/library';
import { hash, mulberry, type Random } from './random';
import type {
  Format,
  Plan,
  PlanItem,
  PlanRole,
  Profile,
  Progress,
  Session,
  SessionItem,
  SetStep,
  Step,
  TimeStep,
  WeekInfo,
} from './types';

/* The training logic: which exercises today, how many sets and reps, how
   long it takes, and how progress moves you up a ladder. Pure functions of
   the person's profile and progress ("you") and the day — no screens, no
   saving. A few functions change `you.progress` as they say; the caller
   saves it. Ported from the original app with the same numbers and the same
   random picks (seeded by the day, so a plan stays put all day). */

export interface You {
  profile: Profile;
  progress: Progress;
}

const clamp = (x: number, low: number, high: number): number => Math.max(low, Math.min(high, x));

/** Calories when no weight was entered. */
const DEFAULT_WEIGHT_KG = 70;
/** Energy cost of resting between sets (MET). */
const REST_MET = 1.8;
export const KG_PER_LB = 1 / 2.20462;

export function defaultProfile(today: string): Profile {
  return {
    weight: DEFAULT_WEIGHT_KG,
    weightSet: false,
    units: 'kg',
    equip: { wall: true, sturdy: true },
    trainDays: [1, 2, 3, 4, 5],
    boxDays: [2, 4, 6],
    lightBox: true,
    v2days: true,
    minutes: 20,
    deload: true,
    start: today,
  };
}

export function defaultProgress(): Progress {
  return {
    levels: {},
    stats: {},
    pinned: [],
    hidden: [],
    lastDone: {},
    lastPick: {},
    levelups: [],
    sessionsDone: 0,
    routines: {},
    rplan: {},
    rsalt: 0,
    lastRoutine: {},
  };
}

/* ---------------- what you can do ---------------- */

export const owned = (you: You, ex: Exercise): boolean => ex.eq.every((k) => you.profile.equip[k]);
export const usable = (you: You, id: string): boolean =>
  owned(you, EX[id]) && !you.progress.hidden.includes(id);
export const isMobility = (ladderId: string): boolean => LAD[ladderId].fam === 'mobility';

/** Positions in a ladder you have the equipment for (and haven't hidden). */
function availableIndexes(you: You, ladderId: string): number[] {
  return LAD[ladderId].ids.map((_, i) => i).filter((i) => usable(you, LAD[ladderId].ids[i]));
}

/** Your level in a ladder: the saved one, or the nearest you can do below it. -1 if none. */
export function effectiveIndex(you: You, ladderId: string): number {
  const available = availableIndexes(you, ladderId);
  if (!available.length) {
    return -1;
  }
  const stored = you.progress.levels[ladderId] || 0;
  const below = available.filter((i) => i <= stored);
  return below.length ? below[below.length - 1] : available[0];
}

function nextIndex(you: You, ladderId: string, from: number): number {
  const above = availableIndexes(you, ladderId).filter((i) => i > from);
  return above.length ? above[0] : -1;
}

export const weightKg = (you: You): number => you.profile.weight || DEFAULT_WEIGHT_KG;

export function formatWeight(you: You, kg: number): string {
  return you.profile.units === 'lb'
    ? Math.round((kg / KG_PER_LB) * 10) / 10 + ' lb'
    : Math.round(kg * 10) / 10 + ' kg';
}

/** The profile's weight in its own units, to one decimal. */
export function shownWeight(you: You): number {
  const kg = you.profile.weight;
  return you.profile.units === 'lb' ? Math.round((kg / KG_PER_LB) * 10) / 10 : kg;
}

/* ---------------- the calendar ---------------- */

export function weekInfo(you: You, day: string): WeekInfo {
  const n = Math.max(0, daysBetween(you.profile.start, day));
  const week = Math.floor(n / 7) + 1;
  const deload = you.profile.deload && week % 4 === 0;
  let phase = 'Build';
  if (deload) {
    phase = 'Deload week';
  } else if (week <= 4) {
    phase = 'Foundation';
  }
  return { week, deload, sets: week <= 4 ? 2 : 3, phase };
}

/** A day that is both: calisthenics in the morning, boxing later. */
export const boxToo = (you: You, date: Date): boolean =>
  you.profile.trainDays.includes(date.getDay()) && you.profile.boxDays.includes(date.getDay());

export type DayKind = 'train' | 'box' | 'rest';

export function dayKind(you: You, date: Date): DayKind {
  const dow = date.getDay();
  if (you.profile.trainDays.includes(dow)) {
    return 'train';
  }
  if (you.profile.boxDays.includes(dow)) {
    return 'box';
  }
  return 'rest';
}

/** Push, pull, legs in turn: counts the training days since the start. */
export function templateFor(you: You, day: string): TemplateId {
  const trainDays = you.profile.trainDays;
  let n = 0;
  for (let d = parseYmd(you.profile.start); ymd(d) < day; d = new Date(d.getTime() + DAY_MS)) {
    if (trainDays.includes(d.getDay())) {
      n++;
    }
  }
  return ROTATION[n % 3];
}

/** "Monday (push and core)" — the next training day after `from`, or ''. */
export function nextTrainDay(you: You, from: number, dayNames: string[]): string {
  const trainDays = you.profile.trainDays;
  if (!trainDays.length) {
    return '';
  }
  for (let i = 1; i <= 7; i++) {
    const date = new Date(from + i * DAY_MS);
    if (trainDays.includes(date.getDay())) {
      return `${dayNames[date.getDay()]} (${TEMPLATES[templateFor(you, ymd(date))].name.toLowerCase()})`;
    }
  }
  return '';
}

/* ---------------- building a session ---------------- */

const WARM: Record<TemplateId, string[]> = {
  push: ['arm-circles', 'shoulder-pass', 'wrist-prep', 'jumping-jacks', 'shoulder-rolls'],
  pull: ['shoulder-pass', 'cat-cow', 'arm-circles', 'jumping-jacks', 'shoulder-rolls'],
  legs: ['hip-circles', 'worlds-greatest', 'jumping-jacks', 'cat-cow'],
  full: ['jumping-jacks', 'arm-circles', 'cat-cow', 'worlds-greatest'],
  mobility: [
    'cat-cow',
    'shoulder-pass',
    'worlds-greatest',
    'hip-circles',
    'wrist-prep',
    'arm-circles',
    'neck-tilts',
    'shoulder-rolls',
  ],
};
const COOL: Record<TemplateId, string[]> = {
  push: ['doorway-chest', 'cobra-stretch', 'child-pose', 'chest-opener'],
  pull: ['wall-lat-stretch', 'child-pose', 'doorway-chest', 'forward-fold'],
  legs: [
    'couch-stretch',
    'seated-hamstring',
    'deep-squat-hold',
    'child-pose',
    'forward-fold',
    'knees-to-chest',
  ],
  full: ['child-pose', 'seated-hamstring', 'doorway-chest', 'deep-squat-hold', 'forward-fold'],
  mobility: [
    'child-pose',
    'cobra-stretch',
    'couch-stretch',
    'seated-hamstring',
    'doorway-chest',
    'deep-squat-hold',
    'wall-lat-stretch',
    'forward-fold',
    'knees-to-chest',
    'downward-dog',
  ],
};

export const FORMATS: Record<Format, string> = {
  straight: 'Straight sets',
  circuit: 'Circuit',
  emom: 'EMOM',
};

export const isWarmOrCool = (role: PlanRole): boolean => role === 'warm' || role === 'cool';

/** Weight for picking an exercise: done recently → less likely (0.25–2). */
function recency(you: You, id: string, today: string): number {
  const last = you.progress.lastDone[id];
  const days = last ? daysBetween(last, today) : 14;
  return clamp(days / 4, 0.25, 2);
}

interface Candidate {
  id: string;
  w: number;
}

type Slot = Template['slots'][number];

/** Exercises that could fill a slot, weighted: your level most, one either side less. */
function candidates(
  you: You,
  slot: Slot,
  tplKey: TemplateId,
  today: string,
  takenIds: Set<string>,
  takenLadders: Set<string>,
): Candidate[] {
  const { pinned, lastPick } = you.progress;
  const run = (strict: boolean): Candidate[] => {
    const out: Candidate[] = [];
    for (const ladderId of slot.ladders) {
      if (strict && takenLadders.has(ladderId)) {
        continue;
      }
      const available = availableIndexes(you, ladderId);
      if (!available.length) {
        continue;
      }
      const pos = available.indexOf(effectiveIndex(you, ladderId));
      const picks: Array<[number, number]> = [[available[pos], 3]];
      if (pos > 0) {
        picks.push([available[pos - 1], 1.2]);
      }
      if (pos < available.length - 1) {
        picks.push([available[pos + 1], 0.7]);
      }
      for (const pinnedId of pinned) {
        const ex = EX[pinnedId];
        if (
          ex &&
          ex.ladder === ladderId &&
          usable(you, pinnedId) &&
          !picks.some(([i]) => i === ex.idx)
        ) {
          picks.push([ex.idx, 3]);
        }
      }
      for (const [i, weight] of picks) {
        const id = LAD[ladderId].ids[i];
        if (takenIds.has(id)) {
          continue;
        }
        let w = weight * recency(you, id, today);
        if (pinned.includes(id)) {
          w *= 5;
        }
        if (lastPick[tplKey + ':' + slot.role] === id) {
          w *= 0.05;
        }
        out.push({ id, w });
      }
    }
    return out;
  };
  const strict = run(true);
  return strict.length ? strict : run(false);
}

function pickWeighted(list: Candidate[], random: Random): string | null {
  const total = list.reduce((sum, c) => sum + c.w, 0);
  if (!total) {
    return null;
  }
  let r = random() * total;
  for (const c of list) {
    r -= c.w;
    if (r <= 0) {
      return c.id;
    }
  }
  return list[list.length - 1].id;
}

/** Reps or seconds per set: last session's result, up to the goal; ¾ in a deload week. */
function targetAmount(you: You, id: string, week: WeekInfo): number {
  const ex = EX[id];
  const stat = you.progress.stats[id];
  let amount = stat && stat.next ? stat.next : ex.start;
  amount = Math.min(ex.goal, amount);
  if (week.deload && ex.kind !== 'time') {
    amount = Math.max(3, Math.round(amount * 0.75));
  }
  return amount;
}

function setsFor(role: PlanRole, week: WeekInfo): number {
  if (role === 'balance') {
    return week.light ? 2 : 3;
  }
  const base = week.deload ? Math.max(2, week.sets - 1) : week.sets;
  if (role === 'main' || role === 'second') {
    return base + 1 > 4 ? 4 : base;
  }
  return 2;
}

function pickMobility(
  you: You,
  list: string[],
  n: number,
  random: Random,
  today: string,
): string[] {
  const pool = list
    .filter((id) => usable(you, id))
    .map((id) => ({ id, w: recency(you, id, today) }));
  const out: string[] = [];
  while (out.length < n && pool.length) {
    const id = pickWeighted(pool, random)!;
    out.push(id);
    pool.splice(
      pool.findIndex((p) => p.id === id),
      1,
    );
  }
  return out;
}

function makeItem(
  you: You,
  id: string,
  role: PlanRole,
  week: WeekInfo,
  secsOverride?: number,
): PlanItem {
  const ex = EX[id];
  return {
    id,
    role,
    sets: ex.kind === 'time' ? 1 : setsFor(role, week),
    amount: secsOverride || targetAmount(you, id, week),
  };
}

function pickFormat(random: Random, tplId: TemplateId): Format {
  if (tplId === 'mobility') {
    return 'straight';
  }
  const r = random();
  if (r < 0.5) {
    return 'straight';
  }
  return r < 0.8 ? 'circuit' : 'emom';
}

export interface PlanOptions {
  /** a lighter session (a boxing day too) */
  light?: boolean;
  /** changes the random picks: "Shuffle session" */
  salt?: string;
  format?: Format;
}

/** A whole session: warm-up, one exercise per template slot, cool-down. */
export function buildPlan(
  you: You,
  tplId: TemplateId,
  day: string,
  options: PlanOptions = {},
): Plan {
  const light = !!options.light;
  const week0 = weekInfo(you, day);
  const week = light ? { ...week0, sets: Math.min(week0.sets, 2), light: true } : week0;
  const template = TEMPLATES[tplId];
  const random = mulberry(hash(day + tplId + you.progress.sessionsDone + (options.salt || '')));
  const items: PlanItem[] = [];
  const takenIds = new Set<string>();
  const takenLadders = new Set<string>();
  const mobilitySecs = tplId === 'mobility' ? 60 : 0;
  const warmCount = tplId === 'mobility' ? 3 : 1;
  const coolCount = tplId === 'mobility' ? 4 : 1;
  const warm = pickMobility(you, WARM[tplId], warmCount, random, day).map((id) =>
    makeItem(you, id, 'warm', week, mobilitySecs || undefined),
  );
  items.push(...warm);
  for (const slot of template.slots) {
    const id = pickWeighted(candidates(you, slot, tplId, day, takenIds, takenLadders), random);
    if (!id) {
      continue;
    }
    takenIds.add(id);
    takenLadders.add(EX[id].ladder);
    items.push(makeItem(you, id, slot.role, week));
  }
  const cool = pickMobility(you, COOL[tplId], coolCount, random, day).map((id) =>
    makeItem(you, id, 'cool', week, mobilitySecs || undefined),
  );
  items.push(...cool);
  const plan: Plan = {
    tpl: tplId,
    date: day,
    week,
    format: options.format || pickFormat(random, tplId),
    items,
    light,
  };
  if (tplId !== 'mobility') {
    fitPlan(you, plan);
  }
  return plan;
}

/* ---------------- steps: the sequence the runner walks through ---------------- */

const perSide = (ex: Exercise): number => (ex.per ? 2 : 1);

/** Seconds a set takes: 3 s a rep (or the hold), plus 6 s to get set. */
function setSecs(ex: Exercise, amount: number): number {
  if (ex.kind === 'reps') {
    return amount * perSide(ex) * 3 + 6;
  }
  if (ex.kind === 'hold') {
    return amount * perSide(ex) + 6;
  }
  return amount;
}

/** Seconds of work in a logged set (for calories). */
export function workSecs(ex: Exercise, amount: number): number {
  return ex.kind === 'reps' ? amount * perSide(ex) * 3 : amount * perSide(ex);
}

export function buildSteps(plan: Plan): Step[] {
  const steps: Step[] = [];
  const items = plan.items;
  const warm = items.filter((x) => x.role === 'warm');
  const cool = items.filter((x) => x.role === 'cool');
  const main = items.filter((x) => !['warm', 'cool', 'balance'].includes(x.role));
  const balance = items.filter((x) => x.role === 'balance');
  const timed = (x: PlanItem, label: string): void => {
    steps.push({ k: 'time', id: x.id, secs: x.amount, label });
  };
  const setStep = (
    x: PlanItem,
    n: number,
    rest: number,
    extra: Partial<SetStep> = {},
  ): SetStep => ({
    k: 'set',
    id: x.id,
    n,
    of: x.sets,
    amount: x.amount,
    rest,
    ...extra,
  });
  warm.forEach((x) => timed(x, 'Warm-up'));
  const format = main.length < 2 ? 'straight' : plan.format;
  if (format === 'straight') {
    main.forEach((x) => {
      for (let n = 1; n <= x.sets; n++) {
        steps.push(setStep(x, n, n < x.sets ? 40 : 30));
      }
    });
  } else if (format === 'circuit') {
    const rounds = Math.max(...main.map((x) => x.sets));
    for (let r = 1; r <= rounds; r++) {
      const part = main.filter((x) => x.sets >= r);
      part.forEach((x, i) =>
        steps.push(setStep(x, r, i < part.length - 1 ? 20 : 50, { round: r, rounds })),
      );
    }
  } else {
    /* EMOM: exercises in pairs, each set at the top of a minute */
    const rounds = Math.max(...main.map((x) => x.sets));
    const pairs: PlanItem[][] = [];
    for (let i = 0; i < main.length; i += 2) {
      pairs.push(main.slice(i, i + 2));
    }
    pairs.forEach((pair) => {
      for (let r = 1; r <= rounds; r++) {
        pair
          .filter((x) => x.sets >= r)
          .forEach((x) => {
            const kind = EX[x.id].kind;
            let amount = Math.min(x.amount, 30);
            if (kind === 'time') {
              amount = x.amount;
            } else if (kind === 'reps') {
              amount = Math.max(3, Math.round(x.amount * 0.75));
            }
            steps.push(setStep(x, r, 0, { amount, block: 60, emom: true }));
          });
      }
    });
  }
  balance.forEach((x) => {
    for (let n = 1; n <= x.sets; n++) {
      steps.push(setStep(x, n, n < x.sets ? 30 : 20));
    }
  });
  cool.forEach((x) => timed(x, 'Cool-down'));
  const last = steps[steps.length - 1];
  if (last && last.k === 'set') {
    last.rest = 0;
  }
  return steps;
}

/** How long a plan takes and roughly what it burns. */
export function estimate(you: You, plan: Plan): { sec: number; kcal: number; steps: number } {
  const steps = buildSteps(plan);
  const kg = weightKg(you);
  let sec = 0;
  let kcal = 0;
  steps.forEach((s) => {
    const ex = EX[s.id];
    let active: number;
    let rest = s.k === 'set' ? s.rest || 0 : 0;
    if (s.k === 'time') {
      active = s.secs;
    } else if (s.block) {
      active = 60;
      rest = 0;
    } else {
      active = setSecs(ex, s.amount);
    }
    sec += active + rest;
    const block = s.k === 'set' && s.block;
    kcal +=
      (ex.met * kg * (block ? 40 : active)) / 3600 + (REST_MET * kg * (block ? 20 : rest)) / 3600;
  });
  return { sec, kcal: Math.round(kcal), steps: steps.length };
}

const FIT_ORDER: PlanRole[] = ['main', 'second', 'third', 'core', 'balance'];

/** Adds or trims sets until the plan fits the session length (±1–2½ min). */
export function fitPlan(you: You, plan: Plan): void {
  const target = (plan.light ? Math.min(15, you.profile.minutes) : you.profile.minutes) * 60;
  const ofRole = (role: PlanRole): PlanItem[] => plan.items.filter((i) => i.role === role);
  for (let guard = 0; guard < 24; guard++) {
    const seconds = estimate(you, plan).sec;
    if (seconds > target + 60) {
      /* trim: last roles first, never below 2 sets (balance keeps 2 attempts) */
      const x = [...FIT_ORDER]
        .reverse()
        .flatMap(ofRole)
        .find((i) => i.sets > 2);
      if (!x) {
        break;
      }
      x.sets--;
    } else if (!plan.light && seconds < target - 150) {
      const x = FIT_ORDER.flatMap(ofRole)
        .filter((i) => i.sets < (i.role === 'main' || i.role === 'second' ? 4 : 3))
        .sort((a, b) => a.sets - b.sets)[0];
      if (!x) {
        break;
      }
      x.sets++;
    } else {
      break;
    }
  }
}

/** Swaps one exercise of a plan for another that fits its slot. False if none. */
export function rerollItem(you: You, plan: Plan, index: number): boolean {
  const item = plan.items[index];
  if (!item || isWarmOrCool(item.role)) {
    return false;
  }
  const slot = TEMPLATES[plan.tpl].slots.find((s) => s.role === item.role);
  if (!slot) {
    return false;
  }
  const others = new Set(plan.items.map((x, j) => (j !== index ? x.id : item.id)));
  const ladders = new Set(plan.items.filter((_, j) => j !== index).map((x) => EX[x.id].ladder));
  const id = pickWeighted(candidates(you, slot, plan.tpl, plan.date, others, ladders), Math.random);
  if (!id) {
    return false;
  }
  plan.items[index] = { ...makeItem(you, id, item.role, plan.week), sets: item.sets };
  fitPlan(you, plan);
  return true;
}

/* ---------------- results and progression ---------------- */

export interface Result {
  id: string;
  sets: number[];
  target: number;
  planned: number;
}

export interface WorkSegment {
  met: number;
  sec: number;
}

export interface LevelUpOffer {
  ladder: string;
  from: string;
  to: string;
  idx: number;
}

/** Updates `you.progress` with a finished workout and returns the session to
    save, plus any level-ups to offer. */
export function recordSession(
  you: You,
  plan: Plan,
  results: Result[],
  startedAt: number,
  workSegments: WorkSegment[],
  restSec: number,
  now: number,
): { doc: Session; ups: LevelUpOffer[] } {
  const progress = you.progress;
  const today = plan.date;
  const week = plan.week;
  const items: SessionItem[] = [];
  results.forEach((r) => {
    const ex = EX[r.id];
    if (!r.sets.length) {
      return;
    }
    items.push({ id: r.id, sets: r.sets, target: r.target, planned: r.planned });
    if (ex.kind === 'time') {
      return;
    }
    const stat = progress.stats[r.id] || (progress.stats[r.id] = { hits: 0, atGoal: 0 });
    const full = r.sets.length >= r.planned && r.sets.every((v) => v >= r.target);
    let step = 1;
    if (ex.kind === 'hold') {
      step = 5;
    } else if (ex.goal >= 15) {
      step = 2;
    }
    if (full) {
      stat.hits = (stat.hits || 0) + 1;
      stat.atGoal = r.target >= ex.goal ? (stat.atGoal || 0) + 1 : 0;
      stat.next = Math.min(ex.goal, r.target + (week.deload ? 0 : step));
    } else {
      stat.hits = 0;
      stat.atGoal = 0;
      stat.next = Math.max(ex.start, Math.min(r.target, Math.min(...r.sets)));
    }
    stat.best = Math.max(stat.best || 0, ...r.sets);
  });
  items.forEach((i) => {
    progress.lastDone[i.id] = today;
  });
  plan.items.forEach((x) => {
    if (!isWarmOrCool(x.role)) {
      progress.lastPick[plan.tpl + ':' + x.role] = x.id;
    }
  });
  progress.sessionsDone = (progress.sessionsDone || 0) + 1;
  const kg = weightKg(you);
  let kcal = 0;
  workSegments.forEach((s) => {
    kcal += (s.met * kg * s.sec) / 3600;
  });
  kcal += (REST_MET * kg * restSec) / 3600;
  const doc: Session = {
    ts: now,
    date: today,
    tpl: plan.tpl,
    format: plan.format,
    week: week.week,
    duration: Math.round((now - startedAt) / 1000),
    kcal: Math.round(kcal),
    weight: kg,
    items,
  };
  /* two sessions in a row at the goal: offer the next exercise in the ladder */
  const ups: LevelUpOffer[] = [];
  items.forEach((i) => {
    const ex = EX[i.id];
    const stat = progress.stats[i.id];
    if (!stat || ex.kind === 'time' || ex.fam === 'mobility') {
      return;
    }
    if ((stat.atGoal || 0) >= 2 && ex.idx >= effectiveIndex(you, ex.ladder)) {
      const n = nextIndex(you, ex.ladder, ex.idx);
      if (n >= 0 && !ups.find((u) => u.ladder === ex.ladder)) {
        ups.push({ ladder: ex.ladder, from: ex.id, to: LAD[ex.ladder].ids[n], idx: n });
      }
    }
  });
  return { doc, ups };
}

export function acceptLevelUp(you: You, up: LevelUpOffer, today: string): void {
  const progress = you.progress;
  progress.levels[up.ladder] = up.idx;
  progress.levelups.push({ date: today, ladder: up.ladder, from: up.from, to: up.to });
  if (progress.stats[up.from]) {
    progress.stats[up.from].atGoal = 0;
  }
}

/** A level per ladder: `fraction` of the way up what you can do (0 beginner … 0.7 strong). */
export function startingLevels(you: You, fraction: number): Record<string, number> {
  const levels: Record<string, number> = {};
  Object.keys(LAD).forEach((ladderId) => {
    if (isMobility(ladderId)) {
      return;
    }
    const available = availableIndexes(you, ladderId);
    if (!available.length) {
      return;
    }
    const k = Math.round(fraction * (available.length - 1));
    levels[ladderId] = available[clamp(k, 0, available.length - 1)];
  });
  return levels;
}

/* ---------------- stretch routines ---------------- */

export const ROUTINE_IDS: RoutineId[] = ['am', 'mid', 'pm'];

/** The routine for this time of day. */
export function routineNow(): RoutineId {
  const hour = hourNow();
  if (hour < 11) {
    return 'am';
  }
  return hour < 16 ? 'mid' : 'pm';
}

/** The day's stretches for a routine: the remembered ones if still usable,
    otherwise a weighted random pick per slot (seeded by the day, so it comes
    out the same until shuffled). Does not save — see rememberRoutine. */
export function routineItems(you: You, key: RoutineId, day: string): string[] {
  const stored = you.progress.rplan?.[day + ':' + key];
  if (stored) {
    const ok = stored.filter((id) => EX[id] && usable(you, id));
    if (ok.length >= 4) {
      return ok;
    }
  }
  const routine = ROUTINES[key];
  const random = mulberry(hash(day + key + (you.progress.rsalt || 0) + you.progress.sessionsDone));
  const last = new Set(you.progress.lastRoutine?.[key] || []);
  const pool = Object.keys(STRETCH_TAGS).filter(
    (id) => EX[id] && usable(you, id) && !(routine.avoid || []).includes(stretchTag(id)!.p),
  );
  const taken = new Set<string>();
  const picked: string[] = [];
  routine.slots.forEach((regions) => {
    const options = pool
      .filter((id) => !taken.has(id) && stretchTag(id)!.r.some((r) => regions.includes(r)))
      .map((id) => {
        let w = recency(you, id, day);
        if (you.progress.pinned.includes(id)) {
          w *= 5;
        }
        if (last.has(id)) {
          w *= 0.2;
        }
        return { id, w };
      });
    const id = pickWeighted(options, random);
    if (!id) {
      return;
    }
    taken.add(id);
    picked.push(id);
  });
  /* standing first, lying down last */
  return picked
    .map((id, n) => ({ id, n }))
    .sort(
      (a, b) =>
        POSTURE_ORDER[stretchTag(a.id)!.p] - POSTURE_ORDER[stretchTag(b.id)!.p] || a.n - b.n,
    )
    .map((x) => x.id);
}

/** Saves the day's pick for a routine (and forgets other days'). True if anything changed. */
export function rememberRoutine(you: You, key: RoutineId, day: string): boolean {
  const progress = you.progress;
  const store = progress.rplan || (progress.rplan = {});
  const ids = routineItems(you, key, day);
  let changed = false;
  Object.keys(store).forEach((k) => {
    if (!k.startsWith(day + ':')) {
      delete store[k];
      changed = true;
    }
  });
  const ck = day + ':' + key;
  if (JSON.stringify(store[ck]) !== JSON.stringify(ids)) {
    store[ck] = ids;
    changed = true;
  }
  return changed;
}

export function routineSteps(you: You, key: RoutineId, day: string): TimeStep[] {
  const routine = ROUTINES[key];
  const ids = routineItems(you, key, day);
  const steps: TimeStep[] = [];
  ids.forEach((id, i) => {
    const ex = EX[id];
    const base: TimeStep = {
      k: 'time',
      id,
      secs: Math.min(ex.goal || routine.secs, ex.per ? 30 : 45),
      label: `${routine.name} · ${i + 1} of ${ids.length}`,
    };
    if (ex.per) {
      steps.push({ ...base, side: 'Left side' });
      steps.push({ ...base, side: 'Right side' });
    } else {
      steps.push(base);
    }
  });
  return steps;
}

/** A routine's length: each stretch plus 5 s to get into it. */
export const routineSecs = (you: You, key: RoutineId, day: string): number =>
  routineSteps(you, key, day).reduce((sum, s) => sum + s.secs + 5, 0) + 3;

export const routinesDone = (you: You, day: string): RoutineId[] =>
  you.progress.routines?.[day] || [];

/** Marks a routine done today; keeps 120 days of history. */
export function markRoutine(you: You, key: RoutineId, now: number): void {
  const progress = you.progress;
  const day = ymd(new Date(now));
  const routines = progress.routines || (progress.routines = {});
  if (!(routines[day] || []).includes(key)) {
    routines[day] = (routines[day] || []).concat(key);
  }
  const ids = routineItems(you, key, day);
  (progress.lastRoutine || (progress.lastRoutine = {}))[key] = ids;
  ids.forEach((id) => {
    progress.lastDone[id] = day;
  });
  const cutoff = addDays(day, -120);
  Object.keys(routines).forEach((k) => {
    if (k < cutoff) {
      delete routines[k];
    }
  });
}

/* ---------------- the Today screen's calendar ---------------- */

export interface StripDay {
  dow: number;
  kind: DayKind;
  did: boolean;
  today: boolean;
  /** training and boxing */
  both: boolean;
}

/** This week, Monday to Sunday, for the strip at the top of Today. */
export function weekStrip(you: You, sessions: Session[], now: Date): StripDay[] {
  const monday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - ((now.getDay() + 6) % 7),
  );
  const today = ymd(now);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const day = ymd(date);
    return {
      dow: date.getDay(),
      kind: dayKind(you, date),
      did: sessions.some((s) => s.date === day),
      today: day === today,
      both: boxToo(you, date),
    };
  });
}
