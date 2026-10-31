import { now, todayStr } from './dates';
import { db } from './db';
import { A3 } from './motion/mannequin3d';
import { EX, type TemplateId } from './motion/library';
import {
  boxToo,
  buildPlan,
  dayKind,
  defaultProfile,
  defaultProgress,
  fitPlan,
  rerollItem,
  startingLevels,
  templateFor,
  type LevelUpOffer,
} from './training';
import type { BodyEntry, Format, Plan, Profile, Progress, Session, View } from './types';
import type { CameraPreset } from './motion/mannequin3d';
import type { RoutineId } from './motion/library';
import { toast } from './ui/toast.svelte';

/* Everything the screens show, kept live from the database, and every action
   that changes it. Svelte re-draws whatever reads a $state value when it
   changes — like a spreadsheet recalculating. The training logic itself is
   in training.ts; the workout runner in run.svelte.ts. */

export type Tab = 'today' | 'lib' | 'prog' | 'me';

export type Summary =
  | { kind: 'workout'; doc: Session; ups: LevelUpOffer[] }
  | { kind: 'routine'; routine: RoutineId; kcal: number; secs: number; count: number };

/** Profile changes are saved this long after the last one (typing, tapping days). */
const PROFILE_SAVE_MS = 400;
const USER = 'user';

export const data = $state({
  loaded: false,
  /** no profile saved yet: the set-up sheet shows */
  fresh: false,
  profile: defaultProfile(todayStr()),
  progress: defaultProgress(),
  body: [] as BodyEntry[],
  /** finished workouts, oldest first */
  sessions: [] as Session[],
});

export const ui = $state({
  tab: 'today' as Tab,
  sheet: null as { type: 'ex'; id: string } | { type: 'quit' } | null,
  /** "Change session" chips open */
  showTpl: false,
  /** a session chosen by hand instead of the day's */
  tplOverride: null as TemplateId | null,
  /** bumped by "Shuffle session" */
  salt: 0,
  libFam: 'all',
  libQuery: '',
  /** the exercise charted on Progress */
  progEx: null as string | null,
  /** the 3D camera preset chosen, and the one shown (dragging makes it 'free') */
  cam: '3d' as CameraPreset,
  camShown: '3d' as CameraPreset,
  /** the set-up sheet's choices */
  onb: { frac: 0.4, equip: { wall: true, sturdy: true } as Record<string, boolean> },
  summary: null as Summary | null,
  /** bumped when today's plan is changed in place (format, swap, shuffle) */
  planVersion: 0,
});

/* ---------------- loading and saving ---------------- */

/** The JSON of each document as last loaded or saved, so the app can tell its
    own saves coming back from real changes (a restored backup, another tab). */
const known: Record<string, string> = {};
let profileTimer: ReturnType<typeof setTimeout> | undefined;

export function startState(): void {
  db.collection(USER).onSnapshot((snap) => {
    const docs: Record<string, Record<string, unknown>> = {};
    snap.docs.forEach((doc) => {
      docs[doc.id] = doc.data();
    });
    applyDocs(docs);
  });
}

