// The portfolio's captures of Waltz: stills and short clips of the real UI on the app's `e2e` core,
// every agent Run played by the suite's scripted Runner (no model is called). capture.sh copies
// this file into ~/waltz-ide/tests/e2e for the run and removes it afterwards.
//
// Raw output goes to WALTZ_CAPTURE_OUT: <name>-<light|dark>.png stills at 2x, and for each clip a
// folder of screencast frames with an ffconcat list, which capture.sh assembles into <name>.mov.

import { chromium, type Browser, type CDPSession, type Locator, type Page } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test, awaitOnboarding, Core, createApplication, idle, invoke, openThread, pauseAutomations, report, type Scripts, type Step } from "./core";
import { afterOnboarding, implementer, onboarder, onboarding, reviewer, scribes, triager } from "./scripts";

const OUT = process.env.WALTZ_CAPTURE_OUT!;
const SIZE = { width: 1280, height: 800 };
/** The theme the clips are recorded in; stills are shot in both. */
const THEME = (process.env.WALTZ_CAPTURE_THEME ?? "light") as "light" | "dark";

test.describe.configure({ mode: "serial" });
test.setTimeout(240_000);

const sleep = (ms: number) => new Promise((ok) => setTimeout(ok, ms));

// A browser of the capture's own, its window really at 2x: Chrome's screencast records the window's
// surface, which an emulated device scale (the suite's `deviceScaleFactor`) leaves at 1x. Headless
// Chrome keeps 87 px of the window's height for itself.
let browser: Browser | undefined;
test.afterAll(async () => {
  const closed = await Promise.race([browser?.close().then(() => true), new Promise<boolean>((ok) => setTimeout(() => ok(false), 10_000))]);
  if (closed === false) console.log("capture: the browser did not close in 10 s");
});

/** A page of its own at 2x, with a drawn pointer (headless Chrome shows none). */
async function open(core: Core, baseURL: string): Promise<Page> {
  browser ??= await chromium.launch({ channel: "chrome", args: ["--force-device-scale-factor=2", `--window-size=${SIZE.width},${SIZE.height + 87}`, "--hide-scrollbars"] });
  const context = await browser.newContext({ viewport: null, deviceScaleFactor: undefined, baseURL, timezoneId: "UTC", locale: "en-US", colorScheme: THEME });
  await context.addInitScript(() => {
    const make = () => {
      const c = document.createElement("div");
      c.id = "capture-pointer";
      c.style.cssText = "position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;width:22px;height:22px;transform:translate(-100px,-100px);will-change:transform;display:none";
      c.innerHTML =
        '<svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 2 L3 17.5 L7.2 13.6 L10 20 L12.6 18.9 L9.8 12.6 L15.5 12.6 Z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>';
      document.documentElement.appendChild(c);
      document.addEventListener("mousemove", (e) => (c.style.transform = `translate(${e.clientX - 3}px,${e.clientY - 2}px)`), true);
    };
    if (document.documentElement) make();
    else document.addEventListener("DOMContentLoaded", make);
  });
  const page = await context.newPage();
  await core.open(page);
  const inner = await page.evaluate(() => [innerWidth, innerHeight, devicePixelRatio]);
  expect(inner).toEqual([SIZE.width, SIZE.height, 2]);
  return page;
}

const pointer = (page: Page, shown: boolean) => page.evaluate((s) => void (document.getElementById("capture-pointer")!.style.display = s ? "block" : "none"), shown);

let at = { x: 640, y: 420 };
/** Moves the pointer to (x, y) over `ms`, eased, a step per frame. */
async function glide(page: Page, x: number, y: number, ms = 550) {
  const from = at;
  const n = Math.max(2, Math.round(ms / 16));
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await sleep(16);
  }
  at = { x, y };
}

/** Glides to the middle of `target` (or `fx` of the way across it) and clicks. */
async function click(page: Page, target: Locator, { fx = 0.5, ms = 550 }: { fx?: number; ms?: number } = {}) {
  await expect(target).toBeVisible({ timeout: 60_000 });
  const b = (await target.boundingBox())!;
  await glide(page, b.x + b.width * fx, b.y + b.height / 2, ms);
  await sleep(120);
  await page.mouse.down();
  await sleep(60);
  await page.mouse.up();
}

/** Both themes of the screen, without the pointer or a focus ring. */
async function still(page: Page, name: string) {
  await pointer(page, false);
  await page.mouse.move(0, 0);
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  for (const scheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: scheme });
    await sleep(350);
    await page.screenshot({ path: join(OUT, `${name}-${scheme}.png`), animations: "disabled", caret: "hide" });
  }
  await page.emulateMedia({ colorScheme: THEME });
  await sleep(200);
}

