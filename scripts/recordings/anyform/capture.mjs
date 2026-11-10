// Shoots the AnyForm stills and clips from the stack up.sh started and seed.mjs filled.
// Usage: node capture.mjs <raw out dir> [stills|replay|finding|scouts ...]
// Stills are 1440x900 at 2x (.png). Clips are 1280x800 at 1x (.mov, 60 fps), so encode.sh at
// WIDTH=1280 doesn't resample them.
import fs from 'node:fs';
import { AF, WEB, api, launch, signIn, sleep } from './lib.mjs';
import { addPointer, glide, glideTo, park, startClip } from './record.mjs';

const out = process.argv[2];
if (!out) throw new Error('usage: capture.mjs <raw out dir> [what ...]');
const what = process.argv.slice(3);
const want = (k) => !what.length || what.includes(k);
fs.mkdirSync(out, { recursive: true });
const APP = `${WEB}/dashboard/apps/fernway-shop`;
const FINDING = 'Rage click on Checkout · Payment';

const browser = await launch();

async function open(viewport, deviceScaleFactor, pointer) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor, locale: 'en-US', timezoneId: 'America/Los_Angeles' });
  if (pointer) await addPointer(ctx);
  const page = await ctx.newPage();
  await signIn(page);
  return page;
}
async function go(page, url, wait = 2500) {
  await page.goto(url, { waitUntil: 'load' });
  await sleep(wait);
}
// The Finding the clips follow, and the session and time of its first moment.
async function target(page) {
  const list = await api(page, 'GET', '/v1/applications/fernway-shop/findings?limit=100');
  const items = list.data?.items ?? list.data ?? [];
  const f = items.find((x) => x.title === FINDING);
  if (!f) throw new Error(`no finding "${FINDING}": run seed.mjs first`);
  const m = (await api(page, 'GET', `/v1/applications/fernway-shop/findings/${f.id}/moments`)).data;
  const first = (m?.items ?? m ?? [])[0];
  return { finding: f.id, session: first.session?.id ?? first.sessionId ?? first.session, at: first.at ?? first.atMs ?? first.t };
}

// ---- stills -----------------------------------------------------------------------------------
if (want('stills')) {
  const page = await open({ width: 1440, height: 900 }, 2, false);
  const t = await target(page);
  const shot = async (name) => { await page.screenshot({ path: `${out}/${name}.png` }); console.log(`  ${name}.png`); };

  await go(page, APP, 3500);
  await shot('overview');
  await go(page, `${APP}/findings`);
  await shot('findings');
  await go(page, `${APP}/findings/${t.finding}`, 3000);
  await page.getByRole('button', { name: /^Play Checkout · Payment/ }).first().click();
  await sleep(1800);
  await page.getByRole('button', { name: 'Pause' }).first().click().catch(() => {});
  // Pausing scrolls the player into view; go back to the top, where the title and the moments are.
  await page.evaluate(() => document.querySelectorAll('*').forEach((el) => { if (el.scrollTop) el.scrollTop = 0; }));
  await page.mouse.move(1200, 860);
  await sleep(600);
  await shot('finding-page');
  await go(page, `${APP}/sessions/${t.session}?t=${t.at}&side=findings`, 4000);
  await shot('session-replay');
  await go(page, `${APP}/screens`);
  await shot('screens');
  await go(page, `${WEB}/dashboard/scouts`);
  await shot('scouts-roster');
  fs.copyFileSync(`${AF}/logo/png/lockup/anyform-lockup-horizontal-blue-1600.png`, `${out}/logo.png`);
  console.log('  logo.png');
  await page.context().close();
}

// ---- clips ------------------------------------------------------------------------------------
const CLIP = { width: 1280, height: 800 };

// A recorded visit playing back: the AnyForm cursor reaches the payment button and rage-clicks it,
// and the Findings column follows the playhead.
if (want('replay')) {
  const page = await open(CLIP, 1, true);
  const t = await target(page);
  await go(page, `${APP}/sessions/${t.session}?t=${Math.max(0, t.at - 5500)}&side=findings`, 4000);
  // At 800 px tall the player's controls sit on the fold: scroll them into view first.
  park(700, 420); await page.mouse.move(700, 420);
  await page.mouse.wheel(0, 130);
  await sleep(800);
  const clip = await startClip(page);
  await sleep(300);
  await glideTo(page, page.getByRole('button', { name: 'Play' }).first(), 700);
  await page.mouse.down(); await page.mouse.up();
  await glide(page, 1130, 300, 600);
  await sleep(6900);
  await clip.stop(`${out}/replay.mov`);
  await page.context().close();
}

// Reading a finding: from the ranked list into one Finding, then playing the moment it happened.
if (want('finding')) {
  const page = await open(CLIP, 1, true);
  await go(page, `${APP}/findings`, 3000);
  park(900, 620); await page.mouse.move(900, 620);
  const clip = await startClip(page);
  await sleep(500);
  const row = page.getByRole('link', { name: FINDING }).first();
  await row.scrollIntoViewIfNeeded();
  await glideTo(page, row, 900);
  await sleep(250);
  await page.mouse.down(); await page.mouse.up();
  const play = page.getByRole('button', { name: /^Play Checkout · Payment/ }).first();
  await play.waitFor();
  await sleep(1300);
  await glideTo(page, play, 800);
  await sleep(200);
  await page.mouse.down(); await page.mouse.up();
  await sleep(700);
  await glide(page, 1100, 640, 700);
  await sleep(3400);
  await clip.stop(`${out}/finding.mov`);
  await page.context().close();
}

// Scouts: the team's roster, then the ready-made catalog in the Add a Scout dialog.
if (want('scouts')) {
  const page = await open(CLIP, 1, true);
  await go(page, `${WEB}/dashboard/scouts`, 3000);
  park(640, 560); await page.mouse.move(640, 560);
  const clip = await startClip(page);
  await sleep(600);
  await glideTo(page, page.getByRole('button', { name: 'Add Scout' }), 800);
  await sleep(200);
  await page.mouse.down(); await page.mouse.up();
  await page.getByRole('dialog').waitFor();
  await glide(page, 640, 430, 600);
  await sleep(700);
  for (let i = 0; i < 125; i++) { await page.mouse.wheel(0, 6); await sleep(16); }
  await sleep(900);
  await clip.stop(`${out}/scouts.mov`);
  await page.context().close();
}

await browser.close();
