#!/usr/bin/env bash
# Picks the raw captures the Story uses, gives them their gallery names, and encodes them into
# public/stories/waltz with ../encode.sh. Usage: publish.sh <raw dir from capture.sh>
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
raw=$(cd "$1" && pwd)
waltz=${WALTZ_DIR:-$HOME/waltz-ide}
out=$here/../../../public/stories/waltz
stage=$(mktemp -d)
trap 'rm -rf "$stage"' EXIT
mkdir -p "$stage/clips" "$stage/stills"

# raw name -> gallery name
cp "$raw/announce.mov" "$stage/clips/announce.mov"
cp "$raw/agents.mov" "$stage/clips/agents-live.mov"
cp "$raw/needs-you.mov" "$stage/clips/needs-you.mov"
cp "$raw/thread-light.png" "$stage/stills/thread.png"
cp "$raw/task-panel-light.png" "$stage/stills/task.png"
cp "$raw/agents-light.png" "$stage/stills/agents-chart.png"
cp "$raw/needs-you-light.png" "$stage/stills/questions.png"
cp "$raw/setup-autonomy-light.png" "$stage/stills/setup.png"
cp "$raw/tasks-dark.png" "$stage/stills/tasks-dark.png"
# The logo from the brand kit, ink on the brand's paper, in the stills' 16:10 frame.
ffmpeg -loglevel error -y -f lavfi -i "color=c=0xF7F6F3:s=2560x1600" -i "$waltz/brand/logo/waltz-logo-ink.png" \
  -filter_complex "[1]scale=1100:-1[l];[0][l]overlay=(W-w)/2:(H-h)/2" -frames:v 1 "$stage/stills/logo.png"

WIDTH=1280 "$here/../encode.sh" "$stage/clips" "$out" >/dev/null
WIDTH=1600 "$here/../encode.sh" "$stage/stills" "$out" >/dev/null
# encode.sh takes each poster from the first frame; announce opens on the empty feed, so its poster
# is its last frame (the thread with Waltz's reply) instead.
ffmpeg -loglevel error -y -sseof -0.2 -i "$out/announce.mp4" -frames:v 1 -update 1 -q:v 4 "$out/announce.jpg"
ls -la "$out"; du -sh "$out"
