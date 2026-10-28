#!/usr/bin/env python3
"""Sound design for the "three problems" reel, in the style of the brand's reference ads:
a soft tonal drone, plinks on reveals, noise whooshes on the gold wipes, a bell chord on the ticket.

Usage: python3 tools/make_sound_problems.py build/reel-problems/sound.wav   (then mux; see scripts/02-start-problems.md)
Event times match designs/02-start-problems/index.html.
"""
import sys
import wave

import numpy as np

SR = 48000
DUR = 32.0
N = int(SR * DUR)
t_all = np.arange(N) / SR
L = np.zeros(N)
R = np.zeros(N)
rng = np.random.default_rng(7)

# E-minor colour while the problems play, lifting to A major for the first step.
E6, Fs6, Gs6, B6, Cs7, E7 = 1318.5, 1480.0, 1661.2, 1975.5, 2217.5, 2637.0


def add(start, sig, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * (1 - max(pan, 0))
    R[i:i + len(sig)] += sig * (1 + min(pan, 0))


def env_ar(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def pad(start, end, freqs, amp, fade_in, fade_out, floor=0.0):
    n = int((end - start) * SR)
    t = np.arange(n) / SR
    s_l, s_r = np.zeros(n), np.zeros(n)
    for k, f in enumerate(freqs):
        w = amp / (1 + 0.35 * k)
        s_l += w * np.sin(2 * np.pi * (f - 0.9) * t + k)
        s_r += w * np.sin(2 * np.pi * (f + 0.9) * t + 2 * k)
    lfo = 0.82 + 0.18 * np.sin(2 * np.pi * 0.22 * t)
    e = np.ones(n)
    fi, fo = int(fade_in * SR), int(fade_out * SR)
    if fi:
        e[:fi] = np.linspace(floor, 1, fi)
    if fo:
        e[-fo:] *= np.linspace(1, 0, fo)
    i = int(start * SR)
    L[i:i + n] += s_l * lfo * e
    R[i:i + n] += s_r * lfo * e


def plink(start, f, amp=0.22, decay=9.0, pan=0.0):
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * decay)
    s *= env_ar(n, 0.003, 0.05)
    add(start, amp * s, pan)


def glide(start, f0, f1, dur, amp=0.12, pan=0.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / dur)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 1.5
    add(start, amp * s, pan)


def band_noise(n, lo, hi):
    spec = np.fft.rfft(rng.standard_normal(n))
    fr = np.fft.rfftfreq(n, 1 / SR)
    shape = np.clip((fr - lo) / (lo * 0.6), 0, 1) * np.clip((hi - fr) / (hi * 0.4), 0, 1)
    out = np.fft.irfft(spec * shape, n)
    return out / (np.abs(out).max() + 1e-9)


def whoosh(center, dur=0.62, amp=0.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    lo, hi = band_noise(n, 250, 2200), band_noise(n, 1200, 7000)
    x = t / dur
    s = (lo * (1 - x) + hi * x) * np.sin(np.pi * x) ** 2
    add(center - dur / 2, amp * s, pan=0.0)


def scratch(start, dur=0.45, amp=0.035):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = band_noise(n, 2500, 9000) * (0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 22 * t))) * env_ar(n, 0.02, 0.12)
    add(start, amp * s, pan=0.15)


def thump(start, amp=0.55):
    n = int(0.5 * SR)
    t = np.arange(n) / SR
    f = 48 + 52 * np.exp(-t * 18)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    click = band_noise(n, 200, 3000) * np.exp(-t * 90) * 0.35
    add(start, amp * (s + click))


def bell(start, freqs, amp=0.09, decay=0.75):
    n = int(min(5.5, DUR - start) * SR)
    t = np.arange(n) / SR
    s = np.zeros(n)
    for f in freqs:
        for ratio, w in ((1, 1.0), (2.0, 0.35), (3.01, 0.15), (4.2, 0.07)):
            s += w * np.sin(2 * np.pi * f * ratio * t) * np.exp(-t * decay * ratio ** 0.6)
    s *= env_ar(n, 0.004, 0.2)
    add(start, amp * s / len(freqs))


# drone: E minor under the problems (audible from the first frame), A major for the first step
pad(0.0, 25.8, [329.63, 493.88, 659.26, 783.99], 0.055, fade_in=0.9, fade_out=0.6, floor=0.35)
pad(25.2, DUR, [440.0, 554.37, 659.26, 880.0], 0.055, fade_in=0.6, fade_out=1.2)

# hook: three rising plinks on the ticks, a soft one for the subline
for tt, f in ((0.45, E6), (0.75, Gs6), (1.05, B6)):
    plink(tt, f, 0.2)
plink(1.5, E6 / 2, 0.12, decay=6)

# gold wipes
for b in (3.6, 11.8, 18.8, 25.4):
    whoosh(b)

# problem 1: telephone rows, the red underline, the dud, the fix chime
for tt, f, p in ((5.0, E6, -0.3), (5.9, Fs6, 0.0), (6.8, Gs6, 0.3)):
    plink(tt, f, 0.16, pan=p)
scratch(7.45)
glide(8.1, 420, 230, 0.45, 0.14)
plink(9.3, B6, 0.18); plink(9.36, E7, 0.12)

# problem 2: tiles tick, the glass searches and lands, drops, chips, the fix chime
for k, tt in enumerate((13.1, 13.2, 13.3, 13.4)):
    plink(tt, 2600 + 120 * k, 0.05, decay=30)
glide(13.5, 520, 820, 0.9, 0.06, pan=-0.2)
plink(14.4, E6 / 2, 0.2, decay=7); plink(14.4, B6, 0.08)
for tt in (14.5, 15.05):
    glide(tt, 2100, 900, 0.08, 0.12)
for tt, f in ((15.15, E6), (15.35, Fs6), (15.55, Gs6)):
    plink(tt, f, 0.13)
plink(16.4, B6, 0.18); plink(16.46, E7, 0.12)

# problem 3: YOU, the reports, the empty seat, the fix chime
plink(20.3, 659.26, 0.2, decay=6)
for k, tt in enumerate((21.05, 21.15, 21.25, 21.35)):
    plink(tt, (E6, Fs6, Gs6, B6)[k], 0.08, pan=-0.45 + 0.3 * k)
glide(21.85, 480, 720, 0.5, 0.1, pan=0.4)
plink(23.3, B6, 0.18); plink(23.36, E7, 0.12)

# lift into the first step, the ticket stamp and bell, the chips and comment
glide(24.6, 260, 1100, 0.8, 0.07)
thump(26.6)
bell(26.6, [880.0, 1108.73, 1318.51, 1760.0])
for tt, f in ((27.4, 1760.0), (27.55, 2217.46), (27.7, 2637.0)):
    plink(tt, f, 0.09)
plink(28.1, 1318.51, 0.14); plink(28.16, 2637.0, 0.1)

# tail: ease down 15 dB over the last second, never to digital silence
tail = int(1.0 * SR)
g = np.ones(N)
g[-tail:] = np.linspace(1, 10 ** (-15 / 20), tail)
L *= g
R *= g

mix = np.stack([L, R], axis=1)
mix *= 0.89 / np.abs(mix).max()
pcm = (mix * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1], f"{DUR}s")
