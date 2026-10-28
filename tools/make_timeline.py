#!/usr/bin/env python3
"""Build timeline.json for reel 07-fix from measured audio durations.

Usage:
  python3 tools/make_timeline.py             # ffprobe audio/01.mp3..07.mp3, write timeline.json
  python3 tools/make_timeline.py --estimate  # use the script's planned durations, print only

Rules (from the brief):
  shot = audio duration + holdAfter, minimum 4.0s, never under 3s
  the reframe line holds 2.0s of silence on the same photo
  total 32-40.5s including the 3s end card
  line 1's voice starts LEAD_IN after the cut, so the first frames are text-free (thumbnail)
"""
import json
import subprocess
import sys

MIN_SHOT = 4.0
END_CARD = 3.0
REFRAME_LINE = 6
REFRAME_EXTRA_HOLD = 2.0
LEAD_IN = 0.5
MAX_TOTAL = 40.5

# line, speaker, photo, planned audio seconds (script sec minus pause), pause after.
PLAN = [
    (1, "Rajesh", 1, 4.2, 0.8),
    (2, "Rajesh", 2, 5.3, 0.7),
    (3, "Rajesh", 3, 3.0, 1.0),
    (4, "Rajesh", 4, 6.2, 0.8),
    (5, "Rajesh", 5, 3.0, 1.0),
    (6, "Meera",  6, 5.0, 0.0),  # reframe: photo holds through the 2s silence
    (7, "Rajesh", 8, 3.5, 0.5),
]

# Camera: alternate a 4% push-in with a 3% horizontal drift, flipping drift
# direction each time. One axis per shot, never more than 5%.
PUSH = 0.04
DRIFT = 0.03


def camera(i):
    if i % 2 == 0:
        return {"move": "push", "scale": 1.00, "x": 0.0}, {"move": "push", "scale": 1.0 + PUSH, "x": 0.0}
    direction = 1 if (i // 2) % 2 == 0 else -1
    return ({"move": "drift", "scale": 1.00, "x": -direction * DRIFT / 2},
            {"move": "drift", "scale": 1.00, "x": direction * DRIFT / 2})


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def build(estimate):
    t = 0.0
    rows = []
    for i, (line, speaker, photo, planned, pause) in enumerate(PLAN):
        cam_in, cam_out = camera(i)
        audio = f"audio/{line:02d}.mp3"
        dur = planned if estimate else probe(audio)
        hold = pause + (REFRAME_EXTRA_HOLD if line == REFRAME_LINE else 0.0)
        offset = LEAD_IN if i == 0 else 0.0
        shot = max(offset + dur + hold, MIN_SHOT)
        hold = round(shot - offset - dur, 2)  # padding to the minimum goes into the hold
        rows.append({
            "line": line, "speaker": speaker, "audio": audio, "audioDuration": round(dur, 2),
            "photo": photo, "cameraIn": cam_in, "cameraOut": cam_out,
            "start": round(t, 2), "end": round(t + shot, 2), "audioStart": round(t + offset, 2),
            "holdAfter": hold,
        })
        t += shot
    return rows, t


def main():
    estimate = "--estimate" in sys.argv
    rows, total = build(estimate)
    with_card = total + END_CARD
    if not estimate:
        if not 32.0 <= with_card <= MAX_TOTAL:
            sys.exit(f"Total {with_card:.2f}s (with end card) is outside 32-40.5s; not writing timeline.json")
        with open("timeline.json", "w") as f:
            json.dump(rows, f, indent=2)
    print("| Line | Audio | Dur | Photo | Camera in → out | Start | End | Hold |")
    print("|---|---|---|---|---|---|---|---|")
    for r in rows:
        ci, co = r["cameraIn"], r["cameraOut"]
        if ci["move"] == "push":
            cam = f'push {ci["scale"]:.2f} → {co["scale"]:.2f}'
        else:
            cam = f'drift x {ci["x"]:+.3f} → {co["x"]:+.3f}'
        print(f'| {r["line"]} | {r["audio"]} | {r["audioDuration"]:.2f} | {r["photo"]} | {cam} | '
              f'{r["start"]:.2f} | {r["end"]:.2f} | {r["holdAfter"]:.2f} |')
    print(f"\nShots {total:.2f}s + end card {END_CARD:.0f}s = {with_card:.2f}s"
          + (" (ESTIMATE, not measured)" if estimate else ""))


if __name__ == "__main__":
    main()
