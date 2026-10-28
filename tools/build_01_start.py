#!/usr/bin/env python3
"""Reel 01-start: portrait montage + kinetic type, mute, subtitles burned in.

Usage:
  python3 tools/build_01_start.py --print   # write build/01-start.ass, print the ffmpeg command
  python3 tools/build_01_start.py --run     # render reels/01-start.mp4
"""
import os
import shlex
import subprocess
import sys

FPS = 30
W, H = 1080, 1920
PUSH = 0.03
GREEN = "0x0E2A24"
END_CARD = ("endcards/01-start.png", 3.0)
ASS = "build/01-start.ass"
OUT = "reels/01-start.mp4"

# ASS colours are &HBBGGRR
CREAM = r"&HE3EFF4&"
GOLD = r"&H27A2C9&"

# Portrait crops: a 9:16 window (x, y, w, h) in source pixels, and the face point inside that
# window as a fraction (fx, fy). fy ~0.24-0.30 puts the face in the upper third.
PORTRAITS = {
    "divyansh": ((228, 205, 844, 1500), (0.50, 0.27)),
    "zaman":    ((46, 0, 803, 1427),    (0.50, 0.24)),
    "nupur":    ((240, 243, 664, 1180), (0.50, 0.30)),
    "jaya":     ((502, 132, 816, 1450), (0.50, 0.28)),
}
LABELS = {
    "divyansh": ("DIVYANSH SINGH", "FOUNDER · IIM INDORE"),
    "zaman":    ("MOHAMMED ZAMAN SHAIKH", "FINANCE · ₹700 CR LOAN PORTFOLIO"),
    "nupur":    ("NUPUR SINGH", "CO-FOUNDER · OPERATIONS"),
    "jaya":     ("JAYA CHAUDHARIE", "CLIENT BUSINESS MANAGER"),
}

# kind, duration, payload. Card text uses \N for breaks and {g}...{/g} for gold words.
BEATS = [
    ("card-black", 1.0, r"Consultant\Nbulaun?\N{g}Lakhon ka bill{/g}\Naayega."),
    ("portrait", 4.0, ("divyansh", "Das saal se yahi sunte aaye hain.")),
    ("card", 1.7, r"Pichhla\Nconsultant aaya.\NKuch nahi\Nbadla."),
    ("portrait", 4.0, ("zaman", "Isliye pehle sirf tees minute.")),
    ("card", 1.6, r"Aur fees?\N{g}Lakhon{/g} mein\Nhogi na?"),
    ("portrait", 4.0, ("nupur", "Paanch sau ek rupaye. GST ke saath.")),
    ("card", 2.4, r"Galat consultant\Nmehenga hai.\N{g}Sawaal\Nsasta hai.{/g}"),
    ("portrait", 4.0, ("jaya", "Kaam ka na lage, toh baat khatam.")),
]


