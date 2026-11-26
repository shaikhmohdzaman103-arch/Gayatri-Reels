#!/usr/bin/env python3
"""Add the Gayatri logo and Divyansh's contact panel to any video, keeping its own audio.

  python3 tools/brand_overlay.py <input.mp4> <output.mp4>

Vertical video: logo top-left, contact panel near the bottom (clear of centre captions).
Horizontal video: logo top-left, contact panel top-right (clear of bottom-left title strips).
The logo is assets/logo.png, scaled proportionally; only the white matte outside its own
green ring is trimmed by a circular mask.
"""
import json
import os
import subprocess
import sys
import tempfile

from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GREEN, GOLD, WHITE = (6, 63, 50), (201, 151, 43), (250, 248, 243)
LINE1 = "GAYATRI BUSINESS"
LINE2 = "Call / WhatsApp Divyansh Singh: +91 88580 48888"


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation",
                          "-of", "json", path], capture_output=True, text=True, check=True).stdout
    s = json.loads(out)["streams"][0]
    w, h = s["width"], s["height"]
    rot = next((abs(int(d.get("rotation", 0))) for d in s.get("side_data_list", [])), 0)
    return (h, w) if rot in (90, 270) else (w, h)


def inter(tmp, size, weight):
    ttf = os.path.join(tmp, "Inter.ttf")
    if not os.path.exists(ttf):
        f = TTFont(os.path.join(ROOT, "assets/fonts/Inter-normal-latin.woff2"))
        f.flavor = None
        f.save(ttf)
    ft = ImageFont.truetype(ttf, size, layout_engine=ImageFont.Layout.RAQM)
    axes = ft.get_variation_axes()
    ft.set_variation_by_axes([weight] + [a.get("default", 14) for a in axes[1:]])
    return ft


def round_logo(size):
    logo = Image.open(os.path.join(ROOT, "assets/logo.png")).convert("RGBA")
    big = logo.resize((size * 4, size * 4), Image.LANCZOS)
    mask = Image.new("L", big.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, big.width - 1, big.height - 1), fill=255)
    big.putalpha(mask)
    return big.resize((size, size), Image.LANCZOS)


def shadowed(img, pad=10, alpha=110):
    base = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.putalpha(img.getchannel("A").point(lambda v: v * alpha // 255))
    base.alpha_composite(sh, (pad, pad + 4))
    base = base.filter(ImageFilter.GaussianBlur(pad / 2))
    base.alpha_composite(img, (pad, pad))
    return base


def contact_panel(tmp, scale):
    t1, t2 = inter(tmp, int(19 * scale), 700), inter(tmp, int(24 * scale), 600)
    feats = ["tnum", "lnum"]
    d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    w1 = d.textlength(LINE1, font=t1, features=feats)
    w2 = d.textlength(LINE2, font=t2, features=feats)
    padx, pady, gap = int(26 * scale), int(14 * scale), int(6 * scale)
    W, H = int(max(w1, w2) + padx * 2), int(t1.size + t2.size + gap + pady * 2 + 4 * scale)
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(im)
    dr.rounded_rectangle((0, 0, W - 1, H - 1), radius=int(18 * scale), fill=GREEN + (232,), outline=GOLD + (255,), width=max(2, int(2 * scale)))
    dr.text(((W - w1) / 2, pady), LINE1, font=t1, fill=GOLD, features=feats)
    dr.text(((W - w2) / 2, pady + t1.size + gap), LINE2, font=t2, fill=WHITE, features=feats)
    return im


def overlay(tmp, w, h):
    s = min(w, h) / 720  # designed at 720 px on the short side
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    logo = shadowed(round_logo(int((104 if h > w else 96) * s)))
    ov.alpha_composite(logo, (int(26 * s) - 10, int(26 * s) - 10))
    panel = shadowed(contact_panel(tmp, 0.95 * s))
    if h > w:  # vertical: centred near the bottom
        ov.alpha_composite(panel, ((w - panel.width) // 2, h - panel.height - int(108 * s)))
    else:  # horizontal: top-right
        ov.alpha_composite(panel, (w - panel.width - int(18 * s), int(26 * s)))
    path = os.path.join(tmp, "overlay.png")
    ov.save(path)
    return path


def main():
    src, dst = sys.argv[1], sys.argv[2]
    w, h = probe(src)
    with tempfile.TemporaryDirectory() as tmp:
        png = overlay(tmp, w, h)
        cmd = ["ffmpeg", "-v", "error", "-y", "-i", src, "-loop", "1", "-i", png,
               "-filter_complex", "[1:v]format=rgba,fade=t=in:st=0:d=0.4:alpha=1[o];[0:v][o]overlay=0:0:shortest=1,format=yuv420p[v]",
               "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-c:a", "copy",
               "-movflags", "+faststart", dst]
        print(" ".join(cmd))
        subprocess.run(cmd, check=True)
    print(f"{dst}: {w}x{h}")


if __name__ == "__main__":
    main()
