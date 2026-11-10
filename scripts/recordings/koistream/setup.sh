#!/usr/bin/env bash
# Builds a local, offline-ish KoiStream to photograph: clones the repo read-only, installs a
# minimal set of runtime deps beside it, starts a throwaway Postgres, seeds mock data and
# generates the placeholder video. Usage: setup.sh <work dir>   (then start.sh, capture.mjs)
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
work=$1; mkdir -p "$work"; work=$(cd "$work" && pwd)
PGPORT=${PGPORT:-55432}
export LC_ALL=${LC_ALL:-en_US.UTF-8}  # Homebrew Postgres refuses to start without a valid locale

[ -d "$work/repo" ] || git clone https://github.com/jacksonlw/koistream "$work/repo"

# The repo's own `npm install` fails on Apple Silicon (an old fsevents under gulp), and its
# scripts only run gulp. Install just what the server requires, with install scripts off.
if [ ! -d "$work/run/node_modules" ]; then
  mkdir -p "$work/run" && cd "$work/run"
  echo '{"name":"koistream-mock-run","private":true}' > package.json
  npm install --ignore-scripts --no-audit --no-fund express@4 pug@2.0.0-beta11 knex@0.21 pg@8 \
    socket.io@2 lodash bad-words@3 randomstring@1 string-strip-html@5 express-validator@6 \
    http-errors cookie-parser morgan log-symbols@4 dotenv@8 stylus puppeteer-core
fi
ln -sfn "$work/run/node_modules" "$work/repo/node_modules"
cp "$here/mock/mock-app.js" "$work/repo/src/mock-app.js"
node "$here/mock/build-static.js" "$work/repo"

# Placeholder media: SMPTE bars as a two-rendition HLS stream, an abstract gradient in place
# of the home page's promo video (the real one shows students), and plain initial avatars.
pub="$work/mock-public"; mkdir -p "$pub/mock-stream" "$pub/videos" "$pub/mock-avatars"
for h in 1080 720; do
  ffmpeg -loglevel error -y -f lavfi -i "smptehdbars=size=$((h*16/9))x$h:rate=30" -t 60 \
    -c:v libx264 -pix_fmt yuv420p -g 60 -hls_time 4 -hls_playlist_type vod \
    -hls_segment_filename "$pub/mock-stream/${h}p_%03d.ts" "$pub/mock-stream/${h}p.m3u8"
done
cat > "$pub/mock-stream/stream.m3u8" <<M3U
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p.m3u8
M3U
ffmpeg -loglevel error -y -f lavfi -i "gradients=size=1280x720:rate=30:c0=0x0b1d3a:c1=0x026fff:c2=0x00c6ff:c3=0x14171e:nb_colors=4:speed=0.02" \
  -t 12 -c:v libx264 -pix_fmt yuv420p "$pub/videos/koistream-promo.mp4"
i=0; for c in 026FFF 02e89e ff9f43 e056fd 8395a7 ff6b6b 576574 00c6ff; do
  l=$(printf "\\$(printf '%03o' $((97+i)))")
  printf '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><rect width="96" height="96" fill="#%s"/><circle cx="48" cy="38" r="16" fill="#fff" fill-opacity=".85"/><path d="M16 96c0-20 14-30 32-30s32 10 32 30z" fill="#fff" fill-opacity=".85"/></svg>' "$c" > "$pub/mock-avatars/$l.svg"
  i=$((i+1))
done

# Throwaway Postgres: its own data dir and port, TCP on localhost only, trust auth.
if [ ! -d "$work/pgdata" ]; then
  initdb -A trust -U koistream -D "$work/pgdata" >/dev/null
  printf "port = %s\nlisten_addresses = 'localhost'\nunix_socket_directories = ''\n" "$PGPORT" >> "$work/pgdata/postgresql.conf"
fi
pg_ctl -D "$work/pgdata" status >/dev/null 2>&1 || pg_ctl -s -D "$work/pgdata" -l "$work/pg.log" -w start
psql -q -h localhost -p "$PGPORT" -U koistream -d postgres -c 'DROP DATABASE IF EXISTS koistream' -c 'CREATE DATABASE koistream'
psql -q -h localhost -p "$PGPORT" -U koistream -d koistream -v ON_ERROR_STOP=1 -f "$here/mock/schema.sql" -f "$here/mock/seed.sql"
echo "ready: run start.sh $work"
