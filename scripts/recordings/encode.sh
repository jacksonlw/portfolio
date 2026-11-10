#!/usr/bin/env bash
# Turns raw captures (.mov clips, .png stills) into the web sizes a Story's gallery uses:
# muted H.264 .mp4 clips with a .jpg poster, and .webp stills, 660px wide (a phone screen at
# about 3x its size in the gallery). Usage: encode.sh <raw dir> <public/stories/<slug> dir>
set -euo pipefail
raw=$1 out=$2 width=${WIDTH:-660}
mkdir -p "$out"
for v in "$raw"/*.mov; do
  [ -e "$v" ] || continue
  n=$(basename "$v" .mov)
  ffmpeg -loglevel error -y -i "$v" -vf "scale=$width:-2,fps=30" -c:v libx264 -profile:v high \
    -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart -an "$out/$n.mp4"
  ffmpeg -loglevel error -y -i "$out/$n.mp4" -frames:v 1 -q:v 4 "$out/$n.jpg"
done
tmp=$(mktemp -d)
for s in "$raw"/*.png; do
  [ -e "$s" ] || continue
  n=$(basename "$s" .png)
  ffmpeg -loglevel error -y -i "$s" -vf "scale=$width:-2" "$tmp/$n.png"
  cwebp -quiet -q 82 "$tmp/$n.png" -o "$out/$n.webp"
done
rm -rf "$tmp"
ls -la "$out"
