#!/usr/bin/env python3
"""Mix the dialogue, the ElevenLabs music cue (only after 30 s) and SFX into assets/equity/mix.wav at -14 LUFS.
   python3 scripts/mix.py
"""
import json
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import audio as A  # helpers: decode, write_wav, loudnorm, ebur128, integrated, synth_sfx

ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, "..", "assets")
SR = A.SR


def config():
    out = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", os.path.join(HERE, "dump-config.ts")], cwd=ROOT,
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def main():
    cfg = config()
    T, S, AU, M = cfg["TIMINGS"]["anchors"], cfg["SCENES"], cfg["AUDIO"], cfg["MEDIA"]
    total = int(cfg["DURATION_S"] * SR)
    t = np.arange(total) / SR

    # Dialogue, levelled on its own first so the voice sits at -14 LUFS.
    vo_n = os.path.join(ASSETS, "equity", ".vo_norm.wav")
    A.loudnorm(os.path.join(ASSETS, M["dialogue"]), vo_n, AU["voLufs"], AU["truePeak"] - 0.5,
               pre="highpass=f=70", extra=["-ac", "1"])
    vo = A.decode(vo_n)[:total]
    os.remove(vo_n)
    out = np.zeros((total, 2), np.float32)
    out[:len(vo)] += vo

    # Music: only from AUDIO.musicStart, faded in, sitting at -24 LUFS under Meera's last line.
    mu = A.decode(os.path.join(ASSETS, M["music"]))
    s0 = int(AU["musicStart"] * SR)
    mu = mu[: total - s0]
    gain = 10 ** ((AU["musicUnderVoiceLufs"] - A.integrated(mu)) / 20)
    tm = np.arange(len(mu)) / SR
    env = np.clip(tm / 0.8, 0, 1) * np.clip((len(mu) / SR - tm) / 0.6, 0, 1)
    out[s0:s0 + len(mu)] += mu * (gain * env)[:, None]

    fx = A.synth_sfx()
    g = 10 ** (AU["sfxDb"] / 20)
    cues = [("whoosh", 0.0, 0.6), ("tick", T["pct"], 0.8), ("pop", T["note1"], 0.7), ("pop", T["note2"], 0.7), ("pop", T["note3"], 0.7),
            ("stamp", T["six"], 0.7), ("whoosh", S["pie"][0], 0.5), ("tick", T["pie"], 0.8), ("tick", T["oneCr"], 0.8),
            ("whoosh", S["compare"][0], 0.5), ("pop", T["eight"], 0.7), ("drop", T["stake"], 0.9), ("bell", T["R3"] + 0.1, 0.5),
            ("whoosh", S["reframe"][0], 0.5), ("whoosh", S["cta"][0], 0.4), ("pop", T["price"], 0.6), ("bell", T["keyword"], 0.6)]
    cues += [("tick", T["every"] - 0.2 + i * 0.05, 0.35) for i in range(10)]
    for name, at, lvl in cues:
        s = int(at * SR)
        a = fx[name][: max(0, total - s)]
        out[s:s + len(a)] += a * g * lvl

    dst = os.path.join(ASSETS, M["mix"])
    tmp = dst + ".raw.wav"
    A.write_wav(tmp, out)
    A.loudnorm(tmp, dst, AU["voLufs"], AU["truePeak"] - 0.5, extra=["-ac", "2"])
    os.remove(tmp)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", dst, "-t", str(cfg["DURATION_S"]), "-c:a", "pcm_s24le", dst + ".t.wav"], check=True)
    os.replace(dst + ".t.wav", dst)
    r = A.ebur128(dst)
    print(f"mix.wav {A.duration(dst):.3f}s  I {r['I']} LUFS  LRA {r['LRA']} LU  true peak {r['TP']} dBFS")


if __name__ == "__main__":
    main()
