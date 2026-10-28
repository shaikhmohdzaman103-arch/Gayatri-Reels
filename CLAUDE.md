# Gayatri Business — reel production

Builds short-form video for Instagram Reels and Facebook Reels. Read this before
doing anything. Do not ask for information that is already here.

## The business

Gayatri Business (sister company of Gayatri Associates). Business-growth and
operations consultancy for Indian MSMEs. Ten years old; founder Divyansh Singh,
IIM Indore. Team: Nupur Singh (co-founder, operations), Jaya Chaudharie (client
business manager), Mohammed Zaman Shaikh (finance advisory — TCS and L&T Finance,
₹700 Cr loan portfolio, month-end close 27→23 days).

Contact: +91 88580 48888 · gayatri-business.com

## Who we are talking to

Promoters of ₹10–100 crore businesses: manufacturing, distribution, EPC,
professional services, family-owned. They have a CA for compliance and nobody
for management reporting. They decide weekly, on instinct. Tired, not stupid.
They trust people, not decks.

## Voice

Plain, specific, unsentimental. Rupee numbers, not adjectives.

BANNED: synergy, leverage, holistic, robust, variance, deep dive, paradigm,
liquidity (say "cash"), working capital cycle (say "cash stuck in the business").

Hinglish must sound spoken, not written: short sentences, contractions,
"toh", "bas", "na", "yaar". Never translated-Hindi formality.

## Offer ladder — never pitch the wrong tier

ENTRY — the video removes risk. Cost is trivial, commitment near zero.
1. Discovery Call · ₹501 incl. GST · 30 min · keyword START
2. Business Clarity Session · on request · 90-min diagnostic, issue map,
   30-day action sheet · CLARITY

PROJECTS — the video dramatises the pain. Viewer must see their own week.
3. 30-Day Fix · from ₹40,000 · one finance problem, 30 days, review meeting · FIX
4. Team Workshop · on request · half/full day, tailored, actionable · TEAM
5. Growth Strategy Sprint · on request · customer profile, offer, funnel,
   KPI dashboard, 90-day roadmap · GROWTH
6. Finance, Ops & SOP Setup · from ₹1,50,000 · process maps, controls, SOPs,
   weekly reviews · SYSTEM

ONGOING — the video shows the steady state. Calm authority, not urgency.
7. MIS Monthly · from ₹35,000/month · P&L, cash, receivables, action points,
   monthly review · CASH
8. Monthly Advisory Retainer · on request · weekly leadership call, KPI review,
   accountability · ADVISOR

The end card names ONE offer and ONE keyword. Never two.

## Five viral mechanics — every script needs all five

1. Hook inside 1.5 seconds: a private moment, not a topic.
2. One rupee number the viewer recognises as their own.
3. One reframe line worth screenshotting.
4. Visible conflict — someone is losing the argument on screen.
5. One comment keyword that earns a DM lead.

## Format

- 1080×1920, 30 fps, h264, AAC 192k, −14 LUFS.
- 30–40 seconds. Maximum 9 spoken lines. No line over 15 seconds.
- Two speakers: one who feels the problem, one who names the fix.
- Subtitles burned in, condensed sans, bottom third, one line at a time.
- One 2-second silence after the turn. No music under the first 30 seconds.
- End card 3s: logo, offer name, published price, keyword, WhatsApp.

## HeyGen constraints

- One speaker per clip. Build conversations shot-reverse-shot and cut them together.
- 5–15 seconds per `create_model_video` call.
- 9:16 vertical. Photo avatars from `brand/`.
- Nobody smiles while delivering bad news.

## Files

```
brand/     logo.png, divyansh.png, zaman.png, nupur.png, jaya.png
scripts/   NN-<keyword>.md
clips/     NN-<speaker>.mp4
reels/     NN-<keyword>.mp4
endcard.png
```

## Working rules

- Never invent a statistic. Use arithmetic the viewer can check.
- Do not name the service until the final 5 seconds.
- If a line could appear on any business page in India, rewrite it.
- Iterate the script in text before rendering. Clips cost credits; words are free.
- Before any render or ffmpeg run, show the exact command and wait for approval.
- After each phase, run /compact — polling output is noise.

## How to work on this project

1. Script first: write `scripts/NN-keyword.md`, get approval, then render.
2. Render one clip at a time, verify duration and lip-sync before the next.
3. Assemble with ffmpeg, then check six extracted frames before delivering.
