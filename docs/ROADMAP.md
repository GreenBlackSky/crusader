# Crusader — roadmap

Nothing below is built yet.

## Firebase

1. **Hosting**: this app's `dist/` on its own Firebase Hosting site, so the
   phone installs it from an https address.
2. **Sign-in and sync**: Google sign-in (optional); the documents move to
   Firestore under `users/{uid}/apps/crusader/user/…`, the same ones as
   today (profile, progress, body, ses_*). Implement `FirebaseDatabase` in
   `src/lib/db/firebase.ts`; nothing else should need to change except
   `db/index.ts` choosing it.
3. **Moving in**: on first sign-in, upload what is in this browser (it is
   already in the backup format).

## The motion code

`src/lib/motion/` is the original's animation engine, 3D figure, movement
specs, exercise library and descriptions: ~5,000 lines of hand-tuned
JavaScript, split into modules but otherwise kept as written (dead code
removed; nested ternaries left alone). The rest of the app sees it through
the `*.d.ts` descriptions. Porting it to TypeScript is a large refactor of
its own; worth doing only together with real changes to the animations,
one module at a time, checking each movement by eye before and after.

## Fixed during the port

- EMOM: after logging a set, "Rest until the next minute" never counted
  down or moved on by itself; it now does, at the top of the minute.
- The caption under an animation in the exercise sheet followed the
  animation on the Today screen behind it (a different exercise); each
  caption now follows its own animation.
- Every tap redrew the whole page, restarting every animation (and the 3D
  figure) from the beginning; now only what changed is redrawn.
- A profile change saved together with other progress could be undone by
  the database echoing the older profile back; the app now ignores its own
  saves coming back.
- Weekly calories were bucketed by subtracting 7 × 24 hours, so the week
  after the spring clock change could come out empty; weeks are now
  counted in calendar days.

## Changed during the port

- No sign-in: the data is in this browser instead of claude.ai's database.
  Profile → Data saves and restores a backup; "Delete all my data" asks
  for a second tap instead of a browser confirmation box.
- three.js (r128, the same version) is bundled with the app instead of
  loaded from a CDN, so 3D works offline.

## Ideas, not decided

- A light version of the Spire look ("stone by day"); today the app is
  always dark.
- Keep the screen awake during a workout (Wake Lock API).
- Spoken cues ("three, two, one, go") alongside the beep.
- Unit tests for `training.ts` (plan building, progression) — it is pure
  and seeded, so plans can be checked exactly.
- A Firebase-backed history shared with Macro Lens (calories burned on a
  workout day).
