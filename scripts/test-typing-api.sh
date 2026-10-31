#!/usr/bin/env bash
# Exercises the typing API: bash scripts/test-typing-api.sh [baseUrl]
set -u
B="${1:-http://localhost:3210}"
J='Content-Type: application/json'
SAMPLES=$(python3 -c 'print([80]*15)')

start() { curl -s -X POST "$B/api/typing/start" -H "$J" -H "X-Forwarded-For: $1" -d '{"mode":15,"set":"words"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["roundId"])'; }
submit() { # ip roundId name correct incorrect keystrokes elapsed samples
  curl -s -o /tmp/typing-resp.json -w "%{http_code}" -X POST "$B/api/typing/submit" -H "$J" -H "X-Forwarded-For: $1" \
    -d "{\"roundId\":\"$2\",\"name\":\"$3\",\"correct\":$4,\"incorrect\":$5,\"keystrokes\":$6,\"elapsedMs\":$7,\"samples\":$8}"
  echo " $(cat /tmp/typing-resp.json)"
}

A=$(start 10.0.0.1); B2=$(start 10.0.0.2); D=$(start 10.0.0.4); E=$(start 10.0.0.5)
G=$(start 10.0.0.7); H=$(start 10.0.0.8); I=$(start 10.0.0.9); X=$(start 10.0.0.12)

echo "J early submit          -> $(submit 10.0.0.10 "$(start 10.0.0.10)" Early 200 10 230 15000 "$SAMPLES")"
echo "waiting 16s for rounds to be old enough…"; sleep 16
echo "A valid                 -> $(submit 10.0.0.1 "$A" "Tester One" 200 10 230 15020 "$SAMPLES")"
echo "C reused round          -> $(submit 10.0.0.3 "$A" "Tester One" 200 10 230 15020 "$SAMPLES")"
echo "B tampered wpm          -> $(submit 10.0.0.2 "$B2" Cheater 350 5 360 15000 "$SAMPLES")"
echo "D profane name          -> $(submit 10.0.0.4 "$D" "fuck you" 200 10 230 15000 "$SAMPLES")"
echo "D url name              -> $(submit 10.0.0.4 "$D" "visit x.com" 200 10 230 15000 "$SAMPLES")"
echo "D empty name            -> $(submit 10.0.0.4 "$D" "   " 200 10 230 15000 "$SAMPLES")"
echo "D too long name         -> $(submit 10.0.0.4 "$D" "abcdefghijklmnopqrstuvwxyz" 200 10 230 15000 "$SAMPLES")"
echo "D zero-width name       -> $(submit 10.0.0.4 "$D" "Ze​ro Width" 180 10 210 15000 "$SAMPLES")"
echo "E elapsed off           -> $(submit 10.0.0.5 "$E" Slowpoke 200 10 230 10000 "$SAMPLES")"
echo "F unknown round         -> $(submit 10.0.0.6 "$(python3 -c 'import uuid;print(uuid.uuid4())')" Ghost 200 10 230 15000 "$SAMPLES")"
echo "G low accuracy          -> $(submit 10.0.0.7 "$G" Sloppy 100 60 170 15000 "$SAMPLES")"
echo "H wrong samples         -> $(submit 10.0.0.8 "$H" Fewer 200 10 230 15000 "[80,80,80]")"
echo "I lower score same name -> $(submit 10.0.0.9 "$I" "tester one" 150 5 160 15000 "$SAMPLES")"
echo "X impossible keystrokes -> $(submit 10.0.0.12 "$X" Robot 200 10 900 15000 "$SAMPLES")"
echo "K malformed json        -> $(curl -s -w ' %{http_code}' -X POST "$B/api/typing/submit" -H "$J" -H 'X-Forwarded-For: 10.0.0.11' -d '{oops')"
echo "rate limit (9 quick submits from one IP):"
for n in 1 2 3 4 5 6 7 8 9; do printf "%s " "$(curl -s -o /dev/null -w '%{http_code}' -X POST "$B/api/typing/submit" -H "$J" -H 'X-Forwarded-For: 10.0.0.99' -d '{}')"; done; echo
echo "leaderboard 15          -> $(curl -s "$B/api/typing/leaderboard?mode=15&set=words")"
echo "leaderboard bad mode    -> $(curl -s -w ' %{http_code}' "$B/api/typing/leaderboard?mode=45")"
