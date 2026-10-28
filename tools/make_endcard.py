#!/usr/bin/env python3
"""Render 1080x1920 end cards with Pillow.

Usage: python3 tools/make_endcard.py   # writes all eight cards to endcards/NN-keyword.png
"""
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
BG = (0x0E, 0x2A, 0x24)
CREAM = (0xF4, 0xEF, 0xE3)
DISC = (0xF3, 0xEB, 0xDE)
SOFT = (0xD9, 0xCF, 0xB4)
GOLD = (0xC9, 0xA2, 0x27)
FONT = "/usr/share/fonts/opentype/inter/Inter-{}.otf"
MARK = "brand/mark.png"
WORDMARK = "GAYATRI BUSINESS"
WHATSAPP = "+91 88580 48888"
MAX_TEXT_W = 920

# NN, offer, price line, keyword (offer ladder in CLAUDE.md)
CARDS = [
    ("01", "Discovery Call", "₹501 incl. GST", "START"),
    ("02", "Clarity Session", "On request", "CLARITY"),
    ("03", "30-Day Fix", "₹40,000 se shuru", "FIX"),
    ("04", "Team Workshop", "On request", "TEAM"),
    ("05", "Growth Strategy Sprint", "On request", "GROWTH"),
    ("06", "Finance, Ops & SOP Setup", "₹1,50,000 se shuru", "SYSTEM"),
    ("07", "MIS Monthly", "₹35,000 / month se shuru", "CASH"),
    ("08", "Advisory Retainer", "On request", "ADVISOR"),
]


def font(weight, size):
    return ImageFont.truetype(FONT.format(weight), size)


def centred(draw, y, text, f, fill, spacing=0):
    if spacing:
        widths = [draw.textlength(c, font=f) for c in text]
        x = (W - sum(widths) - spacing * (len(text) - 1)) / 2
        for c, w in zip(text, widths):
            draw.text((x, y), c, font=f, fill=fill)
            x += w + spacing
    else:
        draw.text(((W - draw.textlength(text, font=f)) / 2, y), text, font=f, fill=fill)


def offer_lines(draw, offer):
    """Largest size from 112 down to 84 that fits one line; else two lines at 96."""
    for size in range(112, 83, -4):
        f = font("Bold", size)
        if draw.textlength(offer, font=f) <= MAX_TEXT_W:
            return [offer], f
    f = font("Bold", 96)
    words = offer.split()
    best = min(range(1, len(words)),
               key=lambda i: abs(len(" ".join(words[:i])) - len(" ".join(words[i:]))))
    return [" ".join(words[:best]), " ".join(words[best:])], f


def make_endcard(offer, price, keyword, outfile):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Disc is the panel: the mark's green petals need a light ground.
    disc_d, disc_cy = 240, 380
    d.ellipse([(W - disc_d) / 2, disc_cy - disc_d / 2, (W + disc_d) / 2, disc_cy + disc_d / 2], fill=DISC)
    mark = Image.open(MARK).convert("RGBA")
    mw = round(disc_d * 0.6)
    mark = mark.resize((mw, round(mark.height * mw / mark.width)), Image.LANCZOS)
    img.paste(mark, ((W - mw) // 2, disc_cy - mark.height // 2), mark)

    centred(d, disc_cy + disc_d / 2 + 50, WORDMARK, font("SemiBold", 34), CREAM, spacing=10)

    rule_y = disc_cy + disc_d / 2 + 190
    d.rectangle([W / 2 - 60, rule_y, W / 2 + 60, rule_y + 4], fill=GOLD)

    lines, of = offer_lines(d, offer)
    y = rule_y + 70
    for line in lines:
        centred(d, y, line, of, CREAM)
        y += of.size * 1.12
    centred(d, y + 40, price, font("Medium", 50), SOFT)

    pill_text = f"COMMENT “{keyword}”"
    pf = font("Bold", 58)
    tw = d.textlength(pill_text, font=pf)
    pw, ph = tw + 140, 132
    py = y + 210
    d.rounded_rectangle([(W - pw) / 2, py, (W + pw) / 2, py + ph], radius=ph // 2, fill=GOLD)
    asc, desc = pf.getmetrics()
    d.text(((W - tw) / 2, py + (ph - asc - desc) / 2 + 2), pill_text, font=pf, fill=BG)

    centred(d, py + ph + 120, "WhatsApp", font("Medium", 40), SOFT)
    centred(d, py + ph + 175, WHATSAPP, font("SemiBold", 60), CREAM)

    os.makedirs(os.path.dirname(outfile) or ".", exist_ok=True)
    img.save(outfile, optimize=True)
    return outfile


def main():
    for nn, offer, price, keyword in CARDS:
        print(make_endcard(offer, price, keyword, f"endcards/{nn}-{keyword.lower()}.png"))


if __name__ == "__main__":
    main()
