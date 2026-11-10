#!/usr/bin/env bash
# Starts the mock run in the foreground on 127.0.0.1:$PORT (default 4310; 3000 is the portfolio).
# Usage: start.sh <work dir>.  Stop Postgres afterwards with: pg_ctl -D <work dir>/pgdata stop
set -euo pipefail
work=$(cd "$1" && pwd)
cd "$work/repo"
PORT=${PORT:-4310} PGPORT=${PGPORT:-55432} DB_HOST=localhost DB_USER=koistream DB_NAME=koistream DB_PASS= \
  MOCK_PUBLIC="$work/mock-public" exec node src/mock-app.js