/**
 * A clip: Chrome's screencast frames (JPEG at device pixels, one per repaint) with their times.
 * `cut` leaves a wait out: the time is dropped and the picture carries on from what the screen
 * showed when the wait ended.
 */
class Clip {
  private frames: { t: number; data: Buffer }[] = [];
  private last: Buffer | null = null;
  private cutting = false;
  private dropped = 0;
  private cutFrom = 0;
  private constructor(private cdp: CDPSession, private name: string) {}

  static async start(page: Page, name: string): Promise<Clip> {
    await pointer(page, true);
    await page.mouse.move(at.x, at.y);
    const cdp = await page.context().newCDPSession(page);
    const clip = new Clip(cdp, name);
    cdp.on("Page.screencastFrame", (f) => {
      const data = Buffer.from(f.data, "base64");
      clip.last = data;
      if (!clip.cutting) clip.frames.push({ t: Date.now() - clip.dropped, data });
      void cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
    });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, everyNthFrame: 1, maxWidth: 4096, maxHeight: 4096 });
    await sleep(250);
    return clip;
  }

  /** Leaves out the time `wait` takes. */
  async cut<T>(wait: Promise<T>): Promise<T> {
    this.cutFrom = Date.now();
    this.cutting = true;
    try {
      return await wait;
    } finally {
      await sleep(150);
      this.dropped += Date.now() - this.cutFrom;
      this.cutting = false;
      if (this.last) this.frames.push({ t: Date.now() - this.dropped, data: this.last });
    }
  }

  async stop() {
    const end = Date.now() - this.dropped;
    await this.cdp.send("Page.stopScreencast");
    await this.cdp.detach();
    const dir = join(OUT, `${this.name}.frames`);
    mkdirSync(dir, { recursive: true });
    const lines = ["ffconcat version 1.0"];
    this.frames.forEach((f, i) => {
      const file = `${String(i).padStart(5, "0")}.jpg`;
      writeFileSync(join(dir, file), f.data);
      const next = i + 1 < this.frames.length ? this.frames[i + 1]!.t : end;
      lines.push(`file '${file}'`, `duration ${(Math.max(1, next - f.t) / 1000).toFixed(4)}`);
    });
    // The concat demuxer drops the last duration unless the last file is named again.
    lines.push(`file '${String(this.frames.length - 1).padStart(5, "0")}.jpg'`);
    writeFileSync(join(dir, "list.ffconcat"), lines.join("\n") + "\n");
  }
}

const quietScribe: Step[] = [{ step: "report", report: report("Nothing to add.", "The Task says where the work stands.") }];

// 1. From a request to a Task landed on main (the suite's golden path, golden.spec.ts).
test("announce", async ({ baseURL }) => {
  const core = await Core.start("pf-announce", { "README.md": "# Reports\n", "src/report.py": "ROWS = []\n" }, {
    queued: afterOnboarding({ Triager: [{ steps: triager }], Implementer: [{ steps: implementer(1500) }], Reviewer: [{ steps: reviewer }], Scribe: scribes }),
  });
  const page = await open(core, baseURL!);
  await createApplication(page, "Reports", core.project);
  await pauseAutomations(page);
  await awaitOnboarding(page);
  await idle(page);

  const composer = page.getByRole("region", { name: "New Announcement" });
  const box = composer.getByRole("textbox", { name: "New Announcement" });
  const clip = await Clip.start(page, "announce");
  await sleep(500);
  await click(page, box, { fx: 0.3 });
  await box.pressSequentially("Please add a CSV export to the report page.", { delay: 30 });
  await sleep(300);
  await click(page, composer.getByRole("button", { name: "Post" }), { ms: 450 });
  const card = page.getByRole("article", { name: /Announcement: Please add a CSV export/ });
  await expect(card).toBeVisible();
  await sleep(1100);
  // The Triager's and the Scribe's Runs.
  await clip.cut(expect(card).toContainText(/[1-9] repl/, { timeout: 60_000 }));
  await sleep(500);
  await click(page, page.getByRole("button", { name: /^Open thread: Please add a CSV export/ }), { fx: 0.35 });
  const thread = page.getByRole("region", { name: /^Thread: Please add a CSV export/ });
  await expect(thread.getByRole("list", { name: "Replies" })).toContainText("I wrote this up as");
  await sleep(1800);
  await clip.stop();

  await expect(thread.getByRole("list", { name: "Replies" })).toContainText("landed on main", { timeout: 90_000 });
  await idle(page);
  await still(page, "thread");
  await thread.getByRole("button", { name: "#2 Export the report as CSV" }).click();
  const task = page.getByRole("region", { name: "Task: Export the report as CSV" });
  await expect(task.getByText("Done", { exact: true })).toBeVisible();
  await still(page, "task-landed");
  await page.context().close();
});

