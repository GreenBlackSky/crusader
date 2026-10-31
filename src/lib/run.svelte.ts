import { mmss, todayStr } from './dates';
import { EX, type RoutineId } from './motion/library';
import { currentPlan, data, saveProgress, saveSession, ui } from './state.svelte';
import {
  buildSteps,
  markRoutine,
  recordSession,
  routineSteps,
  weightKg,
  workSecs,
  type Result,
  type WorkSegment,
} from './training';
import type { Plan, Step } from './types';

/* The workout and stretch-routine runner: a small state machine stepping
   through the plan's steps, with timers. A clock ticks every 200 ms while it
   runs; screens read `clock.now`, so timers redraw by themselves.

   Phases of a step:
     ready      waiting for "Start" (a timed warm-up, a hold) or a logged set
     prep       routines only: a few seconds to get into position
     work       the timer runs
     rest       rest between sets, counting down
     blockrest  EMOM: set logged, waiting for the next minute */

export type Phase = 'ready' | 'prep' | 'work' | 'rest' | 'blockrest';

export interface Run {
  routine: RoutineId | null;
  plan: Plan | null;
  steps: Step[];
  /** the current step */
  i: number;
  phase: Phase;
  startedAt: number;
  results: Record<string, Result>;
  workSegs: WorkSegment[];
  restSec: number;
  /** the reps (or seconds) stepper */
  val: number;
  stepStart: number;
  prepEnd: number;
  prepTotal: number;
  restEnd: number;
  restTotal: number;
  blockEnd: number;
  paused: boolean;
  pausedAt: number;
  /** the hold's target was reached (beeped once) */
  beeped: boolean;
}

const TICK_MS = 200;
/** Seconds to get into position: the first stretch, then each next one. */
const FIRST_PREP_S = 8;
const PREP_S = 5;
const MORE_REST_S = 15;

export const runner = $state({ run: null as Run | null });
export const clock = $state({ now: Date.now() });

let ticker: ReturnType<typeof setInterval> | undefined;

const clampPct = (x: number): number => Math.max(0, Math.min(100, x));

export const currentStep = (run: Run): Step => run.steps[run.i];

function newRun(routine: RoutineId | null, plan: Plan | null, steps: Step[]): Run {
  const now = Date.now();
  return {
    routine,
    plan,
    steps,
    i: 0,
    phase: 'ready',
    startedAt: now,
    results: {},
    workSegs: [],
    restSec: 0,
    val: 0,
    stepStart: 0,
    prepEnd: 0,
    prepTotal: 0,
    restEnd: 0,
    restTotal: 0,
    blockEnd: 0,
    paused: false,
    pausedAt: 0,
    beeped: false,
  };
}

function startTicking(): void {
  clearInterval(ticker);
  clock.now = Date.now();
  ticker = setInterval(tick, TICK_MS);
}

function stopTicking(): void {
  clearInterval(ticker);
  ticker = undefined;
}

export function startWorkout(): void {
  const plan = currentPlan();
  if (!plan) {
    return;
  }
  const steps = buildSteps(plan);
  const run = newRun(null, plan, steps);
  steps.forEach((s) => {
    if (s.k === 'set' && !run.results[s.id]) {
      run.results[s.id] = {
        id: s.id,
        sets: [],
        target: s.amount,
        planned: steps.filter((z) => z.k === 'set' && z.id === s.id).length,
      };
    }
  });
  runner.run = run;
  enterStep();
  startTicking();
  window.scrollTo(0, 0);
}

export function startRoutine(key: RoutineId): void {
  runner.run = newRun(key, null, routineSteps(data, key, todayStr()));
  enterStep();
  startTicking();
  window.scrollTo(0, 0);
}

function enterStep(): void {
  const run = runner.run!;
  const step = currentStep(run);
  const now = Date.now();
  run.paused = false;
  run.beeped = false;
  if (run.routine) {
    run.phase = 'prep';
    run.prepTotal = run.i === 0 ? FIRST_PREP_S : PREP_S;
    run.prepEnd = now + run.prepTotal * 1000;
    return;
  }
  run.phase = 'ready';
  run.val = step.k === 'set' ? step.amount : 0;
  run.stepStart = 0;
  if (step.k === 'set' && step.block) {
    run.blockEnd = now + step.block * 1000;
    run.phase = 'work';
  }
}

