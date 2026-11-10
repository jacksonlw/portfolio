# The AnyForm capture

These scripts re-shoot the portfolio stills and clips of AnyForm (`~/anyform`) from a throwaway local stack: the dashboard, the API, ingest and worker, and Fernway, the repo's demo shop.

## Prereqs

- `~/anyform` checked out and already set up for local development (`scripts/dev-setup.sh` there): the gitignored `api/config.yaml`, `api/.env` and `scouts/.env` must exist. Set `ANYFORM_DIR` for a different checkout.
- PostgreSQL 15+ on `127.0.0.1:5432`. Set `PG_ADMIN_URL` for a different server.
- `go`, `node` 22.12+, `npx`, Google Chrome, `ffmpeg` and `cwebp`.
- Ports 3100, 4380, 8080 and 8081 free. The dashboard runs on 3100 because the portfolio's dev server has 3000.

## Usage

```bash
W=/path/to/work                      # logs, pids, binaries, the object store
scripts/recordings/anyform/up.sh "$W"
node --experimental-strip-types scripts/recordings/anyform/seed.mjs "$W"
node scripts/recordings/anyform/capture.mjs "$W/raw/clips" replay finding scouts
node scripts/recordings/anyform/capture.mjs "$W/raw/stills" stills
WIDTH=1280 scripts/recordings/encode.sh "$W/raw/clips"  public/stories/anyform
WIDTH=1600 scripts/recordings/encode.sh "$W/raw/stills" public/stories/anyform
scripts/recordings/anyform/down.sh "$W" --drop
```

- `up.sh` creates the database `anyform_story`, builds the Go binaries into the work directory, makes a production build of the dashboard and of Fernway, and starts everything. It makes no tracked changes in `~/anyform`: it only rewrites gitignored build output (`web/.next`, `demo/fernway/dist`). The servers read the repo's own `api/config.yaml` and `api/.env`, and `up.sh` overrides the database, the allowed web origin and the object store by environment variable. `SKIP_WEB_BUILD=1` reuses the last builds.
- `seed.mjs` signs in as `demo@example.com` through the development sign-in, names the team Fernway, creates the Application "Fernway shop" and records 21 visits. The visits are the repo's own journeys (`demo/fernway/record/journeys.ts`), driven in Chrome and recorded by the AnyForm SDK into the local ingest. It adds no Scouts: the last shoot had six from the starter catalog, added by hand with `POST /v1/scout-catalog/<key>/copy` (`first_time_shopper`, `keyboard_only_user`, `rushed_mobile_shopper`, `skeptical_buyer`, `form_edge_case_tester`, `screen_reader_user`).
- `capture.mjs` writes the raw files. Stills are 1440×900 at 2x. Clips are 1280×800 at 60 fps, assembled from Chrome's screencast frames (`record.mjs`), so `encode.sh` at `WIDTH=1280` doesn't resample them.
- `down.sh` stops the servers. With `--drop` it also drops `anyform_story`.

## What it produces

- **Stills:** `overview`, `findings`, `finding-page`, `session-replay`, `screens`, `scouts-roster`, and `logo` (copied from `~/anyform/logo/png/lockup`).
- **Clips:** `replay` (a recorded visit playing back to the rage click), `finding` (from the Findings list into one Finding, then its moment playing) and `scouts` (the roster, then the ready-made catalog).

Notes:

- Everything on screen is demo data. Fernway is a fictional shop, and the names and card numbers in the replays are the SDK's look-alike values or Fernway's test values.
- The black arrow in the clips is drawn by `record.mjs`, because headless Chrome paints no pointer. The other cursor, inside the replay, is the product's own.
- Each visit runs in its own Chrome. Visits sharing one browser stall, because background tabs are throttled.
- Session ids, times and the "min ago" labels change on every shoot. `capture.mjs` finds the session by the Finding's title ("Rage click on Checkout · Payment").

## Not captured (last shoot, 2026-11-10)

- **No Scout run and no model-written review.** Both need a working `LOOKOUT_ANTHROPIC_API_KEY` in `~/anyform/api/.env`. The key there was rejected (HTTP 401), so the one Rehearsal tried failed at its first model call and was deleted from the throwaway database. Every Finding in the shots comes from signals, and the Scout cards read "0 rehearsals".
- The Free plan runs one Scout at a time, so a Rehearsal with two Scouts is refused (429).
- The Overview's Heatmaps tab never finished loading in headless Chrome and was left out.