function applyDocs(docs: Record<string, Record<string, unknown>>): void {
  /** True (and remembered) when `json` differs from what the app already has. */
  const changed = (key: string, json: string): boolean => {
    if (known[key] === json && data.loaded) {
      return false;
    }
    known[key] = json;
    return true;
  };
  const jsonOf = (id: string): string => JSON.stringify(docs[id] ?? null);
  if (changed('profile', jsonOf('profile'))) {
    const saved = docs.profile as Partial<Profile> | undefined;
    data.fresh = !saved;
    const profile = { ...defaultProfile(todayStr()), ...(saved ?? {}) } as Profile;
    profile.equip = { ...(saved?.equip ?? defaultProfile(todayStr()).equip) };
    /* old saves: Tuesday and Thursday became training days too */
    if (saved && !saved.v2days) {
      profile.trainDays = Array.from(new Set(profile.trainDays.concat([2, 4]))).sort();
      profile.v2days = true;
      setTimeout(() => saveProfile(true), 0);
    }
    clearTimeout(profileTimer);
    data.profile = profile;
  }
  if (changed('progress', jsonOf('progress'))) {
    const progress = { ...defaultProgress(), ...((docs.progress as Partial<Progress>) ?? {}) };
    progress.routines ||= {};
    data.progress = progress;
  }
  if (changed('body', jsonOf('body'))) {
    data.body = ((docs.body as { entries?: BodyEntry[] } | undefined)?.entries ?? []).slice();
  }
  const sessions = Object.keys(docs)
    .filter((id) => id.startsWith('ses_'))
    .map((id) => docs[id] as unknown as Session)
    .sort((a, b) => a.ts - b.ts);
  if (changed('sessions', JSON.stringify(sessions))) {
    data.sessions = sessions;
  }
  data.loaded = true;
}

function write(id: string, value: unknown): void {
  known[id] = JSON.stringify(value);
  db.collection(USER)
    .doc(id)
    .set(JSON.parse(known[id]))
    .catch(() => toast('Could not save.'));
}

/** Saves the profile — after a short pause (several quick taps make one save), or now. */
export function saveProfile(now = false): void {
  clearTimeout(profileTimer);
  const save = (): void => write('profile', data.profile);
  if (now) {
    save();
  } else {
    profileTimer = setTimeout(save, PROFILE_SAVE_MS);
  }
}

export const saveProgress = (): void => write('progress', data.progress);
export const saveBody = (): void => write('body', { entries: data.body });

export function saveSession(doc: Session): void {
  data.sessions.push(doc);
  known.sessions = JSON.stringify(data.sessions);
  write('ses_' + doc.ts.toString(36), doc);
}

/** "Delete all my data": back to the set-up sheet. */
export async function deleteEverything(): Promise<void> {
  clearTimeout(profileTimer);
  const snap = await db.collection(USER).get();
  await Promise.all(snap.docs.map((doc) => db.collection(USER).doc(doc.id).delete()));
  ui.onb = { frac: 0.4, equip: { wall: true, sturdy: true } };
  ui.sheet = null;
}

/* ---------------- navigation ---------------- */

export function go(tab: Tab): void {
  ui.tab = tab;
  ui.sheet = null;
  window.scrollTo(0, 0);
}

export function openExercise(id: string): void {
  ui.sheet = { type: 'ex', id };
}

export const closeSheet = (): void => {
  ui.sheet = null;
};

/* ---------------- animations ---------------- */

/** 3D figures: on unless switched to 2D, and only if WebGL works here. */
export function use3d(): boolean {
  return A3.ok && data.profile.mode !== '2d' && A3.available();
}

const VIEWS: View[] = ['side', 'front', 'both'];

/** The camera view for an exercise's 2D animation: the saved choice or its default. */
export function viewOf(id: string): View {
  const ex = EX[id];
  if (!ex.front) {
    return 'side';
  }
  const saved = (data.profile.views || {})[id];
  return saved && VIEWS.includes(saved) ? saved : VIEWS[ex.fdef || 0];
}

export function setView(id: string, view: View): void {
  data.profile.views = { ...(data.profile.views || {}), [id]: view };
  saveProfile(true);
}

export function setCamera(preset: CameraPreset): void {
  ui.cam = preset;
  ui.camShown = preset;
  A3.current()?.setPreset(preset);
}

/* ---------------- today's plan ---------------- */

/** Today's session: the chosen one, the day's turn on a training day, or none. */
export function currentTemplate(): TemplateId | null {
  if (ui.tplOverride) {
    return ui.tplOverride;
  }
  return dayKind(data, now()) === 'train' ? templateFor(data, todayStr()) : null;
}