/** A short beep (and a buzz on phones) when a timer ends. */
function beep(): void {
  try {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = 880;
    gain.gain.value = 0.08;
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      void context.close();
    }, 180);
    navigator.vibrate?.(120);
  } catch {
    /* no sound available: the screen still moves on */
  }
}

/** Every 200 ms: move the clock, and move on when a timer runs out. */
function tick(): void {
  const run = runner.run;
  if (!run) {
    stopTicking();
    return;
  }
  if (run.paused) {
    return;
  }
  const now = Date.now();
  clock.now = now;
  const step = currentStep(run);
  if (run.phase === 'prep') {
    if (run.prepEnd - now <= 0) {
      run.phase = 'work';
      run.stepStart = now;
      run.beeped = false;
      beep();
    }
  } else if (run.phase === 'rest') {
    if (Math.ceil((run.restEnd - now) / 1000) <= 0) {
      run.restSec += run.restTotal;
      beep();
      nextStep();
    }
  } else if (
    run.phase === 'blockrest' ||
    (run.phase === 'work' && step.k === 'set' && step.block)
  ) {
    /* EMOM: the next set starts at the top of the minute */
    if (Math.ceil((run.blockEnd - now) / 1000) <= 0) {
      beep();
      nextStep();
    }
  } else if (run.phase === 'work' && step.k === 'time') {
    const elapsed = (now - run.stepStart) / 1000;
    if (Math.ceil(step.secs - elapsed) <= 0) {
      run.workSegs.push({ met: EX[step.id].met, sec: step.secs });
      beep();
      nextStep();
    }
  } else if (run.phase === 'work' && step.k === 'set' && EX[step.id].kind === 'hold') {
    if (!run.beeped && (now - run.stepStart) / 1000 >= step.amount) {
      run.beeped = true;
      beep();
    }
  }
}

export interface TimerView {
  text: string;
  /** progress bar, 0–100 */
  pct: number;
}

/** What the big number and the bar show right now (null: no timer). */
export function timerView(run: Run, now: number): TimerView | null {
  const t = run.paused ? run.pausedAt : now;
  const step = currentStep(run);
  if (run.phase === 'prep') {
    const left = Math.max(0, Math.ceil((run.prepEnd - t) / 1000));
    return { text: String(left), pct: clampPct((1 - left / run.prepTotal) * 100) };
  }
  if (run.phase === 'rest') {
    const left = Math.max(0, Math.ceil((run.restEnd - t) / 1000));
    return { text: mmss(left), pct: clampPct((1 - left / run.restTotal) * 100) };
  }
  if (run.phase === 'blockrest' || (run.phase === 'work' && step.k === 'set' && step.block)) {
    const left = Math.max(0, Math.ceil((run.blockEnd - t) / 1000));
    const block = step.k === 'set' && step.block ? step.block : 60;
    return { text: mmss(left), pct: clampPct((1 - left / block) * 100) };
  }
  if (run.phase === 'work' && step.k === 'time') {
    const elapsed = (t - run.stepStart) / 1000;
    return {
      text: mmss(Math.max(0, Math.ceil(step.secs - elapsed))),
      pct: clampPct((elapsed / step.secs) * 100),
    };
  }
  if (run.phase === 'work' && step.k === 'set') {
    /* a hold counts up */
    const elapsed = (t - run.stepStart) / 1000;
    return { text: Math.floor(elapsed) + ' s', pct: clampPct((elapsed / step.amount) * 100) };
  }
  return null;
}

function nextStep(): void {
  const run = runner.run!;
  run.beeped = false;
  if (run.i >= run.steps.length - 1) {
    finish();
    return;
  }
  run.i++;
  enterStep();
  clock.now = Date.now();
}

