#!/usr/bin/env python3
"""Cut the two ElevenLabs takes (Rajesh, Meera) into one dialogue track and write every
event time into the TIMINGS block of src/config.ts.

  python3 scripts/build_dialogue.py [--tempo 1.05]

Inputs:  assets/equity/takes/{rajesh_a,meera_a}.mp3 and words.json (Whisper word timestamps)
Output:  assets/equity/vo_dialogue.wav (48 kHz mono, not yet loudness-normalised)

Long pauses inside a line are shortened to MAX_GAP; lines are joined with LINE_GAP between
speakers; the turn ("So... I give away less.") is followed by exactly TURN_SILENCE of silence.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
TAKES = os.path.join(ROOT, "..", "assets", "equity", "takes")
OUT = os.path.join(ROOT, "..", "assets", "equity", "vo_dialogue.wav")
CONFIG_TS = os.path.join(ROOT, "src", "config.ts")
SR = 48000

LEAD_IN = 0.35
LINE_GAP = 0.28
MAX_GAP = 0.3
TURN_SILENCE = 2.16  # 2.0 s after the 1.08x tempo
TAIL = 0.6

# (line id, take, start s, end s) in the order spoken, from words.json.
LINES = [
    ("R1", "rajesh_a", 0.00, 2.94),
    ("M1", "meera_a", 0.00, 8.54),
    ("R2", "rajesh_a", 4.12, 6.52),
    ("M2", "meera_a", 10.22, 14.56),
    ("M3", "meera_a", 15.96, 23.26),
    ("R3", "rajesh_a", 7.78, 9.38),
    ("M4", "meera_a", 24.30, 27.90),
    ("M5", "meera_a", 29.28, 37.30),
]
TURN_LINE = "R3"

# Word anchors: key -> (line id, regex on the Whisper word). First match in that line.
WORD_ANCHORS = {
    "pct": ("R1", r"^25"),
    "note1": ("M1", r"^book"),
    "note2": ("M1", r"^no$"),
    "note3": ("M1", r"^everything"),
    "six": ("M1", r"^six"),
    "pie": ("R2", r"^25"),
    "four": ("M2", r"^four"),
    "oneCr": ("M2", r"^one"),
    "every": ("M2", r"^every"),
    "eight": ("M3", r"^eight"),
    "same": ("M3", r"^same"),
    "stake": ("M3", r"^18"),
    "equity": ("M4", r"^equity"),
    "price": ("M5", r"^from"),
    "keyword": ("M5", r"^comment"),
}


def decode(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", "1", "-ar", str(SR), "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def main():
    tempo = float(sys.argv[sys.argv.index("--tempo") + 1]) if "--tempo" in sys.argv else 1.0
    words = json.load(open(os.path.join(TAKES, "words.json")))
    audio = {k: decode(os.path.join(TAKES, f"{k}.mp3")) for k in ("rajesh_a", "meera_a")}

    out = [np.zeros(int(LEAD_IN * SR), np.float32)]
    t = LEAD_IN
    anchors = {}
    for n, (lid, take, a, b) in enumerate(LINES):
        ws = [w for w in words[take] if w[0] >= a - 0.01 and w[1] <= b + 0.01]
        # Pieces of the line, splitting long pauses so they shrink to MAX_GAP.
        pieces, cur = [], [ws[0]]
        for w in ws[1:]:
            if w[0] - cur[-1][1] > MAX_GAP + 0.1:
                pieces.append(cur)
                cur = [w]
            else:
                cur.append(w)
        pieces.append(cur)
        anchors[lid] = round(t, 3)
        for i, pc in enumerate(pieces):
            s0 = max(0.0, pc[0][0] - (0.06 if i == 0 else MAX_GAP / 2))
            s1 = pc[-1][1] + (0.14 if i == len(pieces) - 1 else MAX_GAP / 2)
            seg = audio[take][int(s0 * SR):int(s1 * SR)].copy()
            f = int(0.008 * SR)
            seg[:f] *= np.linspace(0, 1, f)
            seg[-f:] *= np.linspace(1, 0, f)
            for w in pc:  # map each word to output time
                for key, (al, pat) in WORD_ANCHORS.items():
                    if al == lid and key not in anchors and re.match(pat, w[2].lower().strip(",.'\"")):
                        anchors[key] = round(t + (w[0] - s0), 3)
            out.append(seg)
            t += len(seg) / SR
        anchors[f"{lid}.end"] = round(t, 3)
        gap = TURN_SILENCE if lid == TURN_LINE else LINE_GAP
        if n < len(LINES) - 1:
            out.append(np.zeros(int(gap * SR), np.float32))
            t += gap
    out.append(np.zeros(int(TAIL * SR), np.float32))
    t += TAIL
    y = np.concatenate(out)

    missing = [k for k in WORD_ANCHORS if k not in anchors]
    if missing:
        sys.exit(f"STOP: anchors not found: {missing}")

    if tempo != 1.0:  # pitch-preserving speed-up; every time scales by 1/tempo
        tmp = OUT + ".pre.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", tmp], input=y.tobytes(), check=True)
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", f"atempo={tempo}", "-ar", str(SR), "-c:a", "pcm_s24le", OUT], check=True)
        os.remove(tmp)
        anchors = {k: round(v / tempo, 3) for k, v in anchors.items()}
        t /= tempo
    else:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "1", "-ar", str(SR), "-i", "-", "-c:a", "pcm_s24le", OUT],
                       input=y.tobytes(), check=True)

    anchors["end"] = round(t, 3)
    for k, v in sorted(anchors.items(), key=lambda kv: kv[1]):
        print(f"  {v:6.2f}s  {k}")
    print(f"Dialogue track {t:.2f}s (tempo {tempo})")

    block = json.dumps({"source": f"build_dialogue.py tempo {tempo}", "anchors": anchors}, indent=2)
    src = open(CONFIG_TS).read()
    new = re.sub(r"(// @timings-start\n).*?(\n// @timings-end)",
                 lambda m: m.group(1) + "export const TIMINGS: { source: string; anchors: Record<string, number> } = " + block + ";" + m.group(2),
                 src, flags=re.S)
    open(CONFIG_TS, "w").write(new)
    print("Updated TIMINGS in src/config.ts")


if __name__ == "__main__":
    main()
