#!/usr/bin/env python3
"""Build timeline.json for reel 07-fix from measured audio durations.

Usage:
  python3 tools/make_timeline.py             # ffprobe audio/01.mp3..07.mp3, write timeline.json
  python3 tools/make_timeline.py --estimate  # use the script's planned durations, print only

Rules (from the brief):
  shot = audio duration + holdAfter, minimum 4.0s, never under 3s
  the reframe line holds 2.0s of silence on the same photo
  total 32-40s including the 3s end card
"""
import json
import subprocess
import sys

MIN_SHOT = 4.0
END_CARD = 3.0
REFRAME_LINE = 6
REFRAME_EXTRA_HOLD = 2.0

# line, speaker, photo, planned audio seconds (script sec minus pause), pause after, camera in/out
# Camera states: scale, then the frame centre as a fraction of width and height.
PLAN = [
    (1, "Rajesh", 1, 4.2, 0.8, {"scale": 1.00, "x": 0.50, "y": 0.50}, {"scale": 1.10, "x": 0.62, "y": 0.58}),  # push-in to cold chai
    (2, "Rajesh", 2, 5.3, 0.7, {"scale": 1.15, "x": 0.30, "y": 0.50}, {"scale": 1.15, "x": 0.70, "y": 0.50}),  # pan L->R, stop on "140"
    (3, "Rajesh", 3, 3.0, 1.0, {"scale": 1.20, "x": 0.50, "y": 0.50}, {"scale": 1.00, "x": 0.50, "y": 0.50}),  # hold 2s, then pull-out
    (4, "Rajesh", 4, 6.2, 0.8, {"scale": 1.00, "x": 0.50, "y": 0.50}, {"scale": 1.12, "x": 0.50, "y": 0.45}),  # push-in to calculator
    (5, "Rajesh", 5, 3.0, 1.0, {"scale": 1.15, "x": 0.50, "y": 0.70}, {"scale": 1.15, "x": 0.50, "y": 0.30}),  # tilt up racks
    (6, "Meera",  6, 5.0, 0.0, {"scale": 1.00, "x": 0.50, "y": 0.50}, {"scale": 1.02, "x": 0.50, "y": 0.50}),  # 2% drift, held through silence
    (7, "Rajesh", 8, 3.5, 0.5, {"scale": 1.12, "x": 0.50, "y": 0.50}, {"scale": 1.00, "x": 0.50, "y": 0.50}),  # pull-out wide on desk
]


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True, check=True,
    )
    return float(out.stdout.strip())


def build(estimate):
    t = 0.0
    rows = []
    for line, speaker, photo, planned, pause, cam_in, cam_out in PLAN:
        audio = f"audio/{line:02d}.mp3"
        dur = planned if estimate else probe(audio)
        hold = pause + (REFRAME_EXTRA_HOLD if line == REFRAME_LINE else 0.0)
        shot = max(dur + hold, MIN_SHOT)
        hold = round(shot - dur, 2)  # padding to the minimum goes into the hold
        rows.append({
            "line": line, "speaker": speaker, "audio": audio, "audioDuration": round(dur, 2),
            "photo": photo, "cameraIn": cam_in, "cameraOut": cam_out,
            "start": round(t, 2), "end": round(t + shot, 2), "holdAfter": hold,
        })
        t += shot
    return rows, t


def main():
    estimate = "--estimate" in sys.argv
    rows, total = build(estimate)
    with_card = total + END_CARD
    if not estimate:
        if not 32.0 <= with_card <= 40.0:
            sys.exit(f"Total {with_card:.2f}s (with end card) is outside 32-40s; not writing timeline.json")
        with open("timeline.json", "w") as f:
            json.dump(rows, f, indent=2)
    print("| Line | Audio | Dur | Photo | Camera in → out | Start | End | Hold |")
    print("|---|---|---|---|---|---|---|---|")
    for r in rows:
        ci, co = r["cameraIn"], r["cameraOut"]
        cam = f'{ci["scale"]:.2f}@({ci["x"]},{ci["y"]}) → {co["scale"]:.2f}@({co["x"]},{co["y"]})'
        print(f'| {r["line"]} | {r["audio"]} | {r["audioDuration"]:.2f} | {r["photo"]} | {cam} | '
              f'{r["start"]:.2f} | {r["end"]:.2f} | {r["holdAfter"]:.2f} |')
    print(f"\nShots {total:.2f}s + end card {END_CARD:.0f}s = {with_card:.2f}s"
          + (" (ESTIMATE, not measured)" if estimate else ""))


if __name__ == "__main__":
    main()
