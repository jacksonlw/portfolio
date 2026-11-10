// Fills the throwaway stack with demo data: a "Fernway" team, a "Fernway shop" Application and
// a set of recorded visits. The visits are the repo's own Fernway journeys (demo/fernway/record),
// driven in Chrome and recorded by the AnyForm SDK into the local ingest service.
// Run with: node --experimental-strip-types seed.mjs <work dir> [journey ids, comma separated]
import fs from 'node:fs';
import { AF, API, INGEST, SHOP, WEB, api, launch, signIn, sleep } from './lib.mjs';

const work = process.argv[2];
if (!work) throw new Error('usage: seed.mjs <work dir> [ids]');
const { JOURNEYS } = await import(`${AF}/demo/fernway/record/journeys.ts`);
const { Human } = await import(`${AF}/demo/fernway/record/human.ts`);

// One visit per line: journey id, and a seed suffix so a repeat moves and types differently.
const DEFAULT = [
  'payment-button-silently-disabled', 'payment-button-silently-disabled#2',
  'coupon-server-error', 'coupon-server-error#2', 'coupon-server-error#3',
  'coupon-slow-no-feedback', 'zip-rejects-plus4', 'zip-rejects-plus4#2',
  'phone-unstated-format', 'size-guide-js-error', 'size-guide-js-error#2',
  'signup-password-rules-hidden', 'shipping-continue-looks-disabled',
  'orders-slow-navigation', 'cart-checkout-shifts', 'contact-order-number-required',
  'gallery-overflow-mobile', 'qty-tap-targets-small', 'broken-product-image',
  'clean-guest-checkout-desktop-balanced', 'clean-search-desktop-strict',
];
const wanted = (process.argv[3] ? process.argv[3].split(',') : DEFAULT);

const DEVICES = {
  desktop: { viewport: { width: 1280, height: 800 }, touch: false, scale: 1 },
  mobile: { viewport: { width: 390, height: 844 }, touch: true, scale: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36' },
};

// One Chrome per visit: a page in a background tab is throttled and its journey stalls.
const browser = await launch();

// ---- team, Application, key -------------------------------------------------------------------
const admin = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await admin.newPage();
const me = await signIn(page);
const team = me.activeTeam;
if (team.name !== 'Fernway') await api(page, 'PATCH', `/v1/teams/${team.id}`, { name: 'Fernway' });
let apps = (await api(page, 'GET', '/v1/applications')).data;
apps = apps?.items ?? apps?.applications ?? apps ?? [];
let app = apps.find((a) => a.slug === 'fernway-shop');
if (!app) {
  const r = await api(page, 'POST', '/v1/applications', { name: 'Fernway shop', slug: 'fernway-shop', allowedOrigins: [SHOP] });
  if (!r.data) throw new Error(`create application: ${JSON.stringify(r).slice(0, 300)}`);
  app = r.data.application ?? r.data;
}
const keyFile = `${work}/ingest-key`;
let key = fs.existsSync(keyFile) ? fs.readFileSync(keyFile, 'utf8').trim() : '';
if (!key) {
  const r = await api(page, 'POST', `/v1/applications/${app.slug}/ingest-keys`, { name: 'Fernway demo' });
  key = r.data?.key ?? r.data?.secret ?? r.data?.ingestKey?.key ?? '';
  if (!key.startsWith('afp_')) throw new Error(`create ingest key: ${JSON.stringify(r).slice(0, 300)}`);
  fs.writeFileSync(keyFile, key);
}
console.log(`application ${app.slug} (${app.id})`);

// ---- visits -----------------------------------------------------------------------------------
async function visit(spec) {
  const [id, n] = spec.split('#');
  const j = JOURNEYS.find((x) => x.id === id);
  if (!j) throw new Error(`no journey ${id}`);
  const dev = DEVICES[j.device];
  const own = await launch();
  const ctx = await own.newContext({
    viewport: dev.viewport, deviceScaleFactor: dev.scale, isMobile: dev.touch, hasTouch: dev.touch,
    ...(dev.userAgent ? { userAgent: dev.userAgent } : {}), locale: 'en-US', timezoneId: 'America/Los_Angeles',
  });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: SHOP });
  const p = await ctx.newPage();
  const h = new Human(p, spec, { touch: dev.touch, viewport: dev.viewport });
  const mode = j.defects.length ? `defects=${j.defects.join(',')}` : 'clean=1';
  const enter = async (path) => {
    const configured = p.waitForResponse((r) => r.url().startsWith(INGEST) && r.url().includes('/v1/sdk/config'), { timeout: 15000 });
    const q = `${path.includes('?') ? '&' : '?'}${mode}&anyform=${key}&anyform_ingest=${encodeURIComponent(INGEST)}`;
    await p.goto(SHOP + path + q, { waitUntil: 'load' });
    await configured;
    await h.settle();
    await p.waitForTimeout(400);
  };
  try {
    await Promise.race([
      j.run({ page: p, h, enter }),
      sleep(240000).then(() => { throw new Error('timed out after 4 minutes'); }),
    ]);
    await p.waitForTimeout(600);
    await p.close({ runBeforeUnload: true });
    await sleep(1500);
    console.log(`  recorded ${spec}`);
  } catch (e) {
    console.log(`  FAILED ${spec}: ${String(e).split('\n')[0]}`);
  } finally {
    await ctx.close().catch(() => {});
    await own.close().catch(() => {});
  }
}
const queue = [...wanted];
const workers = Array.from({ length: Number(process.env.CONCURRENCY || 2) }, async () => {
  while (queue.length) await visit(queue.shift());
});
await Promise.all(workers);

// ---- wait for processing ------------------------------------------------------------------------
// A session is processed when it ends: the final chunk plus ingest's grace period (30 s).
for (let i = 0; i < 60; i++) {
  const r = await api(page, 'GET', `/v1/applications/${app.slug}/sessions?limit=100`);
  const items = r.data?.items ?? r.data?.sessions ?? r.data ?? [];
  const by = {};
  for (const s of items) by[s.status] = (by[s.status] || 0) + 1;
  console.log(`sessions: ${JSON.stringify(by)}`);
  if (items.length && items.every((s) => s.status === 'ready' || s.status === 'failed')) break;
  await sleep(5000);
}
await browser.close();
console.log(`Dashboard: ${WEB}/dashboard/apps/${app.slug}`);
