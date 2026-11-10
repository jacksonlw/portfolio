// Shoots the Branch stills at 1440x900, 2x, with the installed Google Chrome (playwright-core).
// Usage: BASE=http://localhost:4010 MONGO_URL=… node capture.js <out>
const { chromium } = require("playwright-core");
const { MongoClient } = require("mongodb");
const path = require("path");
const { logins } = require("./seed.js");
const out = process.argv[2], base = process.env.BASE;

(async () => {
  const browser = await chromium.launch({ channel: "chrome" });
  const signIn = async who => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on("pageerror", e => console.log("pageerror:", page.url(), e.message));
    await page.goto(base + "/auth/login", { waitUntil: "networkidle" });
    await page.fill('input[name="email"]', logins[who].email);
    await page.fill('input[name="password"]', logins[who].password);
    await Promise.all([page.waitForURL(/\/(teacher|admin)\/home/), page.click(".FS-index-login-right input")]);
    return page;
  };
  const shot = async (page, name) => {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, name + ".png") });
    console.log("shot", name);
  };
  const open = (page, url) => page.goto(base + url, { waitUntil: "networkidle" });

  const teacher = await signIn("teacher");
  await open(teacher, "/teacher/classroom-controls");
  await shot(teacher, "classroom-controls");
  await open(teacher, "/teacher/pa-system");
  await teacher.fill(".speech-textbox", "Mock announcement: the assembly starts in ten minutes.");
  await teacher.dispatchEvent(".speech-textbox", "input");
  await shot(teacher, "pa-system");
  await open(teacher, "/teacher/manage-students");
  await shot(teacher, "manage-students");
  await open(teacher, "/teacher/security");
  await shot(teacher, "security");

  // Start a lockdown the way a teacher would, post one chat line and one "!update", shoot the
  // lockdown screen, then end it with the password prompt.
  await teacher.click(".open-lockdown-prompt");
  await teacher.fill(".extra-info-textarea", "Mock drill for the local capture.");
  await teacher.fill(".lockdown-inpt", "Lockdown");
  await Promise.all([teacher.waitForURL("**/teacher/lockdown"), teacher.click(".confirm-begin-lockdown")]);
  for (const line of ["!update This is a drill. Stay in your rooms.", "Room 127 is secure."]) {
    await teacher.fill(".message-inpt", line);
    await teacher.click(".send-message");
    await teacher.waitForTimeout(400);
  }
  await teacher.waitForTimeout(3000);
  await shot(teacher, "lockdown");
  await teacher.click(".end-lockdown");
  await teacher.fill(".password-inpt", logins.teacher.password);
  await Promise.all([teacher.waitForURL("**/teacher/home"), teacher.click(".confirm-end-lockdown")]);

  // The run just wrote logs stamped with today's date. Move them to September 2019, next to the
  // seeded ones, so the admin pages don't show a 2026 date on a 2019 project.
  const admin = await signIn("admin");
  const client = await MongoClient.connect(process.env.MONGO_URL, { useUnifiedTopology: true });
  const logs = client.db("OpenWorld").collection("logs");
  const then = new Date(2019, 8, 17, 9, 30).getTime();
  for (const log of await logs.find({ "data.time": { $gt: Date.UTC(2020, 0, 1) } }).toArray()) {
    const length = (log.data.endTime || log.data.time) - log.data.time;
    await logs.updateOne({ _id: log._id },
      { $set: { "data.time": then, ...(log.data.endTime ? { "data.endTime": then + length } : {}) } });
  }
  await client.close();
  await open(admin, "/admin/home");
  await shot(admin, "admin-dashboard");
  await open(admin, "/admin/school/controls");
  await shot(admin, "admin-school-controls");
  await open(admin, "/admin/security");
  await shot(admin, "admin-security");

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
