#!/usr/bin/env python3
"""Audio pipeline for the Order post-mortem reel. Reads everything from src/config.ts.

  python3 scripts/audio.py clean   # assets/vo.wav -> assets/vo_clean.wav (original kept)
  python3 scripts/audio.py sync    # local Whisper word timestamps -> TIMINGS block in src/config.ts
  python3 scripts/audio.py mix     # vo_clean + music (ducked, 1 s cut at the loss) + SFX -> assets/mix.wav
  python3 scripts/audio.py all     # clean, sync, check, mix

Never generates or alters the voice beyond cleaning; there is no text-to-speech anywhere here.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
ASSETS = os.path.join(ROOT, "..", "assets")
CONFIG_TS = os.path.join(ROOT, "src", "config.ts")
WHISPER = os.environ.get("WHISPER_MODEL", os.path.join(ROOT, ".whisper-small"))
SR = 48000

VO_RAW = os.path.join(ASSETS, "vo.wav")
VO_CLEAN = os.path.join(ASSETS, "vo_clean.wav")
MUSIC = os.path.join(ASSETS, "music.mp3")
SFX_DIR = os.path.join(ASSETS, "sfx")
MIX = os.path.join(ASSETS, "mix.wav")
WORDS = os.path.join(ASSETS, "vo_words.json")


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **kw)


def config():
    out = run(["node", "--experimental-strip-types", "--no-warnings", os.path.join(HERE, "dump-config.ts")], cwd=ROOT)
    return json.loads(out.stdout)


def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout)


def decode(path, sr=SR, ch=2):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-f", "f32le", "-ac", str(ch), "-ar", str(sr), "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, ch).copy()


def write_wav(path, a, sr=SR):
    a = np.clip(a, -1, 1).astype(np.float32)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", str(a.shape[1]), "-ar", str(sr), "-i", "-",
                    "-c:a", "pcm_s24le", path], input=a.tobytes(), check=True)


def loudnorm(src, dst, I, TP, LRA=11, pre="", extra=()):
    """Two-pass EBU R128 normalisation."""
    chain = (pre + "," if pre else "")
    p1 = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-af",
                         chain + f"loudnorm=I={I}:TP={TP}:LRA={LRA}:print_format=json", "-f", "null", "-"],
                        capture_output=True, text=True)
    m = json.loads(p1.stderr[p1.stderr.rindex("{"):p1.stderr.rindex("}") + 1])
    af = (chain + f"loudnorm=I={I}:TP={TP}:LRA={LRA}:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
          f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true")
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", af, "-ar", str(SR), *extra, "-c:a", "pcm_s24le", dst])


def ebur128(path):
    p = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"],
                       capture_output=True, text=True)
    s = p.stderr[p.stderr.rindex("Summary:"):]
    get = lambda pat: float(re.search(pat, s).group(1))
    return {"I": get(r"I:\s+(-?[\d.]+) LUFS"), "LRA": get(r"LRA:\s+(-?[\d.]+) LU"), "TP": get(r"Peak:\s+(-?[\d.]+) dBFS"), "text": s.strip()}


def integrated(path_or_array):
    if isinstance(path_or_array, str):
        return ebur128(path_or_array)["I"]
    tmp = os.path.join(ASSETS, ".tmp_measure.wav")
    write_wav(tmp, path_or_array)
    try:
        return ebur128(tmp)["I"]
    finally:
        os.remove(tmp)


# ── 1. clean ─────────────────────────────────────────────────────────────────
def clean(cfg):
    if not os.path.exists(VO_RAW):
        sys.exit(f"STOP: {os.path.relpath(VO_RAW)} not found. Record the script in RECORDING.md and save it there.")
    raw_len = duration(VO_RAW)
    pre = ("highpass=f=80,afftdn=nf=-25,"
           "acompressor=threshold=-20dB:ratio=2.5:attack=8:release=150:makeup=2,"
           "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.25")
    loudnorm(VO_RAW, VO_CLEAN, cfg["AUDIO"]["voLufs"], cfg["AUDIO"]["voTruePeak"], pre=pre, extra=["-ac", "1"])
    d = duration(VO_CLEAN)
    print(f"vo.wav {raw_len:.2f}s -> vo_clean.wav {d:.2f}s (leading silence trimmed to 0.25 s)")
    if d > cfg["DURATION_S"]:
        sys.exit(f"STOP: the cleaned voiceover is {d:.2f}s, longer than {cfg['DURATION_S']}s. "
                 "It will not be sped up; please re-record a little faster.")


# ── 2. sync ──────────────────────────────────────────────────────────────────
def norm(w):
    return re.sub(r"[^a-z0-9%.]", "", w.lower().replace("₹", "")).strip(".")


def sync(cfg):
    from faster_whisper import WhisperModel
    audio = decode(VO_CLEAN, 16000, 1)[:, 0]
    prompt = " ".join(l["say"] for l in cfg["VO_LINES"])
    model = WhisperModel(WHISPER, device="cpu", compute_type="int8")
    segs, _ = model.transcribe(audio, language="en", word_timestamps=True, initial_prompt=prompt, beam_size=5)
    words = [{"start": round(w.start, 3), "end": round(w.end, 3), "word": w.word.strip()} for s in segs for w in s.words]
    json.dump(words, open(WORDS, "w"), indent=1)
    print(f"Whisper heard {len(words)} words -> {os.path.relpath(WORDS)}")

    idx = {}
    for a in cfg["ANCHORS"]:
        start = idx[a["after"]] + 1 if a["after"] else 0
        hit = next((i for i in range(start, len(words)) if re.match(a["match"], norm(words[i]["word"]))), None)
        if hit is None:
            heard = " ".join(w["word"] for w in words[start:start + 12])
            sys.exit(f"STOP: could not find the cue for '{a['key']}' (pattern {a['match']}) after '{a['after']}'. "
                     f"Whisper heard next: \"{heard}\". Re-record that line as written, or adjust ANCHORS in src/config.ts.")
        idx[a["key"]] = hit

    t = {k: words[i]["start"] for k, i in idx.items()}
    line_ids = [l["id"] for l in cfg["VO_LINES"]]
    for n, lid in enumerate(line_ids):
        last = (idx[line_ids[n + 1]] - 1) if n + 1 < len(line_ids) else len(words) - 1
        t[f"{lid}.end"] = words[last]["end"]
        heard = " ".join(w["word"] for w in words[idx[lid]:last + 1])
        print(f"  {lid:>3} {t[lid]:6.2f}-{t[lid + '.end']:6.2f}s  script: {cfg['VO_LINES'][n]['say']}\n{'':21}heard:  {heard}")

    block = json.dumps({"source": "whisper:vo_clean.wav", "anchors": {k: round(v, 3) for k, v in t.items()}}, indent=2)
    src = open(CONFIG_TS).read()
    new = re.sub(r"(// @timings-start\n).*?(\n// @timings-end)",
                 lambda m: m.group(1) + "export const TIMINGS: { source: string; anchors: Record<string, number> } = " + block + ";" + m.group(2),
                 src, flags=re.S)
    open(CONFIG_TS, "w").write(new)
    print("Updated TIMINGS in src/config.ts")


# ── 3. SFX (synthesised here, plus ElevenLabs takes where present) ───────────
def env(n, attack, decay):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-4)) * np.exp(-t / decay)


def synth_sfx():
    rng = np.random.default_rng(7)
    os.makedirs(SFX_DIR, exist_ok=True)
    out = {}

    def stereo(m):
        return np.stack([m, m], 1).astype(np.float32)

    # Deep impact for the hook headline.
    n = int(SR * 1.2); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 60 * np.exp(-t * 18)) * t) * env(n, 0.003, 0.32)
    click = rng.standard_normal(n) * env(n, 0.0005, 0.012) * 0.5
    out["impact"] = stereo(0.9 * boom + click)
    # Receipt-printer line: a fast train of dry clicks with a little motor buzz.
    n = int(SR * 0.42); t = np.arange(n) / SR; m = np.zeros(n)
    for k in range(9):
        s = int((0.02 + k * 0.038) * SR); L = int(0.012 * SR)
        m[s:s + L] += rng.standard_normal(L) * np.exp(-np.arange(L) / (0.0025 * SR)) * (0.8 + 0.2 * rng.random())
    buzz = np.sign(np.sin(2 * np.pi * 220 * t)) * 0.06 * (t < 0.36)
    hp = np.diff(m + buzz, prepend=0)
    out["printer"] = stereo(0.55 * hp / (np.abs(hp).max() + 1e-9))
    # Rubber stamp: low body thump + papery slap.
    n = int(SR * 0.5); t = np.arange(n) / SR
    body = np.sin(2 * np.pi * (95 + 50 * np.exp(-t * 40)) * t) * env(n, 0.001, 0.07)
    slap = np.diff(rng.standard_normal(n), prepend=0) * env(n, 0.0005, 0.018) * 0.35
    out["stamp"] = stereo(0.85 * body + slap)
    # Card flip whoosh: band-limited noise swell.
    n = int(SR * 0.45); t = np.arange(n) / SR
    noise = rng.standard_normal(n)
    k = np.exp(-np.arange(64) / 10.0); k /= k.sum()
    lp = np.convolve(noise, k, mode="same")
    shape = np.sin(np.pi * np.clip(t / 0.4, 0, 1)) ** 2
    out["whoosh"] = stereo(0.5 * (lp - np.convolve(lp, np.ones(400) / 400, mode="same")) * shape / 0.25)
    # Pen strike: short scratchy stroke.
    n = int(SR * 0.32); t = np.arange(n) / SR
    sc = np.diff(rng.standard_normal(n), prepend=0) * (0.5 + 0.5 * np.sin(2 * np.pi * 38 * t)) * np.sin(np.pi * np.clip(t / 0.3, 0, 1))
    out["strike"] = stereo(0.22 * sc)
    # Soft bell for the CTA.
    n = int(SR * 1.6); t = np.arange(n) / SR
    bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * d) for f, a, d in [(880, 0.5, 3.2), (1320, 0.25, 4.5), (1760, 0.12, 6), (2640, 0.05, 8)])
    out["bell"] = stereo(0.45 * bell * np.minimum(1, t / 0.004))
    # Soft thud for the loss reveal: the ElevenLabs take if present, else a synthesised one.
    el = os.path.join(SFX_DIR, "thud-el.mp3")
    if os.path.exists(el):
        a = decode(el); out["thud"] = 0.9 * a / (np.abs(a).max() + 1e-9)
    else:
        n = int(SR * 0.7); t = np.arange(n) / SR
        out["thud"] = stereo(np.sin(2 * np.pi * (55 + 30 * np.exp(-t * 25)) * t) * env(n, 0.002, 0.16))
    for k2, v in out.items():
        if k2 != "thud":
            write_wav(os.path.join(SFX_DIR, f"{k2}.wav"), v)
    return out


# ── 4. mix ───────────────────────────────────────────────────────────────────
def mix(cfg, allow_no_vo=False):
    A, T, S = cfg["AUDIO"], cfg["TIMINGS"]["anchors"], cfg["SCENES"]
    total = int(cfg["DURATION_S"] * SR)
    out = np.zeros((total, 2), np.float32)
    have_vo = os.path.exists(VO_CLEAN)
    if not have_vo and not allow_no_vo:
        sys.exit("STOP: assets/vo_clean.wav missing; run `audio.py clean` first.")
    if have_vo:
        vo = decode(VO_CLEAN)[:total]
        out[:len(vo)] += vo

    t = np.arange(total) / SR
    if os.path.exists(MUSIC):
        mu = decode(MUSIC)
        mu = np.pad(mu, ((0, max(0, total - len(mu))), (0, 0)))[:total]
        gain = 10 ** ((A["musicUnderVoiceLufs"] - integrated(mu)) / 20)  # whole bed at -24 LUFS
        voiced = np.zeros(total, bool)
        for l in cfg["VO_LINES"]:
            voiced |= (t >= T[l["id"]] - 0.2) & (t <= T[l["id"] + ".end"] + 0.2)
        lift = np.where(voiced, 1.0, 10 ** (A["musicGapLiftDb"] / 20)) if have_vo else np.ones(total)  # no voice: no ducking
        k = int(0.15 * SR); lift = np.convolve(lift, np.ones(k) / k, mode="same")  # smooth ducking
        cut0 = T["loss"] - 0.02
        C = A["musicCutSeconds"]
        cut = np.interp(t, [cut0 - 0.04, cut0, cut0 + C, cut0 + C + 0.35], [1, 0, 0, 1])  # silent for C seconds at the loss
        fade = np.clip(t / 0.4, 0, 1) * np.clip((cfg["DURATION_S"] - t) / 0.8, 0, 1)
        out += mu * (gain * lift * cut * fade)[:, None]
        music_note = f"music bed at {A['musicUnderVoiceLufs']} LUFS, +{A['musicGapLiftDb']} dB in pauses, silent {T['loss'] - 0.02:.2f}-{T['loss'] + A['musicCutSeconds']:.2f}s"
    else:
        music_note = "no assets/music.mp3: no music"

    fx = synth_sfx()
    g = 10 ** (A["sfxDb"] / 20)
    cues = [("impact", T["L1"] - 0.02, 0.8), ("whoosh", S["celebration"][0] - 0.2, 0.5), ("stamp", T["closed"], 1.0),
            ("whoosh", T["flip"], 0.9), ("thud", T["loss"], 1.0), ("strike", T["L8"] + 0.35, 0.8),
            ("whoosh", S["question"][0] - 0.15, 0.45), ("bell", S["cta"][0] + 0.45, 0.6)]
    cues += [("printer", T[f"L{i}"], 0.9) for i in range(4, 8)]
    for name, at, lvl in cues:
        s = int(at * SR); a = fx[name][: max(0, total - s)]
        out[s:s + len(a)] += a * g * lvl

    target = MIX if have_vo else os.path.join(ASSETS, "mix_music_only.wav")  # mix.wav always means "with your voice"
    tmp = os.path.join(ASSETS, ".mix_raw.wav")
    write_wav(tmp, out)
    loudnorm(tmp, target, A["voLufs"], A["voTruePeak"] - 0.4, extra=["-ac", "2"])  # headroom so the measured TP stays <= -1
    os.remove(tmp)
    run(["ffmpeg", "-v", "error", "-y", "-i", target, "-t", str(cfg["DURATION_S"]), "-c:a", "pcm_s24le", target + ".tmp.wav"])
    os.replace(target + ".tmp.wav", target)
    r = ebur128(target)
    print(f"{music_note}\n{os.path.basename(target)} {duration(target):.3f}s  ebur128: I {r['I']} LUFS, LRA {r['LRA']} LU, true peak {r['TP']} dBFS")
    print(r["text"])


def check():
    p = subprocess.run(["node", "--experimental-strip-types", "--no-warnings", os.path.join(HERE, "check.ts")], cwd=ROOT, text=True)
    if p.returncode:
        sys.exit("STOP: scripts/check.ts failed")


if __name__ == "__main__":
    step = sys.argv[1] if len(sys.argv) > 1 else "all"
    if step in ("clean", "all"):
        clean(config())
    if step in ("sync", "all"):
        sync(config())
    if step in ("all",):
        check()
    if step in ("mix", "all"):
        mix(config(), allow_no_vo="--no-vo" in sys.argv)
