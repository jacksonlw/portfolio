#!/usr/bin/env bash
# Runs the 2019 TEDx ticketing app locally against a throwaway Postgres with mock data and
# shoots the stills. Usage: capture.sh <work dir> <raw out dir>
# Nothing is pushed anywhere; the clone in <work dir> is patched in place (see README.md).
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
work=$(mkdir -p "$1" && cd "$1" && pwd) out=$(mkdir -p "$2" && cd "$2" && pwd)
app=$work/tedx pgdata=$work/pg-tedx tools=$work/tools
export LC_ALL=${LC_ALL:-en_US.UTF-8} PGPORT=${PGPORT:-54330} PORT=${PORT:-4020}

[ -d "$app" ] || git clone -q https://github.com/jacksonlw/ticketing-tedxdesigntech "$app"

# --- local patches to the clone -------------------------------------------------------------
cd "$app"
node -e '
  const fs = require("fs"), p = JSON.parse(fs.readFileSync("package.json"));
  const d = p.dependencies;
  d.pg = "^8.11.0"; delete d["pg-native"];          // pg 7 cannot connect on current Node
  d["express-flash"] = "0.0.2";                     // was a dead git:// URL
  delete d["@sendgrid/mail"]; delete d.stripe; delete d.gulp;
  p.devDependencies = { stylus: "^0.59.0" };
  fs.writeFileSync("package.json", JSON.stringify(p, null, 2));'
rm -f package-lock.json
[ -d node_modules ] || npm install --ignore-scripts --no-audit --no-fund --silent
cp "$here/mocks/mail.js" src/mail/orderComplete.js
cp "$here/mocks/mail.js" src/mail/ticketsShipping.js
cp "$here/mocks/createStripeCustomer.js" "$here/mocks/generateCheckoutSession.js" src/stripe/
# The port was hard-coded to 3000; the Stripe client in the routes file becomes an inert object.
sed -i '' 's/^const port = 3000;/const port = process.env.PORT || 4020;/' src/app.js
sed -i '' 's/^const stripe = require("stripe")(.*$/const stripe = { webhooks: {} };/' src/routes/seats/index.js
node "$here/build-static.js" "$app"

# --- throwaway database ---------------------------------------------------------------------
[ -d "$pgdata" ] || initdb -D "$pgdata" -U postgres -A trust --locale=C -E UTF8 >/dev/null
PGHOST=127.0.0.1 pg_ctl -D "$pgdata" -o "-p $PGPORT -c listen_addresses=127.0.0.1 -c unix_socket_directories=''" -l "$work/pg.log" -w start >/dev/null
cleanup() {
  [ -n "${app_pid:-}" ] && kill "$app_pid" 2>/dev/null || true
  pg_ctl -D "$pgdata" -m fast -w stop >/dev/null || true
}
trap cleanup EXIT
psql -q -h 127.0.0.1 -U postgres -d postgres -c 'DROP DATABASE IF EXISTS ticketing' -c 'CREATE DATABASE ticketing'
psql -q -h 127.0.0.1 -U postgres -d ticketing -f "$here/schema.sql"
cp "$here/seed.js" "$app/.seed.js" && node "$app/.seed.js" && rm "$app/.seed.js"

# --- app + stills ---------------------------------------------------------------------------
node src/app.js >"$work/tedx-app.log" 2>&1 & app_pid=$!
for _ in $(seq 40); do curl -sf -o /dev/null "http://localhost:$PORT/seats/selection" && break; sleep 0.25; done
[ -d "$tools/node_modules/playwright-core" ] || npm install --prefix "$tools" --silent --no-audit --no-fund playwright-core
NODE_PATH="$tools/node_modules" BASE="http://localhost:$PORT" node "$here/capture.js" "$out"
ls -la "$out"
