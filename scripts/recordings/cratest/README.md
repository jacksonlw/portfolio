# The Cratest capture

These scripts re-shoot the portfolio stills and clips of The Cratest (`~/cratest`) in the iOS Simulator.

## Prereqs

- `~/cratest` checked out, with the gitignored `api/config.yaml` pointing at a local PostgreSQL 15+ dev database. That database needs catalog data and artwork in `api/data/media`.
- Xcode 27, and an iOS 26+ simulator named `iPhone 18 Pro`. Set `DEVICE_NAME` to use a different one.
- `go`, `python3` and `ffmpeg` (ffmpeg is only needed for trimming).

## Usage

```bash
scripts/recordings/cratest/capture.sh /path/to/raw-out                 # all tests
scripts/recordings/cratest/capture.sh /path/to/raw-out test2Deck       # just some
```

The tests are `test1Onboarding`, `test2Deck`, `test3Crate`, `test4CrateDigger`, `test5CoverStory` and `test6ShareCard`.

`capture.sh` makes no tracked changes in `~/cratest`. It copies the test file in for the run and deletes it on exit, then prints `git status` before and after. It doesn't edit any xcconfig: the API URL goes in on the xcodebuild command line.

The run does write to the local dev database. It adds Games puzzles from yesterday through tomorrow, plus throwaway guests, reviews and game plays.

The run produces raw files in the output directory:

- **Stills:** `onboarding-genres`, `review-deck`, `rating`, `crate`, `crate-shelves`, `games`, `crate-digger`, `cover-story`, `item-page` and `share-card` (.png, 1206×2622).
- **Clips:** `swipe`, `crate-digger` and `cover-story` (.mov). These are raw, variable-frame-rate recordings, and the app's waits leave idle stretches in them.

Notes:

- A fresh install gets a fresh guest, so each Games test plays today's puzzle from the start.
- Cover Story's cover depends on the day's puzzle.

## Manual trims (last shoot, 2026-11-10)

simctl writes frames only when the screen changes. Before trimming, find the idle gaps with this command:

```bash
ffprobe -v error -select_streams v -show_entries frame=pts_time -of csv=p=0 swipe.mov \
  | awk 'NR>1 && $1-p>0.25 {printf "gap %.2f-%.2f\n", p, $1} {p=$1}'
```

Each kept segment was cut after `fps=60` was applied to the whole stream. Trimming first makes a held frame stretch across a cut gap. The segments were then joined and encoded with x264 at CRF 18, yuv420p, with no audio. The timings below are seconds in the raw file, and they change from one shoot to the next.

- `swipe.mov`: kept 3.5–7.9 and 9.1–13.6, for 8.9 s. That covers the skip and the "haven't heard it". The cut drops a static pause, then the clip continues with the 4.5-star rating and the send up. The first ~2.3 s of a raw clip can show a stale frame from the previous screen.
- `crate-digger.mov`: kept 4.3–9.2 and 13.3–18.1, for 9.3 s. This leaves one visible jump cut where about 4 s of waiting before the second guess was removed.
- `cover-story.mov`: kept 2.2–4.3, 6.7–8.8 and 11.3–12.5, then held the last frame for 1.6 s, for 7.0 s total. Each cut drops a static wait between Skips.

Encoding the trimmed clips to web sizes is `scripts/recordings/encode.sh`.
