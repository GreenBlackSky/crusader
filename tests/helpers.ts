import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

export const STORAGE_KEY = 'crusader.db.v1';
/** Where the app saved its data before it was renamed. */
export const OLD_STORAGE_KEY = 'calisthenics.db.v1';
/** A Friday: a training day (not a boxing day) in the sample's schedule. */
export const NOW = '2026-10-23T09:00:00';
export const TODAY = '2026-10-23';

/* The page's clock is fake (page.clock): time only moves when a test says
   so, so timers can be fast-forwarded and dates are always the same. */

async function open(page: Page, backup: string | null, key = STORAGE_KEY): Promise<string[]> {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.clock.install({ time: new Date(NOW) });
  await page.goto('/');
  await page.evaluate(
    ([key, value]) => {
      localStorage.clear();
      if (value) {
        localStorage.setItem(key, value);
      }
    },
    [key, backup],
  );
  await page.reload();
  await page.waitForSelector('main.screen');
  return errors;
}

/** Open the app fresh, with nothing saved, and collect any error it throws. */
export const openFresh = (page: Page): Promise<string[]> => open(page, null);

/** Open the app with a backup file's contents already saved. */
export const openWith = (page: Page, backupPath: string): Promise<string[]> =>
  open(page, readFileSync(new URL(backupPath, import.meta.url), 'utf8'));

/** Open the app with a backup's contents saved under the app's old storage key. */
export const openWithOldKey = (page: Page, backupPath: string): Promise<string[]> =>
  open(page, readFileSync(new URL(backupPath, import.meta.url), 'utf8'), OLD_STORAGE_KEY);

/** Let `ms` of (fake) time pass. */
export async function wait(page: Page, ms: number): Promise<void> {
  await page.clock.runFor(ms);
  await page.waitForTimeout(50);
}

/** A real tap (touch events), then a moment for the screen to update. */
export async function tap(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector).first();
  await element.scrollIntoViewIfNeeded();
  await element.tap();
  await wait(page, 100);
}

/** Everything saved in the 'user' collection, as the app sees it. */
export async function saved(page: Page): Promise<Record<string, Record<string, unknown>>> {
  await wait(page, 500); /* profile saves wait 400 ms */
  return page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key) ?? '{}').collections?.user ?? {},
    STORAGE_KEY,
  );
}

export async function expectNoErrors(errors: string[]): Promise<void> {
  expect(errors).toEqual([]);
}
