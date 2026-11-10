# The Waltz capture

These scripts re-shoot the portfolio stills and clips of Waltz (`~/waltz-ide`) on Waltz's own end-to-end setup: the real UI in headless Chrome, talking to the app's `e2e` build of the Rust core. Every agent Run is played by the suite's scripted Runner, so no model is called and nothing is spent.

## Prereqs

- `~/waltz-ide` checked out with `pnpm install` done (set `WALTZ_DIR` for another path).
- Rust (`~/.cargo/bin/cargo`), Google Chrome, `ffmpeg` and `cwebp`.

## Usage

```bash
scripts/recordings/waltz/capture.sh /path/to/raw-out                # all three scenes
scripts/recordings/waltz/capture.sh /path/to/raw-out agents         # just some
scripts/recordings/waltz/publish.sh /path/to/raw-out                # encode into public/stories/waltz
```

The scenes are `announce`, `agents` and `needs-you`. A full run takes about a minute once the core is built; the first run builds it (`cargo build -p waltz-app --features e2e`, a few minutes, into Waltz's gitignored `target/`).

`capture.sh` makes no tracked changes in `~/waltz-ide`. It copies `capture.spec.ts` into `tests/e2e/` for the run and deletes it on exit, then prints `git status` before and after. The suite's own Vite server starts on its usual port (20000 and up, derived from the checkout's path; not 3000) and stops with the run. Each scene's core works in a temp directory that is removed when the scene ends.

The run produces raw files in the output directory:

- **Stills:** `thread`, `task-landed`, `agents`, `tasks`, `task-panel`, `setup-autonomy` and `needs-you`, each as `-light.png` and `-dark.png` (2560×1600, a 1280×800 window at 2x).
- **Clips:** `announce`, `agents` and `needs-you` (.mov, 2560×1600, 60 fps), each with its `.frames/` folder of screencast JPEGs and the `list.ffconcat` that times them.

`publish.sh` picks from these, renames them for the gallery (`agents.mov` becomes `agents-live`, `task-panel-light` becomes `task`, and so on; the list is at the top of the script), adds `logo` from `brand/logo/waltz-logo-ink.png` on the brand's paper colour, and runs `../encode.sh` at 1280 px for clips and 1600 px for stills.

## How the clips are made

- Playwright's own video is a soft 1x VP8, so the clips come from Chrome's screencast instead: one JPEG per repaint, with the time it was shown. Chrome records the window's real surface, so the capture launches its own Chrome at `--force-device-scale-factor=2` (an emulated `deviceScaleFactor` records at 1x).
- Headless Chrome draws no pointer. The spec injects a small arrow that follows the mouse, and moves the mouse along eased paths. It is hidden for stills.
- Waits are cut in the script, not by hand: `clip.cut(...)` drops the time a wait takes. `announce` has one cut, while the Triager's and the Scribe's Runs finish between the post and its first replies. The other two clips run in real time.
- The Run watched in `agents` is a script written for the clip (in `capture.spec.ts`): four lines and two files over about seven seconds. The other Runs are the suite's own scripts from `tests/e2e/scripts.ts`.

Notes:

- The demo Application is the suite's "Reports" fixture; its requests, Tasks and replies are test data, not real work.
- Automations are paused in the `announce` and `agents` scenes, as in the suite, so no Schedule fires into the picture. The Agents tab says so ("Paused: nothing fires until you resume").
- Times show as "just now" and the elapsed counters are live, so stills differ by a second or two between shoots.
- The E2E baselines in `tests/e2e/baselines/` are not used: they are 1x and have magenta masks over every time.
