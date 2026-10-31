# CLAUDE.md — Crusader

A bodyweight training plan around boxing: daily sessions from progression
ladders, animated exercises (3D or 2D), a workout runner with timers,
stretch routines and progress charts. Screens: Today, Exercises, Progress,
Profile, plus the runner and the summary. Dev server port 5184, test
preview port 4184.

The look ("Spire"): heavy art deco in cave colours, always dark. Near-black
and graphite with one brass accent (`--gold`), slab headlines (Big
Shoulders Display) over Barlow, square corners, a stepped header under a
pediment with gold triple rules (`--rules`), a brass diamond for "done".
The muscle colours stay orange / yellow / blue.

It began as a single-file claude.ai artifact (~4,000 lines) and was ported
to TypeScript and Svelte. Wording and behaviour match the original; the
port was compared pixel for pixel with it before the app was renamed from
Calisthenics Plan to Crusader and restyled. Other changes: no signed-in
user (the data is in the browser, with a backup card), three.js is
bundled, and the bugs listed in docs/ROADMAP.md were fixed.

## The workspace (read this first)

This repo is developed inside an npm workspace: a parent folder, not in any
repo, whose `package.json` lists this project with a few others and holds
the one shared install. The app stands alone and shares no code with them.

- Some files are deliberately the same in sibling apps of the workspace
  and are kept in step by hand: `eslint.config.js`, `.prettierrc.json`,
  `src/lib/db/` (the database layer, except `index.ts`), `scripts/icons.mjs`.
- Install only from the workspace root: `npm install` there. Never run
  `npm install` inside a project (it would create a stray lock file and a
  local `node_modules` that shadows the shared one).
- Every project pins the same tool versions (exact versions in each
  `package.json`). An upgrade is done in all of them at once, then
  everything is tested: `npm test` from the workspace root.
- Machine-specific and personal notes live in the workspace's own
  CLAUDE.md, outside the repos. Keep this file free of them.

## Environment and tools

- Node 22. Editor settings (`.vscode/`) are git-ignored and machine-specific.
- Svelte 5 with runes; TypeScript 6, Vite 8, svelte-check 4. Playwright pinned to 1.56.1.

## Code style

- **Prettier** (100 columns, single quotes) and **ESLint** (`curly: all`,
  `one-var: never`, `prefer-const`, `no-nested-ternary` warning — none
  outside `lib/motion`, whose files switch it off).
- Before finishing a change: `npm run format`, `npm run lint`,
  `npm run check` (0 warnings), `npm test`.
- Pure logic in plain `.ts` files; `state.svelte.ts` holds state and
  actions. Values saved go through JSON (`db/local.ts`).
- User-facing wording — especially the how-to texts and cues — was
  checked against the original; change it only on purpose.

## The motion code (src/lib/motion) — handle with care

- `engine.js` (2D figure: IK, keyframes, SVG), `side-specs.js` and
  `front-specs.js` (one function per movement → a spec), `library.js`
  (equipment, ladders, exercises, routines, templates, reference numbers),
  `descriptions.js` (how-to text, phase captions, 3D intent facts),
  `mannequin3d.js` (three.js r128 figure, one shared canvas).
- It is the original's hand-tuned JavaScript, split into modules by
  a script and otherwise kept as written. Typed through the `*.d.ts`
  files beside each module; keep those in step if an API changes.
- Do not reformat logic or "clean up" numbers there: poses are tuned by eye.
  Change a movement only on purpose, and check it visually in 2D and 3D.
- Exercise ids, ladder ids and reference numbers (`#n`) are saved in
  progress data or referred to by number — never rename or renumber.
- three.js is pinned to 0.128.0 (the version the code was written for).

## How the app is put together

- `training.ts` — pure logic: building a plan (seeded random, so a day's
  plan is stable), fitting it to the session length, steps for the runner,
  calories, progression, stretch routines. Same numbers as the original;
  `tests` do not cover it directly yet.
- `state.svelte.ts` — data and UI state, saving (profile saves are
  debounced 400 ms; the app ignores its own saves echoing back), today's
  plan cache (`currentPlan()`; change it only through `changePlan`).
- `run.svelte.ts` — the runner's state machine; `clock.now` ticks every
  200 ms while a run is on.
- `anim.ts` + `components/Stage.svelte` — mounting 2D/3D animations from an
  `$effect`. Only one 3D view at a time: the sheet's stage, else the
  runner's, else Today's (`primary`). Thumbnails draw lazily
  (IntersectionObserver).

## Data

Saved through `src/lib/db` (Firestore-shaped). Today `LocalDatabase`, one
localStorage key `crusader.db.v1` in the backup-file format, all in the
collection `user`. Data under the old name's key, `calisthenics.db.v1`, is
copied to it on first start (`db/index.ts`). Backups carry `"app":
"crusader"`. `src/lib/types.ts` documents every field:

- `user/profile`, `user/progress`, `user/body` (`{entries}`), and one
  `user/ses_<base36 ts>` per finished workout.
- The names are the original app's, so its backup restores unchanged.
  Unknown fields (e.g. an old `figStyle`) are kept, not dropped.

## Project notes

- Target is an Android phone: an installable PWA, later Firebase Hosting.
  Firebase is deliberately not implemented yet — only a stub.



## Commands (in this folder; install happens in the workspace root)

```
npm run dev        dev server with live reload
npm run check      svelte-check
npm run lint       ESLint (lint:fix fixes what it can)
npm run format     Prettier
npm test           builds, serves on the preview port, runs Playwright
npm run build      dist/ — the finished PWA
npm run icons      PNG icons from public/icon.svg
```

## Google backend: Firebase (planned, not started)

Not to be implemented until asked. `src/lib/db/firebase.ts` is
the stub. The design: one Firebase project shared with the sibling apps; one
Hosting site per app; optional Google sign-in; data in Firestore under
`users/{uid}/apps/crusader/…` with the same documents as today; offline
persistence on; rules so a user reads and writes only their own subtree.

See `docs/ROADMAP.md`.