def ass_time(t):
    cs = int(round(t * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def card_text(text, animate):
    """Reveal word by word (alpha only, so the layout never reflows); gold where marked."""
    out, i, colour = [], 0, CREAM
    for row_n, row in enumerate(text.split(r"\N")):
        words = []
        for word in row.split(" "):
            if word.startswith("{g}"):
                colour, word = GOLD, word[3:]
            closing = word.endswith("{/g}")
            word = word.replace("{/g}", "")
            if animate:
                t0 = 60 + i * 70
                words.append(rf"{{\c{colour}\alpha&HFF&\t({t0},{t0 + 140},\alpha&H00&)}}{word}")
            else:
                words.append(rf"{{\c{colour}}}{word}")
            if closing:
                colour = CREAM
            i += 1
        out.append(" ".join(words))
    return r"\N".join(out)


def write_ass():
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Card,Inter Black,116,&H00E3EFF4,&H00E3EFF4,&H00000000,&H00000000,0,0,0,0,78,100,0,0,1,0,0,5,80,80,0,1
Style: Sub,Inter SemiBold,48,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,86,100,0,0,1,0,0,2,80,80,470,1
Style: SubShadow,Inter SemiBold,48,&H60000000,&H60000000,&H00000000,&H00000000,0,0,0,0,86,100,0,0,1,0,0,2,80,80,466,1
Style: Name,Inter Bold,34,&H00E3EFF4,&H00E3EFF4,&H00000000,&H00000000,0,0,0,0,100,100,3,0,1,0,0,2,80,80,610,1
Style: Role,Inter SemiBold,30,&H0027A2C9,&H0027A2C9,&H00000000,&H00000000,0,0,0,0,100,100,2,0,1,0,0,2,80,80,566,1
Style: NameShadow,Inter Bold,34,&H70000000,&H70000000,&H00000000,&H00000000,0,0,0,0,100,100,3,0,1,0,0,2,80,80,607,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev, t = [], 0.0
    for kind, d, payload in BEATS:
        a, b = ass_time(t), ass_time(t + d)
        if kind.startswith("card"):
            # the opening card is the thumbnail: fully visible from frame 0
            body = card_text(payload, animate=(kind == "card"))
            move = "" if kind == "card-black" else r"\move(540,980,540,960,0,400)"
            ev.append(f"Dialogue: 1,{a},{b},Card,,0,0,0,,{{\\an5{move}}}{body}")
        else:
            who, line = payload
            name, role = LABELS[who]
            s, e = ass_time(t + 0.3), ass_time(t + d - 0.15)
            ev.append(f"Dialogue: 0,{s},{e},SubShadow,,0,0,0,,{{\\blur6\\fad(200,150)}}{line}")
            ev.append(f"Dialogue: 1,{s},{e},Sub,,0,0,0,,{{\\fad(200,150)}}{line}")
            ev.append(f"Dialogue: 0,{s},{e},NameShadow,,0,0,0,,{{\\blur5\\fad(200,150)}}{name}")
            ev.append(f"Dialogue: 1,{s},{e},Name,,0,0,0,,{{\\fad(200,150)}}{name}")
            ev.append(f"Dialogue: 1,{s},{e},Role,,0,0,0,,{{\\fad(200,150)}}{role}")
        t += d
    os.makedirs(os.path.dirname(ASS), exist_ok=True)
    with open(ASS, "w") as f:
        f.write(head + "\n".join(ev) + "\n")
    return t


def build():
    content = write_ass()
    total = content + END_CARD[1]
    inputs, chains, labels = [], [], []
    for n, (kind, d, payload) in enumerate(BEATS):
        frames = round(d * FPS)
        if kind.startswith("card"):
            colour = "black" if kind == "card-black" else GREEN
            chains.append(f"color=c={colour}:s={W}x{H}:r={FPS}:d={d},setsar=1,format=yuv420p[s{n}]")
        else:
            who = payload[0]
            (x, y, w, h), (fx, fy) = PORTRAITS[who]
            idx = len(inputs) // 8
            inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{d}", "-i", f"brand/{who}.png"]
            px, py = round(fx * 2 * W), round(fy * 2 * H)
            chains.append(
                f"[{idx}:v]format=rgb24,crop={w}:{h}:{x}:{y},scale={2 * W}:{2 * H}:flags=lanczos,setsar=1,"
                f"zoompan=z='1+{PUSH}*on/{frames}':x='{px}*(1-1/zoom)':y='{py}*(1-1/zoom)':d=1:s={W}x{H}:fps={FPS},"
                f"trim=end_frame={frames},setpts=PTS-STARTPTS[p{n}];"
                # soft dark gradient under the bottom third so white type reads on light photos
                f"gradients=s={W}x{H}:c0=black@0:c1=black@0.78:x0=0:y0=880:x1=0:y1=1480:"
                f"nb_colors=2:r={FPS}:d={d},format=rgba[g{n}];"
                f"[p{n}][g{n}]overlay=format=auto,format=yuv420p[s{n}]")
        labels.append(f"[s{n}]")
    card_idx = len(inputs) // 8
    inputs += ["-loop", "1", "-framerate", str(FPS), "-t", str(END_CARD[1]), "-i", END_CARD[0]]
    chains.append("".join(labels) + f"concat=n={len(BEATS)}:v=1:a=0,ass={ASS},format=yuv420p[body]")
    chains.append(f"[{card_idx}:v]scale={W}:{H},setsar=1,fps={FPS},trim=duration={END_CARD[1]},"
                  "setpts=PTS-STARTPTS,format=yuv420p[end]")
    chains.append("[body][end]concat=n=2:v=1:a=0[vout]")
    graph = ";\n".join(chains)
    cmd = (["ffmpeg", "-y", "-hide_banner"] + inputs +
           ["-filter_complex", graph, "-map", "[vout]", "-an",
            "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p", "-r", str(FPS),
            "-movflags", "+faststart", OUT])
    return cmd, graph, total


def main():
    cmd, graph, total = build()
    if "--print" in sys.argv:
        print(f"# planned duration {total:.2f}s")
        print(graph)
        print()
        print(shlex.join(cmd[:cmd.index("-filter_complex") + 1] + ["<graph above>"] +
                         cmd[cmd.index("-filter_complex") + 2:]))
    if "--run" in sys.argv:
        os.makedirs("reels", exist_ok=True)
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
