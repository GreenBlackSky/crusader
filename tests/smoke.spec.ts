import { expect, test } from '@playwright/test';
import {
  expectNoErrors,
  openFresh,
  openWith,
  openWithOldKey,
  saved,
  tap,
  TODAY,
  wait,
} from './helpers';

/* Every screen draws; set-up, a workout, a stretch routine, the exercise
   sheet, profile changes, check-ins and backups work end to end. The sample
   data is synthetic (tests/sample-backup.json) and uses 2D animations; one
   test switches to 3D. */

const SAMPLE = './sample-backup.json';
const TABS = ['today', 'lib', 'prog', 'me'];

test('first run: set up the plan', async ({ page }) => {
  const errors = await openFresh(page);
  await expect(page.locator('.sheet h2')).toHaveText('Set up your plan');
  await tap(page, '.onb .chip:has-text("Beginner")');
  await page.locator('#ow').fill('80');
  await tap(page, 'button:has-text("Build my plan")');
  await expect(page.locator('.sheet')).toHaveCount(0);
  const profile = (await saved(page)).profile as { weight: number; weightSet: boolean };
  expect(profile).toMatchObject({ weight: 80, weightSet: true });
  /* new profiles get the 3D figure (slow in a test browser: switch to 2D) */
  await expect(page.locator('.stage-card .stage.is3d canvas')).toHaveCount(1);
  await tap(page, '[data-tab="me"]');
  await tap(page, '[aria-label="Animation style"] button:has-text("2D")');
  for (const tab of TABS) {
    await tap(page, `[data-tab="${tab}"]`);
    await expect(page.locator('main.screen h1')).toBeVisible();
  }
  await expectNoErrors(errors);
});

test('data saved under the old name carries over', async ({ page }) => {
  const errors = await openWithOldKey(page, SAMPLE);
  await expect(page.locator('.sheet')).toHaveCount(0);
  await tap(page, '[data-tab="prog"]');
  await expect(page.locator('.sub')).toHaveText('2 sessions logged');
  expect((await saved(page)).profile).toMatchObject({ weight: 72 });
  await expectNoErrors(errors);
});

test('every screen draws with data', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  for (const tab of TABS) {
    await tap(page, `[data-tab="${tab}"]`);
    await expect(page.locator('main.screen h1')).toBeVisible();
  }
  await tap(page, '[data-tab="prog"]');
  await expect(page.locator('.sub')).toHaveText('2 sessions logged');
  await expect(page.locator('.chart')).toHaveCount(4);
  await expectNoErrors(errors);
});

test('a workout: warm-up, a set, the rest timer, then save and see the summary', async ({
  page,
}) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '.chip:has-text("Straight sets")');
  await tap(page, 'button:has-text("Start workout")');
  await expect(page.locator('.kicker')).toContainText('Warm-up');
  await tap(page, 'button:has-text("Start timer")');
  await wait(page, 2000);
  await expect(page.locator('.run .big')).not.toHaveText('0:00');
  await tap(page, '.run .btn:has-text("Skip")');
  await expect(page.locator('.kicker')).toContainText('Set 1 of');

  /* the first main exercise: reps or a hold */
  if (await page.locator('button:has-text("Log set")').count()) {
    await tap(page, '[aria-label="One more"]');
    await tap(page, 'button:has-text("Log set")');
  } else {
    await tap(page, 'button:has-text("Start hold")');
    await wait(page, 5000);
    await tap(page, 'button:has-text("Done")');
  }
  await expect(page.locator('.kicker')).toHaveText('Rest');
  await wait(page, 41_000);
  await expect(page.locator('.kicker')).toContainText('Set 2 of');

  await tap(page, '[aria-label="End workout"]');
  await expect(page.locator('.sheet h2')).toHaveText('End this workout?');
  await tap(page, 'button:has-text("Save what I did")');
  await expect(page.locator('.sum h1')).toHaveText('Nice work');
  const sessions = Object.keys(await saved(page)).filter((id) => id.startsWith('ses_'));
  expect(sessions).toHaveLength(3);
  await tap(page, '.sum .btn.big');
  await expect(page.locator('.card.done h2')).toHaveText('Session done');
  await expectNoErrors(errors);
});

test('EMOM: after a set, the rest runs to the top of the minute', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '.chip:has-text("EMOM")');
  await tap(page, 'button:has-text("Start workout")');
  await tap(page, '.run .link:has-text("Skip")');
  await expect(page.locator('.kicker')).toContainText('every minute');
  const first = await page.locator('.run-top .muted').textContent();
  if (await page.locator('button:has-text("Log set")').count()) {
    await tap(page, 'button:has-text("Log set")');
  } else {
    await tap(page, 'button:has-text("Start hold")');
    await wait(page, 3000);
    await tap(page, 'button:has-text("Done")');
  }
  await expect(page.locator('.kicker')).toHaveText('Rest until the next minute');
  await wait(page, 61_000);
  await expect(page.locator('.run-top .muted')).not.toHaveText(first!);
  await expectNoErrors(errors);
});

