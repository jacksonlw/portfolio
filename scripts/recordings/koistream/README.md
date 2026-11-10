# The KoiStream capture

These scripts re-shoot the portfolio stills of KoiStream (github.com/jacksonlw/koistream) from a local run with mock data, and record how the two clips were cut from the 2020 broadcast recording.

Nothing here touches the GitHub repo. The clone is read-only in spirit: the scripts add untracked files to it (`node_modules` symlink, `src/mock-app.js`, the gitignored `bin/css`, `bin/js`, `bin/img`) and never commit or push.

## Prereqs

- `node` 22, `ffmpeg`, `cwebp`, Google Chrome, and Homebrew PostgreSQL (`initdb`, `pg_ctl`, `psql` on the PATH).
- Ports 4310 (the app) and 55432 (a throwaway Postgres). Override with `PORT` and `PGPORT`.

## Usage

```bash
work=/path/to/scratch/koistream
scripts/recordings/koistream/setup.sh "$work"            # clone, deps, mock media, Postgres, seed
scripts/recordings/koistream/start.sh "$work" &          # the app on 127.0.0.1:4310
node scripts/recordings/koistream/capture.mjs "$work" "$work/raw"
WIDTH=1600 scripts/recordings/encode.sh "$work/raw" "$work/enc"
kill %1; pg_ctl -D "$work/pgdata" stop
```

Then copy the stills you want from `$work/enc` to `public/stories/koistream/`. The last shoot kept `home`, `watch`, `moderation`, `admin-stream` and `admin-users`, and left out `admin-inspect-user` (it shows today's date as the account's creation date).

## What is mocked

The pages, styles, client scripts, routes, database queries and socket.io events are the repo's own at `502f565`. These parts are not:

- **Sign-in.** Google OAuth is gone. A `mock_user` cookie picks one of eight seeded users; `/mock/login/<googleId>` sets it. `mock-admin` has `auth` 3, the level the code treats as admin.
- **Database.** The repo has no schema or migrations, so `mock/schema.sql` is rebuilt from the queries in `src/db`. Column names are the code's; types and defaults are guesses. Every row in `mock/seed.sql` is invented: names like "Sample Viewer", `example.org` addresses, nine chat lines, three chat tags, the stream title and description.
- **Video.** The player's hard-coded CloudFront HLS URL is rewritten to a local two-rendition HLS stream of SMPTE colour bars made with ffmpeg. The real pipeline (MediaLive, CloudFront) is not involved.
- **Home page background.** The repo's `bin/videos/koistream-promo.mp4` shows students, so an ffmpeg gradient is served in its place. It sits under an 80% dark overlay either way.
- **AWS.** `aws-sdk` is replaced with a stub that throws if called. No credentials are read.
- **Left out.** The Postgres session store, the IP lookup middleware, and gulp (`mock/build-static.js` compiles the stylus and copies js and img the way the gulpfile's `static` task does).
- **Install.** `npm install` on the repo fails on Apple Silicon, so only the server's runtime packages are installed, in `$work/run`, with install scripts off. Versions are close to the lockfile's majors, not identical.

The pages still load jQuery, lodash, moment, socket.io's client, video.js, Pickr and Google Fonts from their public CDNs, as the real site did.

One thing in the stills is real: the welcome line in chat and the Contact Us button carry the site's own contact address, which is hard-coded in the templates.

## Clips from the 2020 recording

`~/Downloads/KoiStream-8_27_2020.mp4` is a 35:27 recording of the broadcast itself (1920×1080, 59.94 fps), not of the website. Most of it shows people, so only two stretches without anyone on screen were used:

```bash
cut() { ffmpeg -y -ss "$2" -t "$3" -i ~/Downloads/KoiStream-8_27_2020.mp4 -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart -an "$1.mp4"
  ffmpeg -y -i "$1.mp4" -frames:v 1 -q:v 4 "$1.jpg"; }
cut public/stories/koistream/broadcast-preshow 302.5 8.5    # drone shot of the campus, after the holding slate
cut public/stories/koistream/broadcast-credits 1912.5 9.5   # "Produced by students." then the health and safety card
```

The holding slate before 302 s was skipped because the school's sign fills the lower third of it.