function logSet(amount: number): void {
  const run = runner.run!;
  const step = currentStep(run);
  if (step.k !== 'set') {
    return;
  }
  const ex = EX[step.id];
  run.results[step.id].sets.push(amount);
  run.workSegs.push({ met: ex.met, sec: workSecs(ex, amount) });
  if (step.block) {
    run.phase = 'blockrest';
    return;
  }
  if (step.rest > 0 && run.i < run.steps.length - 1) {
    run.phase = 'rest';
    run.restTotal = step.rest;
    run.restEnd = Date.now() + step.rest * 1000;
    clock.now = Date.now();
  } else {
    nextStep();
  }
}

/* ---------------- buttons ---------------- */

export function begin(): void {
  const run = runner.run!;
  run.phase = 'work';
  run.stepStart = Date.now();
  run.beeped = false;
  clock.now = run.stepStart;
}

export const logReps = (): void => logSet(runner.run!.val);

export function holdDone(): void {
  logSet(Math.max(1, Math.round((Date.now() - runner.run!.stepStart) / 1000)));
}

export function changeValue(by: number): void {
  const run = runner.run!;
  run.val = Math.max(0, Math.min(999, run.val + by));
}

export function togglePause(): void {
  const run = runner.run!;
  const now = Date.now();
  if (!run.paused) {
    run.paused = true;
    run.pausedAt = now;
    return;
  }
  const paused = now - run.pausedAt;
  run.paused = false;
  if (run.phase === 'prep') {
    run.prepEnd += paused;
  } else if (run.phase === 'rest') {
    run.restEnd += paused;
  } else {
    run.stepStart += paused;
  }
  clock.now = now;
}

export function startNow(): void {
  const run = runner.run!;
  run.paused = false;
  run.prepEnd = Date.now();
  tick();
}

export function skipRest(): void {
  const run = runner.run!;
  run.paused = false;
  if (run.phase === 'rest') {
    run.restSec += Math.max(0, run.restTotal - Math.max(0, (run.restEnd - Date.now()) / 1000));
  }
  nextStep();
}

export function moreRest(): void {
  const run = runner.run!;
  run.restEnd += MORE_REST_S * 1000;
  run.restTotal += MORE_REST_S;
}

export const skipStep = (): void => nextStep();

export function askQuit(): void {
  ui.sheet = { type: 'quit' };
}

export function saveAndQuit(): void {
  ui.sheet = null;
  finish();
}

export function discard(): void {
  stopTicking();
  runner.run = null;
  ui.sheet = null;
}

/* ---------------- the end ---------------- */

function finish(): void {
  const run = runner.run!;
  stopTicking();
  const kg = weightKg(data);
  if (run.routine) {
    const kcal = Math.round(run.workSegs.reduce((sum, x) => sum + (x.met * kg * x.sec) / 3600, 0));
    const secs = Math.round(run.workSegs.reduce((sum, x) => sum + x.sec, 0));
    if (run.workSegs.length) {
      markRoutine(data, run.routine, Date.now());
      saveProgress();
    }
    ui.summary = { kind: 'routine', routine: run.routine, kcal, secs, count: run.workSegs.length };
    runner.run = null;
    return;
  }
  const results = Object.values(run.results);
  const any = results.some((x) => x.sets.length) || run.workSegs.length;
  if (!any || !run.plan) {
    runner.run = null;
    return;
  }
  const out = recordSession(
    data,
    run.plan,
    JSON.parse(JSON.stringify(results)),
    run.startedAt,
    run.workSegs,
    run.restSec,
    Date.now(),
  );
  saveSession(out.doc);
  saveProgress();
  ui.summary = { kind: 'workout', ...out };
  runner.run = null;
}

/** Sets logged so far (for "End this workout?"). */
export const setsLogged = (run: Run): number =>
  Object.values(run.results).reduce((sum, x) => sum + x.sets.length, 0);

/** How many different stretches a routine has (left and right count once). */
export const stretchCount = (run: Run): number =>
  run.steps
    .map((s) => (s.k === 'time' ? s.label : ''))
    .filter((label, i, all) => all.indexOf(label) === i).length;