// 2. A request cut into Subtasks, built one at a time (the stories of tasks.spec.ts and
// agents.spec.ts): a Run watched live in Agents, then the chart and the Tasks tree mid-way.
test("agents", async ({ baseURL }) => {
  const request: Step[] = [
    { step: "call", tool: "get_thread", input: {} },
    { step: "call", tool: "create_task", input: { title: "CSV exports", what_to_build: "Let finance export reports and settings as CSV.", acceptance_criteria: ["Reports export as CSV", "Settings export as CSV"], labels: ["needs-breakdown"] } },
    { step: "report", report: report("Wrote the CSV exports Task for the Ticketer to cut.", "Exports touch every report and the settings: more than one change.") },
  ];
  const subtask = (title: string, what: string, more: Record<string, unknown> = {}): Step => ({
    step: "call",
    tool: "create_task",
    input: { title, what_to_build: what, acceptance_criteria: [`${title} works`, "It has tests"], labels: ["ready-for-agent"], ...more },
  });
  const cut = (summary: string, steps: Step[]): Step[] => [
    { step: "call", tool: "get_task", input: {} },
    ...steps,
    { step: "call", tool: "set_labels", input: { remove: ["needs-breakdown"] } },
    { step: "report", report: report(summary, "Each Subtask lands as one small change.") },
  ];
  // #2 CSV exports
  // ├ #3 Report exports
  // │ ├ #5 Export one report
  // │ └ #6 Export every report  blocked by #5
  // └ #4 Export the settings    blocked by #3
  const cutRequest = cut("Cut CSV exports into two Subtasks.", [
    subtask("Report exports", "Export every report as CSV.", { labels: ["needs-breakdown"] }),
    subtask("Export the settings", "Export the settings as CSV, after the reports.", { blocked_by: [3] }),
  ]);
  const cutReports = cut("Cut Report exports into two Subtasks.", [
    subtask("Export one report", "Export the open report as CSV."),
    subtask("Export every report", "Export all reports as one CSV.", { blocked_by: [5] }),
  ]);
  // The Run the clip watches: about seven seconds, a line or a file every second or two.
  const watched: Step[] = [
    { step: "call", tool: "get_task", input: {} },
    { step: "say", text: "Reading the Task and the report module." },
    { step: "sleep", ms: 3200 },
    { step: "say", text: "Writing a failing test: a header row, then one quoted row." },
    { step: "write", path: "src/export_one_test.py", content: "from export_one import to_csv\n\n\ndef test_quotes_commas():\n    assert to_csv([[\"a,b\", 1]]) == 'name,count\\n\"a,b\",1\\n'\n" },
    { step: "sleep", ms: 1700 },
    { step: "say", text: "Making it pass with the standard library's csv module." },
    { step: "write", path: "src/export_one.py", content: "import csv\nimport io\n\n\ndef to_csv(rows):\n    out = io.StringIO()\n    w = csv.writer(out, lineterminator=\"\\n\")\n    w.writerow([\"name\", \"count\"])\n    w.writerows(rows)\n    return out.getvalue()\n" },
    { step: "sleep", ms: 1500 },
    { step: "say", text: "The test passes. Committing." },
    { step: "commit", message: "Export one report as CSV" },
    { step: "usage", input_tokens: 18400, output_tokens: 2350 },
    { step: "sleep", ms: 1600 },
    { step: "report", report: report("Added to_csv with a header row and standard quoting, test first.", "The csv module already quotes correctly.", { artifacts: { files: ["src/export_one.py", "src/export_one_test.py"] } }) },
  ];
  const held: Step[] = [{ step: "call", tool: "get_task", input: {} }, { step: "say", text: "Reading the Task and the exporter it builds on." }, { step: "hold" }];
  const core = await Core.start("pf-agents", { "README.md": "# Reports\n", "src/report.py": "ROWS = []\n" }, {
    queued: afterOnboarding({ Triager: [{ steps: request }], Ticketer: [{ steps: cutRequest }, { steps: cutReports }], Implementer: [{ steps: watched }, { steps: held }], Reviewer: [{ steps: reviewer }] }),
    fallback: { Scribe: { steps: quietScribe } },
  });
  const page = await open(core, baseURL!);
  await createApplication(page, "Reports", core.project);
  await pauseAutomations(page);
  await awaitOnboarding(page);
  await idle(page);
  const composer = page.getByRole("region", { name: "New Announcement" });
  await composer.getByRole("textbox", { name: "New Announcement" }).fill("Finance wants to export reports and settings as CSV.");
  await composer.getByRole("button", { name: "Post" }).click();
  await page.getByRole("tab", { name: /^Agents/ }).click();
  at = { x: 330, y: 560 };
  await page.mouse.move(at.x, at.y);

  // In Running, not still on its way up from Queued, or the click lands where it was.
  const node = page.getByRole("region", { name: "Running" }).getByRole("button", { name: "Writing code: Export one report", exact: true });
  await expect(node).toBeVisible({ timeout: 90_000 });
  await sleep(300);
  const clip = await Clip.start(page, "agents");
  await sleep(350);
  await click(page, node, { fx: 0.3, ms: 500 });
  const panel = page.getByRole("region", { name: "Writing code: Export one report", exact: true });
  await expect(panel).toBeVisible();
  const log = panel.getByRole("log", { name: "Run output" });
  await expect(log).toContainText("Committing", { timeout: 30_000 });
  await sleep(1500);
  await clip.stop();

  // Mid-way: the first leaf is through, the second is being built on it, the third waits.
  await panel.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("region", { name: "Running" }).getByRole("button", { name: "Writing code: Export every report", exact: true })).toBeVisible({ timeout: 90_000 });
  await idle(page, { held: ["Implementer"] });
  await sleep(500);
  await still(page, "agents");
  await page.getByRole("tab", { name: /^Tasks/ }).click();
  const tree = page.getByRole("region", { name: "Tasks", exact: true });
  const more = tree.getByRole("button", { name: /^Show Subtasks of / });
  for (let i = 0; i < 10 && (await more.count()) > 0; i++) await more.first().click();
  await sleep(400);
  await still(page, "tasks");
  await tree.getByRole("button", { name: /^CSV exports/ }).first().click();
  await expect(page.getByRole("region", { name: "Task: CSV exports" })).toBeVisible();
  await sleep(400);
  await still(page, "task-panel");
  await page.context().close();
});