test('a stretch routine: get ready, pause, move on by itself, save', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '.stretch .row:first-child .btn.sm');
  await expect(page.locator('.run .big.dim')).toHaveText('8');
  await wait(page, 8500);
  await expect(page.locator('.run .btn:has-text("Pause")')).toBeVisible();
  await tap(page, '.run .btn:has-text("Pause")');
  const frozen = await page.locator('.run .big').textContent();
  await wait(page, 5000);
  await expect(page.locator('.run .big')).toHaveText(frozen!);
  await tap(page, '.run .btn:has-text("Resume")');
  await wait(page, 46_000);
  await expect(page.locator('.run-top .muted')).not.toHaveText(/^1\//);

  await tap(page, '[aria-label="End workout"]');
  await tap(page, 'button:has-text("Save as done")');
  await expect(page.locator('.sum h1')).toHaveText('Morning done');
  const progress = (await saved(page)).progress as { routines: Record<string, string[]> };
  expect(progress.routines[TODAY]).toEqual(['am']);
  await tap(page, '.sum .btn.big');
  await expect(page.locator('.stretch .row:first-child .okmark')).toContainText('Done');
  await expectNoErrors(errors);
});

test('the exercise sheet: level, pin, the ladder, and search', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '[data-tab="lib"]');
  await page.locator('#q').fill('pistol');
  await expect(page.locator('.lrow')).toHaveCount(2);
  await page.locator('#q').fill('#35');
  await expect(page.locator('.lrow')).toHaveCount(1);
  await page.locator('#q').fill('chin');
  await tap(page, '.lrow:has-text("Chin-up")');
  await expect(page.locator('.sheet h2')).toContainText('Chin-up');
  await expect(page.locator('.sheet .phasecap')).not.toBeEmpty();
  await tap(page, '.sheet button:has-text("Set as my level")');
  await tap(page, '.sheet button:has-text("Pin to workouts")');
  await expect(page.locator('.sheet button:has-text("Unpin")')).toBeVisible();
  const progress = (await saved(page)).progress as {
    levels: Record<string, number>;
    pinned: string[];
  };
  expect(progress.levels.pullV).toBe(4);
  expect(progress.pinned).toContain('chinup');
  await tap(page, '.ladder button:text-is("Pull-up")');
  await expect(page.locator('.sheet h2')).toContainText('Pull-up');
  await page.keyboard.press('Escape');
  await expect(page.locator('.sheet')).toHaveCount(0);
  await expectNoErrors(errors);
});

test('profile: session length and days change the plan', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  const before = await page.locator('.plan .meta').textContent();
  await tap(page, '[data-tab="me"]');
  await tap(page, '.chip:has-text("25 min")');
  await tap(page, '[data-tab="today"]');
  await expect(page.locator('.plan .meta')).not.toHaveText(before!);
  expect(((await saved(page)).profile as { minutes: number }).minutes).toBe(25);

  await tap(page, '[data-tab="me"]');
  await tap(page, '[aria-label="Calisthenics days"] .chip:has-text("Fri")');
  await tap(page, '[data-tab="today"]');
  await expect(page.locator('.card.rest h2')).toHaveText('Rest day');
  await expectNoErrors(errors);
});

test('3D: one figure at a time, and back to 2D', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '[data-tab="me"]');
  await tap(page, '[aria-label="Animation style"] button:has-text("3D")');
  await tap(page, '[data-tab="today"]');
  await expect(page.locator('.stage-card .stage.is3d canvas')).toHaveCount(1);
  await tap(page, '.plan .row:nth-child(2) .thumb');
  await expect(page.locator('.sheet .stage.is3d canvas')).toHaveCount(1);
  await expect(page.locator('.stage-card .stage.is3d')).toHaveCount(0);
  await tap(page, '.sheet .x');
  await expect(page.locator('.stage-card .stage.is3d canvas')).toHaveCount(1);
  await tap(page, '[data-tab="me"]');
  await tap(page, '[aria-label="Animation style"] button:has-text("2D")');
  await tap(page, '[data-tab="today"]');
  await expect(page.locator('.stage-card .stage svg')).not.toHaveCount(0);
  await expectNoErrors(errors);
});

test('a body check-in', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '[data-tab="prog"]');
  await page.locator('input[name="w"]').fill('71.5');
  await tap(page, 'button:has-text("Add entry")');
  await expect(page.locator('.log li').first()).toContainText('71.5 kg');
  const profile = (await saved(page)).profile as { weight: number };
  expect(profile.weight).toBe(71.5);
  await expectNoErrors(errors);
});

test('a backup saves and restores; delete all starts over', async ({ page }) => {
  const errors = await openWith(page, SAMPLE);
  await tap(page, '[data-tab="me"]');
  const download = page.waitForEvent('download');
  await tap(page, '[data-export]');
  const file = await (await download).path();

  await tap(page, '[data-reset]');
  await expect(page.locator('[data-reset]')).toHaveText('Tap again to delete everything');
  await tap(page, '[data-reset]');
  await expect(page.locator('.sheet h2')).toHaveText('Set up your plan');

  await tap(page, 'button:has-text("Build my plan")');
  await tap(page, '[data-tab="me"]');
  await page.locator('input[type=file][accept*="json"]').setInputFiles(file);
  await tap(page, '[data-replace]');
  await tap(page, '[data-tab="prog"]');
  await expect(page.locator('.sub')).toHaveText('2 sessions logged');
  await expectNoErrors(errors);
});
