#!/usr/bin/env bash
# Starts a throwaway AnyForm stack for the capture: its own database (anyform_story), its own
# object store, the API, ingest, worker, checks service, Scout runner and the dashboard on :3100.
# Nothing tracked in ~/anyform changes; only gitignored build output (web/.next, demo/fernway/dist).
# Usage: up.sh <work dir>     Stop with down.sh <work dir>.
set -euo pipefail
WORK=${1:?usage: up.sh <work dir>}
AF=${ANYFORM_DIR:-$HOME/anyform}
PG=${PG_ADMIN_URL:-postgres://127.0.0.1:5432/postgres}
DB=${STORY_DB:-anyform_story}
WEB_PORT=${WEB_PORT:-3100}
mkdir -p "$WORK/bin" "$WORK/logs" "$WORK/pids" "$WORK/objects"
export npm_config_cache=${npm_config_cache:-$AF/.dev/npm-cache}

start() { # name, dir, command...
  local name=$1 dir=$2; shift 2
  (cd "$dir" && nohup "$@" >"$WORK/logs/$name.log" 2>&1 & echo $! >"$WORK/pids/$name")
}

echo "Database"
if [ "$(psql "$PG" -Atqc "select 1 from pg_database where datname = '$DB'")" != 1 ]; then
  psql "$PG" -qc "create database $DB"
  psql "${PG%/*}/$DB" -v ON_ERROR_STOP=1 -q -f "$AF/db/schema/001_initial_schema.sql" -f "$AF/db/schema/002_seed_data.sql" >/dev/null
fi

echo "Building"
(cd "$AF/api" && CGO_ENABLED=0 GOFLAGS=-buildvcs=false go build -o "$WORK/bin/" ./cmd/api ./cmd/ingest ./cmd/worker)

# The servers read api/config.yaml and api/.env from their working directory; these win over both.
export DATABASE_URL="${PG%/*}/$DB?sslmode=disable"
export CORS_ALLOWED_ORIGINS="http://127.0.0.1:$WEB_PORT"
export WEBAUTHN_ORIGINS="http://127.0.0.1:$WEB_PORT"
export WEB_BASE_URL="http://127.0.0.1:$WEB_PORT"
export LOOKOUT_OBJECTSTORE_ROOT="$WORK/objects"
export LOOKOUT_SCOUTS_ALLOW_LOCAL_TARGETS=true
export LOOKOUT_SCOUTS_INGEST_URL=http://127.0.0.1:8081

echo "Starting"
start api "$AF/api" "$WORK/bin/api"
start ingest "$AF/api" "$WORK/bin/ingest"
start worker "$AF/api" "$WORK/bin/worker"
if [ -f "$AF/scouts/.env" ]; then
  start checks "$AF/scouts" node --env-file=.env dist/checks/main.js
  start scouts "$AF/scouts" node --env-file=.env dist/runner/main.js
fi

# A production build of the dashboard: no dev badge, no compile pauses in the clips.
# Dogfooding is off so the dashboard doesn't try to record itself into a key this database lacks.
(
  cd "$AF/web"
  export NEXT_PUBLIC_API_URL=http://127.0.0.1:8080 NEXT_PUBLIC_SITE_URL="http://127.0.0.1:$WEB_PORT"
  export NEXT_PUBLIC_ANYFORM_DOGFOOD=off NEXT_PUBLIC_ANYFORM_DOGFOOD_KEY=
  [ "${SKIP_WEB_BUILD:-}" = 1 ] || npx -y pnpm@9.15.0 build >"$WORK/logs/web-build.log" 2>&1
  nohup npx -y pnpm@9.15.0 start -p "$WEB_PORT" -H 127.0.0.1 >"$WORK/logs/web.log" 2>&1 &
  echo $! >"$WORK/pids/web"
)

# Fernway, the demo shop, built without a key: seed.mjs passes the Application's key in the URL.
(
  cd "$AF/demo/fernway"
  [ "${SKIP_WEB_BUILD:-}" = 1 ] || VITE_ANYFORM_KEY= VITE_ANYFORM_INGEST_URL= npx -y pnpm@9.15.0 build >"$WORK/logs/fernway-build.log" 2>&1
  nohup npx -y pnpm@9.15.0 exec vite preview --host 127.0.0.1 --port 4380 --strictPort >"$WORK/logs/fernway.log" 2>&1 &
  echo $! >"$WORK/pids/fernway"
)

sleep 4
for f in "$WORK"/pids/*; do
  n=$(basename "$f")
  if kill -0 "$(cat "$f")" 2>/dev/null; then echo "  $n running"; else echo "  $n stopped: see $WORK/logs/$n.log"; fi
done
echo "Dashboard: http://127.0.0.1:$WEB_PORT   Shop: http://127.0.0.1:4380   API: http://127.0.0.1:8080   Ingest: http://127.0.0.1:8081"
