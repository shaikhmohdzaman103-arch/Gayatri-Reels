#!/usr/bin/env python3
"""Assemble reels/07-fix.mp4 from timeline.json.

Usage:
  python3 tools/assemble.py --print             # write build/07-fix.ass, print the ffmpeg commands
  python3 tools/assemble.py --print --estimate  # same, from planned durations (no timeline.json needed)
  python3 tools/assemble.py --run               # loudness pass 1, then the render

Inputs: timeline.json, audio/NN.mp3, photos/NN.jpg (9:16 or wider), endcard.png.
"""
import json
import os
import re
import subprocess
import sys

KEYWORD = "07-fix"
FPS = 30
W, H = 1080, 1920
SRC_H = 2200 * 2          # 2200px tall, oversampled 2x so slow moves stay sub-pixel
SRC_W = SRC_H * 9 // 16   # 9:16 crop of the oversampled photo
Z0 = SRC_H / (H * 2)      # zoom that frames 1920 of the 2200px
END_CARD = 3.0
ROOM_DB = -38
DUCK_DB = 4
DUCK_RAMP = 0.15
LABEL = "CLIENT A · ₹25 CR · AUTO COMPONENTS"
LABEL_IN, LABEL_OUT = 1.0, 4.0

# Subtitle text per script line (verbatim from scripts/07-fix.md, pause marks removed).
LINES = {
    1: "Mere bete ne mujhe teen baar bataya tha. Maine teeno baar suna nahi.",
    2: "Ek sau chaalis din se paisa ruka tha. Main kehta raha, yaar, pandrah saal purani party hai.",
    3: "Diwali ke baad shutter nahi khula. Adtees lakh.",
    4: "Mera margin chaar percent hai. Toh adtees lakh wapas laane ke liye saadhe nau crore ka maal bechna padega.",
    5: "Lagbhag paanch mahine ka poora kaam. Ek party pe.",
    6: "Party ne paisa nahi maara. Aapne use ek sau chaalis din tak maarne diya.",
    7: "Ab woh printout har Monday main khud maangta hoon.",
}
ROW_CHARS = 40            # max characters per subtitle row at 48px condensed
REFRAME_LINE = 6


def load_timeline(estimate):
    if estimate:
        sys.path.insert(0, os.path.dirname(__file__))
        from make_timeline import build
        return build(estimate=True)[0]
    with open("timeline.json") as f:
        return json.load(f)


# ---------- subtitles ----------

def rows(text):
    """Break text into at most two rows of ROW_CHARS, balanced at a space."""
    if len(text) <= ROW_CHARS:
        return [text]
    words = text.split()
    best = None
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        if len(a) <= ROW_CHARS and len(b) <= ROW_CHARS:
            score = abs(len(a) - len(b)) - (12 if a[-1] in ".,?!…" else 0)
            if best is None or score < best[0]:
                best = (score, [a, b])
    return best[1] if best else None


def cues(text):
    """Split a script line into cues that each fit in two rows, at sentence then comma breaks."""
    parts = [p for p in re.split(r"(?<=[.?!])\s+", text) if p]
    out, cur = [], ""
    for p in parts:
        # two sentences share a cue only if each fits on its own row
        if cur and len(cur) <= ROW_CHARS and len(p) <= ROW_CHARS and "\n" not in cur:
            out.append(cur + "\n" + p)
            cur = ""
        else:
            if cur:
                out.append(cur)
                cur = ""
            if rows(p):
                cur = p
            else:  # sentence too long on its own: split at the comma (else space) nearest the middle
                commas = [m.end() for m in re.finditer(r",\s", p)] or [m.end() for m in re.finditer(r"\s", p)]
                cut = min(commas, key=lambda c: abs(c - len(p) / 2))
                out.append(p[:cut].strip())
                cur = p[cut:].strip()
    if cur:
        out.append(cur)
    return out


