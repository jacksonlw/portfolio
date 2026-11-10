// Shared helpers for the AnyForm capture scripts. Playwright comes from ~/anyform/scouts
// (playwright-core) and drives the installed Google Chrome, so nothing is downloaded.
import { createRequire } from 'node:module';
import { homedir } from 'node:os';

export const AF = process.env.ANYFORM_DIR || `${homedir()}/anyform`;
export const WEB = process.env.WEB_URL || 'http://127.0.0.1:3100';
export const API = process.env.API_URL || 'http://127.0.0.1:8080';
export const INGEST = process.env.INGEST_URL || 'http://127.0.0.1:8081';
export const SHOP = process.env.SHOP_URL || 'http://127.0.0.1:4380';
export const EMAIL = process.env.DEMO_EMAIL || 'demo@example.com';

const require = createRequire(`${AF}/scouts/package.json`);
export const { chromium } = require('playwright-core');

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function launch(opts = {}) {
  return chromium.launch({ channel: 'chrome', headless: true, ...opts });
}

// The production build hides the "Development sign-in" button, so call the same route it calls.
export async function signIn(page) {
  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
  const res = await page.evaluate(async ([api, email]) => {
    const r = await fetch(`${api}/v1/auth/dev`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Client-Platform': 'web' },
      body: JSON.stringify({ email }),
    });
    return r.json();
  }, [API, EMAIL]);
  if (res.code !== 'success') throw new Error(`dev sign-in failed: ${JSON.stringify(res).slice(0, 200)}`);
  return res.data;
}

// Calls the API from inside the signed-in page, so the session cookies ride along.
export async function api(page, method, path, body) {
  return page.evaluate(async ([base, method, path, body]) => {
    const r = await fetch(base + path, {
      method, credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'X-Client-Platform': 'web' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    try { return { status: r.status, ...JSON.parse(text) }; } catch { return { status: r.status, text }; }
  }, [API, method, path, body]);
}
