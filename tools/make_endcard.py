#!/usr/bin/env python3
"""Render endcard.png (1080x1920) with Pillow.

Usage: python3 tools/make_endcard.py
"""
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
BG = (0x0E, 0x2A, 0x24)
CREAM = (0xF4, 0xEF, 0xE3)
SOFT = (0xD9, 0xCF, 0xB4)
GOLD = (0xC9, 0xA2, 0x27)
FONT = "/usr/share/fonts/opentype/inter/Inter-{}.otf"

OFFER = "MIS Monthly"
PRICE = "₹35,000 / month + GST se shuru"
KEYWORD = "CASH"
WHATSAPP = "+91 88580 48888"


def font(weight, size):
    return ImageFont.truetype(FONT.format(weight), size)


def centred(draw, y, text, f, fill):
    w = draw.textlength(text, font=f)
    draw.text(((W - w) / 2, y), text, font=f, fill=fill)


def main():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # The logo's green lettering disappears on the green background, so it sits on a cream card.
    logo = Image.open("brand/logo.png").convert("RGBA")
    logo = logo.crop(logo.getbbox())
    lw = 760
    logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    card_w, card_h, card_y = 860, logo.height + 90, 260
    d.rounded_rectangle([(W - card_w) // 2, card_y, (W + card_w) // 2, card_y + card_h], radius=36, fill=CREAM)
    img.paste(logo, ((W - lw) // 2, card_y + 45), logo)

    rule_y = card_y + card_h + 110
    d.rectangle([W / 2 - 60, rule_y, W / 2 + 60, rule_y + 4], fill=GOLD)

    centred(d, rule_y + 70, OFFER, font("Bold", 112), CREAM)
    centred(d, rule_y + 230, PRICE, font("Medium", 50), SOFT)

    pill_text = f"COMMENT “{KEYWORD}”"
    pf = font("Bold", 58)
    tw = d.textlength(pill_text, font=pf)
    pw, ph = tw + 140, 132
    py = rule_y + 400
    d.rounded_rectangle([(W - pw) / 2, py, (W + pw) / 2, py + ph], radius=ph // 2, fill=GOLD)
    asc, desc = pf.getmetrics()
    d.text(((W - tw) / 2, py + (ph - asc - desc) / 2 + 2), pill_text, font=pf, fill=BG)

    centred(d, py + ph + 120, "WhatsApp", font("Medium", 40), SOFT)
    centred(d, py + ph + 175, WHATSAPP, font("SemiBold", 60), CREAM)

    img.save("endcard.png", optimize=True)
    print("endcard.png", img.size)


if __name__ == "__main__":
    main()
