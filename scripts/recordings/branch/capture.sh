#!/usr/bin/env bash
# Runs the 2019 Branch dashboards locally against a throwaway MongoDB with mock data and shoots
# the stills. Usage: capture.sh <work dir> <raw out dir>
# Nothing is pushed anywhere; the clone in <work dir> is patched in place (see README.md).
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
work=$(mkdir -p "$1" && cd "$1" && pwd) out=$(mkdir -p "$2" && cd "$2" && pwd)
app=$work/branch dbpath=$work/mongo-branch tools=$work/tools
export PORT=${PORT:-4010} MONGO_PORT=${MONGO_PORT:-27027}
export MONGO_URL=mongodb://127.0.0.1:$MONGO_PORT

[ -d "$app" ] || git clone -q https://github.com/jacksonlw/Branch "$app"

# --- local patches to the clone -------------------------------------------------------------
cd "$app"
if [ ! -f .patched ]; then
  # The repo commits its 2019 node_modules. Its MongoDB driver cannot talk to a current server,
  # so the modules are reinstalled with the last 3.x driver and the Mongoose that goes with it.
  rm -rf node_modules package-lock.json
  node -e '
    const fs = require("fs"), p = JSON.parse(fs.readFileSync("package.json"));
    p.dependencies.mongoose = "5.13.22"; p.dependencies.mongodb = "3.7.4";
    fs.writeFileSync("package.json", JSON.stringify(p, null, 2));'
  npm install --ignore-scripts --no-audit --no-fund --silent
  # Every file opened its own connection to mongodb://localhost:27017; point them at the scratch one.
  grep -rlE 'mongodb://localhost:27017' app.js routes config \
    | xargs sed -i '' -E "s#[\"']mongodb://localhost:27017(/OpenWorld)?[\"']#(process.env.MONGO_URL + \"\\1\")#g"
  sed -i '' 's/^const port = 4010$/const port = process.env.PORT || 4010/' app.js
  touch .patched
fi

# --- throwaway database ---------------------------------------------------------------------
mkdir -p "$dbpath"
mongod --dbpath "$dbpath" --port "$MONGO_PORT" --bind_ip 127.0.0.1 --nounixsocket \
  --logpath "$work/mongo.log" >/dev/null 2>&1 & mongo_pid=$!
cleanup() { kill ${app_pid:-} "$mongo_pid" 2>/dev/null || true; wait 2>/dev/null || true; }
trap cleanup EXIT
for _ in $(seq 60); do nc -z 127.0.0.1 "$MONGO_PORT" 2>/dev/null && break; sleep 0.25; done
export NODE_PATH="$app/node_modules:$tools/node_modules"
node "$here/seed.js"

# --- app + stills ---------------------------------------------------------------------------
node app.js >"$work/branch-app.log" 2>&1 & app_pid=$!
for _ in $(seq 40); do curl -sf -o /dev/null "http://localhost:$PORT/auth/login" && break; sleep 0.25; done
[ -d "$tools/node_modules/playwright-core" ] || npm install --prefix "$tools" --silent --no-audit --no-fund playwright-core
BASE="http://localhost:$PORT" node "$here/capture.js" "$out"
ls -la "$out"
