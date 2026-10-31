# Crusader

A bodyweight training plan that fits around boxing. Each training day it
builds a session — push, pull or legs in turn, with a warm-up, balance
work and a cool-down — sized to the time you have, from progression
ladders (wall push-up → push-up → archer push-up …) at your level. Every
exercise is animated, in 3D you can turn around or in 2D, with the working
muscles coloured and a caption that follows the movement. Hit the goal on
every set twice in a row and it offers the next step up. Three short
stretch routines a day, a runner with timers and rest, and Progress charts
complete it. It looks like heavy art deco carved in dark stone: near-black,
graphite and brass.

It began as a single-file claude.ai artifact and was ported to TypeScript
and Svelte. It lives in the `apps` workspace with the other phone apps, which
installs the tools for all of them at once (see `apps/README.md`).

## Running it

You need Node.js. Install once in the `apps` folder (`npm install`
there), then in this folder:

```
npm run dev        a local server with instant reload
```

`npm run dev` prints two addresses. `localhost` works on this computer. The
`Network` one works on your phone too, if it is on the same Wi-Fi.

## Your data

Your profile, progress, stretch history and workouts live in the browser
you use the app in (until Firebase is set up). To move them, use **Profile
→ Data → Save backup**, then **Restore backup…** on the other device. The
file exported from the original artifact
restores the same way. Data saved before the app was renamed (from
Calisthenics Plan) is carried over on its first start.

## Checking it

```
npm run check      TypeScript and Svelte type checking
npm run lint       code problems (ESLint); lint:fix repairs what it can
npm run format     tidy the layout of every file (Prettier)
npm test           builds the app and drives it in a headless phone-sized
                   browser (first time: npx playwright install chromium)
npm run icons      re-draw the PNG icons after changing public/icon.svg
```

The tests run with a fake clock, so timers are fast-forwarded; the one that
uses the 3D figure takes longer (the test browser draws 3D in software).

## Building and deploying

`npm run build` writes `dist/` — plain files, the whole app. Uploading that
folder anywhere that serves https makes it installable on Android: open the
address in Chrome, then *Add to Home screen*. With Firebase Hosting, once
the project exists:

```
npx firebase login
npx firebase init hosting      public directory: dist, single-page app: yes
npm run build && npx firebase deploy
```

## What's where

```
src/
  main.ts              starts the app
  App.svelte           the runner, the summary, or one of four tabs; sheets
  app.css              the stylesheet (colours as tokens; the Spire look)
  screens/             Today, Exercises, Progress, Profile, the runner, the summary
  components/          the animation stage, captions, legend, plan rows,
                       stretch breaks, the exercise / set-up / quit sheets,
                       the data card
  lib/
    motion/            the animation engine, the 3D figure, every movement,
                       the exercise library and the how-to texts — the
                       original's hand-tuned JavaScript, kept as it was,
                       with TypeScript descriptions (*.d.ts) beside it
    training.ts        building a session, sets and reps, timing and
                       calories, progression, stretch routines
    run.svelte.ts      the workout runner: steps, timers, rest
    state.svelte.ts    everything on screen, kept live from the database,
                       and every action that changes it
    anim.ts            putting 2D or 3D animations and thumbnails on the page
    charts.ts          the Progress charts
    types.ts           what is saved, document by document
    dates.ts, random.ts, icons.ts
    db/                the database: local (today), Firebase (stub), backups
public/                icons for the home screen
tests/                 end-to-end tests and their (made-up) sample data
```
