#!/usr/bin/env python3
"""Build the reel's three audio stems into ./assets:

  voiceover.wav  the ElevenLabs take, cut into its 8 lines and placed on each scene
  music.wav      an original 100 BPM score composed in code (no licensing risk)
  sfx.wav        small sounds synced to the on-screen animations

Usage: python3 scripts/build_audio.py <voiceover_take.mp3>
Remotion picks the stems up automatically and ducks the music under the voice.
"""
import subprocess
import sys
import wave

import numpy as np

SR = 48000
DUR = 45.0
N = int(SR * DUR)
rng = np.random.default_rng(11)

# Voiceover lines: (source start, source end, tempo, destination start) in seconds.
# Source times come from the pauses in the single ElevenLabs take.
VO_LINES = [
    (0.00, 4.10, 1.04, 0.10),
    (5.70, 9.50, 1.00, 4.30),
    (11.10, 17.05, 1.00, 10.30),
    (18.70, 23.78, 1.04, 17.05),
    (25.80, 32.25, 1.00, 22.35),
    (33.95, 38.65, 1.00, 30.35),
    (40.45, 43.95, 1.00, 36.35),
    (46.00, 50.92, 1.08, 40.35),
]


def build_voiceover(src, out):
    parts, labels = [], []
    for i, (a, b, tempo, dest) in enumerate(VO_LINES):
        chain = f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS"
        if tempo != 1.0:
            chain += f",atempo={tempo}"
        chain += f",afade=t=in:d=0.03,afade=t=out:st={(b - a) / tempo - 0.06:.3f}:d=0.06,adelay={int(dest * 1000)}:all=1[v{i}]"
        parts.append(chain)
        labels.append(f"[v{i}]")
    graph = ";".join(parts) + ";" + "".join(labels) + f"amix=inputs={len(labels)}:normalize=0,apad,atrim=0:{DUR},aresample={SR},aformat=channel_layouts=stereo[out]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-filter_complex", graph, "-map", "[out]", "-c:a", "pcm_s16le", out], check=True)


# ---------- synthesis helpers ----------