// 3. What waits on the human (needs-you.spec.ts): at the Review Autonomy level, the Onboarder's
// question and Waltz's own, whether the first Onboarding lands, each answered with one click.
test("needs-you", async ({ baseURL }) => {
  const story = onboarding();
  const question = { title: "Should AGENTS.md cover the release steps?", reason: "The README describes a release script.", about: "direction", options: ["Yes", "No"], recommendation: "No" };
  story.Onboarder = [{ steps: onboarder(0).map((s) => (s.step === "report" ? { ...s, report: { ...(s.report as object), questions: [question] } } : s)) }];
  const quiet: Scripts["fallback"] = {
    Triager: { steps: [{ step: "report", report: report("Left it for later.", "Nothing else waits on it.") }] },
    Scribe: { steps: [{ step: "report", report: report("Nothing to add.", "Waltz's own replies say where the work stands.") }] },
  };
  const core = await Core.start("pf-needs-you", { "README.md": "# Reports\n" }, { queued: story, fallback: quiet });
  const page = await open(core, baseURL!);

  // The setup wizard on its Autonomy choice, then created at Review.
  await page.getByRole("button", { name: "New Application" }).first().click();
  const dialog = page.getByRole("dialog", { name: "New Application" });
  await dialog.getByLabel("Name").fill("Reports");
  await dialog.getByLabel("Project", { exact: true }).fill(core.project);
  await dialog.getByRole("tab", { name: "Task tracker" }).click();
  const review = dialog.getByRole("radiogroup", { name: "Autonomy" }).getByRole("radio", { name: "Review", exact: true });
  await review.click();
  await review.scrollIntoViewIfNeeded();
  await sleep(400);
  await still(page, "setup-autonomy");
  await dialog.getByRole("button", { name: "Create Application" }).click();
  await expect(dialog).toBeHidden();

  const pinned = page.getByRole("region", { name: "Needs you" });
  const sets = pinned.getByRole("region", { name: "Questions from Waltz" });
  await expect(sets).toHaveCount(2, { timeout: 90_000 });
  await idle(page);
  await sleep(600);
  await still(page, "needs-you");

  at = { x: 760, y: 560 };
  const clip = await Clip.start(page, "needs-you");
  await sleep(900);
  await click(page, sets.nth(0).getByRole("button", { name: "No", exact: true }), { fx: 0.25, ms: 700 });
  await expect(sets).toHaveCount(1, { timeout: 60_000 });
  await expect(sets.nth(0)).toContainText("Land the first Onboarding?");
  await sleep(1500);
  await click(page, sets.nth(0).getByRole("button", { name: "Land it", exact: true }), { fx: 0.25, ms: 700 });
  await expect(pinned).toHaveCount(0, { timeout: 60_000 });
  await sleep(1600);
  await clip.stop();
  await expect.poll(async () => (await invoke<unknown[]>(page, "list_open_question_sets")).length, { timeout: 60_000 }).toBe(0);
  await page.context().close();
});
