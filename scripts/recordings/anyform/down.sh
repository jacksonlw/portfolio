#!/usr/bin/env bash
# Stops what up.sh and seed.mjs started. With --drop it also drops the throwaway database.
# Usage: down.sh <work dir> [--drop]
WORK=${1:?usage: down.sh <work dir> [--drop]}
PG=${PG_ADMIN_URL:-postgres://127.0.0.1:5432/postgres}
DB=${STORY_DB:-anyform_story}
for f in "$WORK"/pids/*; do
  [ -f "$f" ] || continue
  pid=$(cat "$f")
  pkill -P "$pid" 2>/dev/null
  kill "$pid" 2>/dev/null && echo "stopped $(basename "$f")"
  rm -f "$f"
done
# next start and vite preview run under npx/pnpm wrappers; make sure the listeners are gone.
for port in ${WEB_PORT:-3100} 4380; do
  pids=$(lsof -tiTCP:$port -sTCP:LISTEN 2>/dev/null) && [ -n "$pids" ] && kill $pids 2>/dev/null && echo "freed :$port"
done
if [ "${2:-}" = --drop ]; then
  sleep 2 # the servers take a moment to let go of their connections
  psql "$PG" -qc "drop database if exists $DB" && echo "dropped $DB"
fi
exit 0
