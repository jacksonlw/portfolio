#!/usr/bin/env bash
# Shoots the portfolio's stills and clips of Waltz (~/waltz-ide) on its own E2E setup.
# Usage: capture.sh <raw out dir> [announce|agents|needs-you ...]
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
waltz=${WALTZ_DIR:-$HOME/waltz-ide}
out=$(mkdir -p "$1" && cd "$1" && pwd)
shift
spec=$waltz/tests/e2e/zz-portfolio-capture.spec.ts

echo "git status before:"; git -C "$waltz" status --short
cleanup() { rm -f "$spec"; echo "git status after:"; git -C "$waltz" status --short; }
trap cleanup EXIT
cp "$here/capture.spec.ts" "$spec"

grep=()
if [ $# -gt 0 ]; then grep=(-g "(^| )($(IFS='|'; echo "$*"))\$"); fi
(cd "$waltz" && PATH="$HOME/.cargo/bin:$PATH" WALTZ_CAPTURE_OUT="$out" \
  pnpm exec playwright test -c tests/e2e/playwright.config.ts zz-portfolio-capture ${grep[@]+"${grep[@]}"})

# Each clip's frames, held for as long as the screen showed them, at a constant 60 fps (the JPEG
# frames are full-range; the video is the usual limited range, so players show the same colours).
for d in "$out"/*.frames; do
  [ -d "$d" ] || continue
  n=$(basename "$d" .frames)
  ffmpeg -loglevel error -y -f concat -safe 0 -i "$d/list.ffconcat" \
    -vf "fps=60,scale=in_range=full:out_range=tv,format=yuv420p" -color_range tv \
    -c:v libx264 -preset slow -crf 12 -an "$out/$n.mov"
  echo "$n.mov: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out/$n.mov") s, $(ls "$d" | grep -c jpg) frames"
done
ls -la "$out"
