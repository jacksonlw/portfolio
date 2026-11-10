#!/usr/bin/env bash
# Captures raw portfolio media of The Cratest (~/cratest) in the iOS Simulator.
#
#   scripts/recordings/cratest/capture.sh OUT_DIR [test1Onboarding test2Deck ...]
#
# Copies ZZPortfolioCaptureUITests.swift into the app's UI test target (temporarily), starts the
# UI-test API on 8110 and a read-only artwork server on 8080, cleans the status bar, builds with
# the local API URL on the command line (no xcconfig edits), runs each test while a watcher
# answers its screenshot/recording requests with simctl, then deletes the test file and stops
# the servers. Raw .png/.mov land in OUT_DIR. See README.md.
set -euo pipefail

OUT="${1:?usage: capture.sh OUT_DIR [test names...]}"
shift || true
TESTS=("$@")
[[ ${#TESTS[@]} -gt 0 ]] || TESTS=(test1Onboarding test2Deck test3Crate test4CrateDigger test5CoverStory test6ShareCard)

REPO="${CRATEST_REPO:-$HOME/cratest}"
DEVICE_NAME="${DEVICE_NAME:-iPhone 18 Pro}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_SRC="$HERE/ZZPortfolioCaptureUITests.swift"
TEST_DST="$REPO/mobile/ios/CratestUITests/ZZPortfolioCaptureUITests.swift"
WORK="$(mktemp -d "${TMPDIR:-/tmp}/cratest-capture.XXXXXX")"
CAP="$WORK/cap"; DD="$WORK/dd"
mkdir -p "$OUT" "$CAP"
OUT="$(cd "$OUT" && pwd)"

DEV="$(xcrun simctl list devices available | grep -F "    $DEVICE_NAME (" | tail -1 | sed -E 's/.*\(([0-9A-F-]{36})\).*/\1/')"
[[ -n "$DEV" ]] || { echo "no simulator named $DEVICE_NAME" >&2; exit 1; }
echo "== device $DEVICE_NAME $DEV; work dir $WORK"

PIDS=()
cleanup() {
  rm -f "$TEST_DST"
  for p in "${PIDS[@]:-}"; do [[ -n "$p" ]] && kill "$p" 2>/dev/null || true; done
  pkill -f "cratest-api-uit" 2>/dev/null || true   # the API binary ui-test-api.sh execs
  echo "== cleaned up; git status of $REPO:"
  git -C "$REPO" status --short
}
trap cleanup EXIT

echo "== git status before (should be unchanged after):"
git -C "$REPO" status --short

cp "$TEST_SRC" "$TEST_DST"

# API for the tests (unattested guests, no rate limits, today's Games puzzles).
"$REPO/mobile/ios/scripts/ui-test-api.sh" --port 8110 >"$WORK/api.log" 2>&1 &
PIDS+=($!)
# Artwork URLs in the dev database are absolute http://127.0.0.1:8080/media/...: serve api/data read-only.
python3 -m http.server 8080 --bind 127.0.0.1 --directory "$REPO/api/data" >"$WORK/media.log" 2>&1 &
PIDS+=($!)

xcrun simctl boot "$DEV" 2>/dev/null || true
xcrun simctl bootstatus "$DEV" -b >/dev/null
xcrun simctl ui "$DEV" appearance light
xcrun simctl status_bar "$DEV" override --time 9:41 --batteryState charged --batteryLevel 100 --cellularBars 4 --wifiBars 3

XCB=(xcodebuild -project "$REPO/mobile/ios/Cratest.xcodeproj" -scheme Cratest
     -destination "platform=iOS Simulator,id=$DEV" -derivedDataPath "$DD"
     "CRATEST_API_BASE_URL=http://127.0.0.1:8110")
echo "== building (log $WORK/build.log)"
"${XCB[@]}" build-for-testing >"$WORK/build.log" 2>&1

echo "== waiting for the API"
for _ in $(seq 1 180); do
  curl -sf -o /dev/null 'http://127.0.0.1:8110/v1/catalog/albums?limit=1' && break
  sleep 2
done
curl -sf -o /dev/null 'http://127.0.0.1:8110/v1/catalog/albums?limit=1' || { echo "API never came up; see $WORK/api.log" >&2; exit 1; }

# Watcher: answers the test's marker files (req-shot-X, req-recstart-X, req-recstop-X) with simctl.
watch() {
  while true; do
    for req in "$CAP"/req-*; do
      [[ -e "$req" ]] || continue
      what="${req##*/req-}"; rm -f "$req"
      case "$what" in
        shot-*) n="${what#shot-}"; xcrun simctl io "$DEV" screenshot "$OUT/$n.png" >/dev/null 2>&1; echo "  shot $n" ;;
        recstart-*) n="${what#recstart-}"; rm -f "$OUT/$n.mov"
          xcrun simctl io "$DEV" recordVideo --codec h264 --force "$OUT/$n.mov" >"$CAP/rec-$n.log" 2>&1 &
          echo $! >"$CAP/pid-$n"; sleep 1.5; echo "  recording $n" ;;
        recstop-*) n="${what#recstop-}"; p="$(cat "$CAP/pid-$n")"; kill -INT "$p"
          while kill -0 "$p" 2>/dev/null; do sleep 0.1; done; echo "  stopped $n" ;;
      esac
      touch "$CAP/ack-$what"
    done
    sleep 0.1
  done
}
watch &
PIDS+=($!)

for t in "${TESTS[@]}"; do
  echo "== $t"
  TEST_RUNNER_CAPTURE_DIR="$CAP" TEST_RUNNER_CRATEST_API_BASE_URL="http://127.0.0.1:8110" \
    "${XCB[@]}" test-without-building -only-testing "CratestUITests/ZZPortfolioCaptureUITests/$t" >"$WORK/$t.log" 2>&1 \
    && echo "  passed" || echo "  FAILED (see $WORK/$t.log)"
done

echo "== raw output in $OUT"
ls -la "$OUT"
