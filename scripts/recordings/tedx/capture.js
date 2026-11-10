// Shoots the TEDx ticketing stills at 1440x900, 2x. Uses the installed Google Chrome through
// playwright-core, so no browser download. Usage: BASE=http://localhost:4020 node capture.js <out>
const { chromium } = require("playwright-core");
const path = require("path");
const out = process.argv[2], base = process.env.BASE;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  // `wide` is for the seat map, which is laid out for a bigger screen: a 1920x1200 viewport at
  // 1.5x gives the same 2880x1800 image as 1440x900 at 2x.
  const newPage = async (fixedTime, wide) => {
    const ctx = await browser.newContext(wide
      ? { viewport: { width: 1920, height: 1200 }, deviceScaleFactor: 1.5 }
      : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    // Stripe.js is never loaded: the checkout page gets an inert stand-in instead.
    await ctx.route(/stripe\.com/, r =>
      r.fulfill({ contentType: "text/javascript", body: "window.Stripe = () => ({ redirectToCheckout() {} });" }));
    const page = await ctx.newPage();
    if (fixedTime) await page.clock.setFixedTime(new Date(fixedTime));
    page.on("pageerror", e => console.log("pageerror:", e.message));
    return page;
  };
  const shot = async (page, name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(out, name + ".png") });
    console.log("shot", name);
  };

  // Buying: pick seats, fill in the buyer, name each attendee, land on checkout.
  const picks = ["B15", "B16", "E20", "E21"];
  const map = await newPage(null, true);
  await map.goto(base + "/seats/selection", { waitUntil: "networkidle" });
  for (const s of picks) await map.click(`#main-seats .seat[data-seat="${s}"]`);
  await shot(map, "seat-selection");
  await map.context().close();

  const buy = await newPage();
  await buy.goto(base + "/seats/selection", { waitUntil: "networkidle" });
  for (const s of picks) await buy.click(`#main-seats .seat[data-seat="${s}"]`);
  await Promise.all([buy.waitForURL("**/customer/information"), buy.click(".purchase-wrap .next-step")]);
  const fill = { "first-name": "Alex", "last-name": "Sample", email: "alex.sample@example.com",
    "phone-number": "555-0100", "address-line-one": "101 Example Street", city: "Anytown",
    state: "CA", "zip-code": "00000" };
  for (const [k, v] of Object.entries(fill)) await buy.fill(`.${k}-inpt`, v);
  await Promise.all([buy.waitForURL("**/seats/information"), buy.click(".next-step")]);
  const names = ["Alex Sample", "Guest Two", "Guest Three", "Guest Four"];
  const inputs = buy.locator(".seat-name-inpt");
  for (let i = 0; i < (await inputs.count()); i++) await inputs.nth(i).pressSequentially(names[i]);
  await shot(buy, "attendee-names");
  await Promise.all([buy.waitForURL("**/seats/checkout"), buy.click(".next-step")]);
  await shot(buy, "checkout");

  // Managing: the seeded orders are dated January 2020, so the clock is pinned there.
  const admin = await newPage("2020-01-15T16:00:00-08:00");
  await admin.goto(base + "/admin/dashboard", { waitUntil: "networkidle" });
  await shot(admin, "admin-dashboard");
  await admin.goto(base + "/admin/orders", { waitUntil: "networkidle" });
  await shot(admin, "admin-orders");
  await admin.goto(base + "/admin/manage-order/12", { waitUntil: "networkidle" });
  await shot(admin, "admin-manage-order");
  await admin.goto(base + "/order/DEMO002", { waitUntil: "networkidle" });
  await shot(admin, "order-status");

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