def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def write_ass(timeline, path):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter SemiBold,48,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,86,100,0,0,1,0,0,2,80,80,470,1
Style: SubShadow,Inter SemiBold,48,&H60000000,&H60000000,&H00000000,&H00000000,0,0,0,0,86,100,0,0,1,0,0,2,80,80,466,1
Style: Label,Inter SemiBold,28,&H20FFFFFF,&H20FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,3,0,1,0,0,1,70,70,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = []
    for r in timeline:
        text = LINES[r["line"]]
        cs = cues(text)
        start = r["audioStart"]
        speak_end = start + r["audioDuration"]
        # last cue stays to the end of the shot on the reframe (screenshot line), else 0.4s past the voice
        last_end = r["end"] if r["line"] == REFRAME_LINE else min(speak_end + 0.4, r["end"])
        cs = [c for c in cs if c]
        total = sum(len(c) for c in cs)
        t = start
        for i, c in enumerate(cs):
            t_end = last_end if i == len(cs) - 1 else t + r["audioDuration"] * len(c) / total
            body = r"\N".join(c.split("\n") if "\n" in c else rows(c))
            ev.append(f"Dialogue: 0,{ass_time(t)},{ass_time(t_end)},SubShadow,,0,0,0,,{{\\blur6}}{body}")
            ev.append(f"Dialogue: 1,{ass_time(t)},{ass_time(t_end)},Sub,,0,0,0,,{body}")
            t = t_end
    ev.append(f"Dialogue: 2,{ass_time(LABEL_IN)},{ass_time(LABEL_OUT)},Label,,0,0,0,,"
              f"{{\\fad(300,400)\\move(50,1250,70,1250,0,300)}}{LABEL}")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(head + "\n".join(ev) + "\n")


# ---------- filter graph ----------

def shot_filter(i, r):
    d = r["end"] - r["start"]
    n = round(d * FPS)
    ci, co = r["cameraIn"], r["cameraOut"]
    centre_x = "iw/2-(iw/zoom/2)"
    centre_y = "ih/2-(ih/zoom/2)"
    if ci["move"] == "push":
        z = f"{Z0:.5f}*(1+{co['scale'] - ci['scale']:.3f}*on/{n})"
        x = centre_x
    else:
        z = f"{Z0:.5f}"
        x = f"{centre_x}+(iw/zoom)*({ci['x']:.4f}+({co['x'] - ci['x']:.4f})*on/{n})"
    return (f"[{i}:v]scale=-2:{SRC_H}:flags=lanczos,crop={SRC_W}:{SRC_H},setsar=1,"
            f"zoompan=z='{z}':x='{x}':y='{centre_y}':d=1:s={W}x{H}:fps={FPS},"
            f"trim=end_frame={n},setpts=PTS-STARTPTS[v{i}]")


def duck_expr(timeline):
    g = 1 - 10 ** (-DUCK_DB / 20)
    terms = []
    for r in timeline:
        s, e = r["audioStart"], r["audioStart"] + r["audioDuration"]
        terms.append(f"clip((t-({s - DUCK_RAMP:.2f}))/{DUCK_RAMP},0,1)*clip(({e + DUCK_RAMP:.2f}-t)/{DUCK_RAMP},0,1)")
    return f"1-{g:.3f}*min(1,{'+'.join(terms)})"