/** What today's plan depends on: when any of it changes, the plan is rebuilt. */
function signature(): string {
  const { profile, progress } = data;
  return JSON.stringify([
    profile.equip,
    progress.levels,
    progress.hidden,
    progress.pinned,
    profile.minutes,
    profile.trainDays,
    profile.weight,
    profile.lightBox,
  ]);
}

/* The plan is built once and kept (not $state: it is a plain object changed
   in place), and rebuilt when its key changes. */
let planCache: { key: string; plan: Plan } | null = null;

export function currentPlan(): Plan | null {
  void ui.planVersion;
  const tpl = currentTemplate();
  if (!tpl) {
    return null;
  }
  const today = todayStr();
  const both = boxToo(data, now());
  const key = [today, tpl, signature(), data.progress.sessionsDone, ui.salt, both ? 'b' : ''].join(
    '|',
  );
  if (!planCache || planCache.key !== key) {
    planCache = {
      key,
      plan: buildPlan(data, tpl, today, {
        ...(ui.salt ? { salt: 's' + ui.salt } : {}),
        light: both && data.profile.lightBox !== false,
      }),
    };
  }
  return planCache.plan;
}

/** Change today's plan in place, then show it. */
function changePlan(change: (plan: Plan) => void): void {
  const plan = currentPlan();
  if (!plan || !planCache) {
    return;
  }
  change(plan);
  planCache.plan = { ...plan, items: plan.items.map((item) => ({ ...item })) };
  ui.planVersion++;
}

export function setFormat(format: Format): void {
  changePlan((plan) => {
    plan.format = format;
  });
}

export function chooseTemplate(tpl: TemplateId): void {
  ui.tplOverride = tpl;
  ui.showTpl = false;
}

/** New random picks — but pinned exercises stay. */
export function shuffleSession(): void {
  const old = currentPlan();
  ui.salt++;
  const fresh = currentPlan();
  if (!old || !fresh) {
    return;
  }
  changePlan((plan) => {
    old.items.forEach((item) => {
      if (data.progress.pinned.includes(item.id) && !plan.items.some((x) => x.id === item.id)) {
        const j = plan.items.findIndex(
          (x) => x.role === item.role && !data.progress.pinned.includes(x.id),
        );
        if (j >= 0) {
          plan.items[j] = { ...item };
        }
      }
    });
    fitPlan(data, plan);
  });
}

export function swapExercise(index: number): void {
  let ok = true;
  changePlan((plan) => {
    ok = rerollItem(data, plan, index);
  });
  if (!ok) {
    toast('No other option fits your equipment.');
  }
}

/* ---------------- exercises ---------------- */

function toggleIn(list: string[], value: string): void {
  const i = list.indexOf(value);
  if (i >= 0) {
    list.splice(i, 1);
  } else {
    list.push(value);
  }
}

export function togglePin(id: string): void {
  toggleIn(data.progress.pinned, id);
  saveProgress();
}

export function toggleHidden(id: string): void {
  toggleIn(data.progress.hidden, id);
  saveProgress();
}

export function setLevel(id: string): void {
  const ex = EX[id];
  data.progress.levels[ex.ladder] = ex.idx;
  saveProgress();
  toast(ex.name + ' is now your level.');
}

export function resetLevels(fraction: number): void {
  data.progress.levels = startingLevels(data, fraction);
  saveProgress();
  toast('Starting levels updated.');
}

/* ---------------- set-up ---------------- */

/** "Build my plan": the set-up sheet's choices become the profile. */
export function finishSetup(weight: number): void {
  const profile = { ...defaultProfile(todayStr()), equip: { ...ui.onb.equip } };
  if (weight >= 20 && weight <= 300) {
    profile.weight = weight;
    profile.weightSet = true;
  }
  data.profile = profile;
  data.progress = defaultProgress();
  data.progress.levels = startingLevels(data, ui.onb.frac);
  data.fresh = false;
  saveProfile(true);
  saveProgress();
}