def note(name):
    names = {'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11}
    return 440.0 * 2 ** ((names[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)


def place(buf, start, sig, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N or i + len(sig) <= 0:
        return
    sig = sig[: N - i]
    buf[0, i:i + len(sig)] += sig * gain * (1 - max(pan, 0))
    buf[1, i:i + len(sig)] += sig * gain * (1 + min(pan, 0))


def env(n, a, d, s, r, sustain_len):
    e = np.zeros(n)
    na, nd, ns = int(a * SR), int(d * SR), int(sustain_len * SR)
    e[:na] = np.linspace(0, 1, na, endpoint=False)
    e[na:na + nd] = np.linspace(1, s, nd, endpoint=False)
    e[na + nd:na + nd + ns] = s
    rest = n - (na + nd + ns)
    if rest > 0:
        e[na + nd + ns:] = s * np.exp(-np.arange(rest) / (r * SR))
    return e


def epiano(f, length, vel=1.0):
    n = int((length + 1.2) * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f * t) + 0.32 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 6)
    tone *= 1 + 0.04 * np.sin(2 * np.pi * 4.5 * t)
    return vel * tone * env(n, 0.006, 0.4, 0.45, 0.35, length)


def pad(f, length):
    n = int((length + 1.0) * SR)
    t = np.arange(n) / SR
    tone = sum(np.sin(2 * np.pi * f * d * t + k) for k, d in enumerate((0.997, 1.0, 1.003)))
    tone += 0.3 * np.sin(2 * np.pi * 2 * f * t)
    return tone / 3.3 * env(n, 0.5, 0.3, 0.8, 0.5, length)


def pluck(f):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(2 * np.pi * 3 * f * t)) * np.exp(-t * 14)


def bass(f, length):
    n = int((length + 0.2) * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)
    return tone * env(n, 0.01, 0.15, 0.7, 0.08, length)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t * 32)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def noise_burst(length, decay, lo, hi):
    n = int(length * SR)
    spec = np.fft.rfft(rng.standard_normal(n))
    fr = np.fft.rfftfreq(n, 1 / SR)
    spec[(fr < lo) | (fr > hi)] = 0
    s = np.fft.irfft(spec, n)
    s /= np.abs(s).max() + 1e-9
    return s * np.exp(-np.arange(n) / SR * decay)


def riser(length, lo=300, hi=6000):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = t / length
    s = noise_burst(length, 0, lo, hi) * x ** 2
    s += 0.3 * np.sin(2 * np.pi * np.cumsum(200 + 1400 * x ** 2) / SR) * x ** 2
    return s


def swell(length):
    n = int(length * SR)
    s = noise_burst(length, 0, 2000, 12000)
    return s * np.sin(np.pi * np.arange(n) / n) ** 2


def build_music(out):
    m = np.zeros((2, N))
    bpm = 100
    beat = 60 / bpm
    bar = 4 * beat
    bright = [('D', ['D4', 'F#4', 'A4', 'D5'], 'D2'), ('A', ['C#4', 'E4', 'A4', 'E5'], 'A1'),
              ('Bm', ['D4', 'F#4', 'B4', 'D5'], 'B1'), ('G', ['D4', 'G4', 'B4', 'D5'], 'G1')]
    tense = [('Bm', ['D4', 'F#4', 'B4', 'D5'], 'B1'), ('G', ['D4', 'G4', 'B4', 'D5'], 'G1'),
             ('Em', ['E4', 'G4', 'B4', 'E5'], 'E2'), ('F#', ['C#4', 'F#4', 'A#4', 'C#5'], 'F#1')]

    def section(start, end, prog, keys=0.18, pads=0.10, arp=0.0, drums=0, basses=0.0, claps=False):
        t0, k = start, 0
        while t0 < end - 0.05:
            name, chord, root = prog[k % len(prog)]
            length = min(bar, end - t0)
            for p in chord:
                place(m, t0, pad(note(p), length), pads / 4, pan=0.0)
            for b in range(4):
                bt = t0 + b * beat
                if bt >= end:
                    break
                if b in (0, 2):
                    for j, p in enumerate(chord[:3]):
                        place(m, bt + j * 0.012, epiano(note(p), beat * 1.6, 0.8 if b == 0 else 0.6), keys / 3, pan=-0.2 + 0.2 * j)
                if arp:
                    for e in range(2):
                        at = bt + e * beat / 2
                        if at < end:
                            place(m, at, pluck(note(chord[(b * 2 + e) % 4][:-1] + str(int(chord[(b * 2 + e) % 4][-1]) + 1))), arp, pan=0.35 if e else -0.35)
                if drums and (b in (0, 2) or drums > 1 and b == 3 and k % 2 == 1):
                    place(m, bt, kick(), 0.55)
                if drums:
                    for e in range(2):
                        place(m, bt + e * beat / 2, noise_burst(0.06, 70, 6000, 14000), 0.05 if e else 0.03, pan=0.3)
                if claps and b in (1, 3):
                    place(m, bt, noise_burst(0.18, 22, 800, 5000), 0.13)
                if basses:
                    place(m, bt, bass(note(root), beat * 0.9), basses)
            t0 += bar
            k += 1

    # 0-4 hook: keys and arp only, a riser into the first cut
    section(0.0, 4.0, bright, keys=0.16, pads=0.08, arp=0.05)
    place(m, 2.4, riser(1.6), 0.10)
    # 4-17 groove in: kick, shaker, bass
    section(4.0, 17.0, bright, keys=0.15, pads=0.08, arp=0.035, drums=1, basses=0.12)
    # 17-22 DOL: add claps for lift
    section(17.0, 22.0, bright, keys=0.15, pads=0.08, arp=0.035, drums=2, basses=0.12, claps=True)
    # 22-30 financial leverage: minor turn, no arp, heavier low end
    section(22.0, 30.0, tense, keys=0.14, pads=0.11, drums=1, basses=0.15)
    place(m, 29.0, riser(1.0), 0.09)
    # 30-36 total leverage: full build
    section(30.0, 36.0, bright, keys=0.16, pads=0.09, arp=0.045, drums=2, basses=0.13, claps=True)
    place(m, 35.2, riser(0.8), 0.08)
    # 36-41 takeaway: reflective, keys and pad only
    section(36.0, 41.0, bright, keys=0.15, pads=0.10, arp=0.02)
    # 41-45 CTA: bright resolve on D with a swell, ringing out to the end
    for p in ['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']:
        place(m, 41.0, epiano(note(p), 3.4, 0.9), 0.07)
        place(m, 41.0, pad(note(p), 3.6), 0.03)
    place(m, 41.0, bass(note('D2'), 3.5), 0.14)
    place(m, 41.0, kick(), 0.6)
    place(m, 40.4, swell(1.2), 0.06)
    for j, p in enumerate(['D5', 'F#5', 'A5', 'D6']):
        place(m, 42.0 + j * 0.3, pluck(note(p)), 0.05)
    fade = np.ones(N)
    fade[-int(0.6 * SR):] = np.linspace(1, 0.25, int(0.6 * SR))
    write(out, m * fade)


def build_sfx(out):
    s = np.zeros((2, N))
    tick = lambda f, d=40: (lambda n: np.sin(2 * np.pi * f * np.arange(n) / SR) * np.exp(-np.arange(n) / SR * d))(int(0.25 * SR))
    whoosh = lambda length=0.35: swell(length)
    # hook: bars grow, "How?" lands
    for k, t in enumerate(np.arange(0.5, 2.6, 0.15)):
        place(s, t, tick(900 + 90 * k, 55), 0.04)
    place(s, 2.6, tick(1760, 18), 0.10)
    # fixed costs: cards slide in, the stamp lands
    for t in (4.7, 5.6, 6.5):
        place(s, t - 0.1, whoosh(0.3), 0.07)
    place(s, 7.9, kick() * 0.8, 0.35); place(s, 7.9, tick(1320, 20), 0.07)
    # operating leverage: up whoosh, rising arrows; down panel, falling arrows
    place(s, 10.4, whoosh(0.35), 0.07)
    sweep = lambda f0, f1, length: (lambda t: np.sin(2 * np.pi * np.cumsum(f0 * (f1 / f0) ** (t / length)) / SR) * np.sin(np.pi * t / length))(np.arange(int(length * SR)) / SR)
    place(s, 11.25, sweep(400, 1400, 0.45), 0.07)
    place(s, 12.6, whoosh(0.35), 0.07)
    place(s, 13.45, sweep(1100, 180, 0.55), 0.08)
    # DOL: typing, then the count to 3
    for t in np.arange(17.42, 18.8, 0.075):
        place(s, t, noise_burst(0.02, 200, 2000, 8000), 0.035, pan=rng.uniform(-0.3, 0.3))
    place(s, 19.0, whoosh(0.3), 0.06)
    for k, t in enumerate((19.75, 20.2, 20.65)):
        place(s, t, tick(1046 + 200 * k, 22), 0.08)
    # financial leverage: icons, the chain, a low warning on "higher financial risk"
    for t in (22.4, 23.0):
        place(s, t - 0.1, whoosh(0.3), 0.06)
    place(s, 24.0, tick(660, 18), 0.08)
    place(s, 25.15, tick(587, 18), 0.08)
    place(s, 26.3, sweep(330, 220, 0.6), 0.11)
    # total leverage: each node lights up on a rising note, formula hit
    for k, t in enumerate((30.5, 31.45, 32.4)):
        place(s, t, tick((1175, 1480, 1760)[k], 14), 0.09)
    place(s, 33.3, kick() * 0.8, 0.35); place(s, 33.3, tick(2349, 16), 0.06)
    place(s, 34.4, whoosh(0.3), 0.05)
    # takeaway: a check chime per line
    for t in (36.85, 38.05, 39.25):
        place(s, t, tick(1568, 16), 0.08); place(s, t + 0.07, tick(2093, 16), 0.06)
    # CTA: the button pops
    place(s, 41.9, tick(1760, 14), 0.09); place(s, 41.95, tick(2637, 14), 0.06)
    write(out, s)


def write(path, buf):
    buf = buf / max(1.0, np.abs(buf).max() / 0.95)
    pcm = (np.clip(buf.T, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


if __name__ == "__main__":
    build_voiceover(sys.argv[1], "assets/voiceover.wav")
    build_music("assets/music.wav")
    build_sfx("assets/sfx.wav")
    print("wrote assets/voiceover.wav, assets/music.wav, assets/sfx.wav")