def graph(timeline, ass_path, loudnorm):
    k = len(timeline)
    total = timeline[-1]["end"] + END_CARD
    f = [shot_filter(i, r) for i, r in enumerate(timeline)]
    f.append("".join(f"[v{i}]" for i in range(k)) + f"concat=n={k}:v=1:a=0,"
             "curves=all='0/0.08 0.25/0.21 0.5/0.5 0.75/0.79 1/1',"
             "colorbalance=rh=0.04:bh=0.02,"
             "vignette=angle=0.35,"
             "noise=alls=7:allf=t+u,"
             f"ass={ass_path},format=yuv420p[main]")
    f.append(f"[{k}:v]scale={W}:{H}:force_original_aspect_ratio=decrease,"
             f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps={FPS},"
             f"trim=duration={END_CARD},setpts=PTS-STARTPTS,format=yuv420p[card]")
    f.append("[main][card]concat=n=2:v=1:a=0[vout]")
    for j, r in enumerate(timeline):
        ms = round(r["audioStart"] * 1000)
        f.append(f"[{k + 1 + j}:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay={ms}:all=1[a{j}]")
    f.append("".join(f"[a{j}]" for j in range(k)) + f"amix=inputs={k}:normalize=0:duration=longest[voice]")
    f.append(f"anoisesrc=color=brown:amplitude=0.5:sample_rate=48000:duration={total:.2f},"
             "lowpass=f=320,highpass=f=40,aformat=channel_layouts=stereo,"
             f"volume={ROOM_DB}dB,afade=t=in:d=1,"
             # fade the last 0.5s down 12 dB, never to zero, so the file never ends in digital silence
             f"volume='if(gt(t,{total - 0.5:.2f}),1-{1 - 10 ** (-12 / 20):.3f}*(t-{total - 0.5:.2f})/0.5,1)':eval=frame,"
             f"volume='{duck_expr(timeline)}':eval=frame[room]")
    f.append(f"[voice][room]amix=inputs=2:normalize=0:duration=longest,atrim=end={total:.2f},{loudnorm}[aout]")
    return ";\n".join(f), total


def inputs(timeline):
    cmd = []
    for r in timeline:
        d = r["end"] - r["start"]
        cmd += ["-loop", "1", "-framerate", str(FPS), "-t", f"{d:.2f}", "-i", f"photos/{r['photo']:02d}.jpg"]
    cmd += ["-loop", "1", "-framerate", str(FPS), "-t", str(END_CARD), "-i", "endcard.png"]
    for r in timeline:
        cmd += ["-i", r["audio"]]
    return cmd


def command(timeline, graph_text, out):
    return ["ffmpeg", "-y"] + inputs(timeline) + ["-filter_complex", graph_text, "-map", "[vout]", "-map", "[aout]",
            "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", str(FPS),
            "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", out]


def main():
    estimate = "--estimate" in sys.argv
    timeline = load_timeline(estimate)
    ass_path = f"build/{KEYWORD}.ass"
    write_ass(timeline, ass_path)
    out = f"reels/{KEYWORD}.mp4"
    pass1 = "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json"
    pass2 = ("loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=<I>:measured_TP=<TP>:"
             "measured_LRA=<LRA>:measured_thresh=<thresh>:offset=<offset>:linear=true")
    g2, total = graph(timeline, ass_path, pass2)
    if "--print" in sys.argv:
        print(f"# total {total:.2f}s" + (" (ESTIMATE)" if estimate else ""))
        print("# pass 1 measures loudness with the same graph and", pass1, "writing to /dev/null")
        print("# pass 2 (render):")
        print(g2)
        print("\n# command:")
        import shlex
        print(shlex.join(command(timeline, "<graph above>", out)))
        return
    if "--run" in sys.argv:
        g1, _ = graph(timeline, ass_path, pass1)
        res = subprocess.run(["ffmpeg", "-hide_banner"] + inputs(timeline) +
                             ["-filter_complex", g1, "-map", "[aout]", "-f", "null", "-"],
                             capture_output=True, text=True, check=True)
        m = json.loads(res.stderr[res.stderr.rindex("{"):res.stderr.rindex("}") + 1])
        g2 = g2.replace("<I>", m["input_i"]).replace("<TP>", m["input_tp"]).replace("<LRA>", m["input_lra"]) \
               .replace("<thresh>", m["input_thresh"]).replace("<offset>", m["target_offset"])
        os.makedirs("reels", exist_ok=True)
        subprocess.run(command(timeline, g2, out), check=True)


if __name__ == "__main__":
    main()
