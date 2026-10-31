# Voiceover script: "Your biggest order just lost you money"

Record this in your own voice and save it as `assets/vo.wav` (WAV, 44.1 or 48 kHz, mono or stereo).
The whole read must finish in **under 29 seconds**. It will not be sped up.

**How to record**
- Use a quiet room with soft furnishings, phone or mic about 15 cm from your mouth, no fan or AC noise.
- Leave 1 second of silence before you start. The script trims it.
- Pause briefly (about half a second) at every line break below. The pauses are where the screen changes.
- Say the numbers as written. The video uses the words to time each number on screen.

| # | Target time | Say |
|---|---|---|
| 1 | 0.3 – 2.7 s | Your biggest order just lost you money. |
| 2 | 4.1 – 7.8 s | Ten-lakh order. Twelve percent margin. One lakh twenty thousand profit. Deal closed. |
| 3 | 8.2 – 9.4 s | Now, the post-mortem. |
| 4 | 9.7 – 11.6 s | Scheme to win it: fifty thousand. |
| 5 | 11.9 – 13.5 s | Freight: twenty-five thousand. |
| 6 | 13.8 – 16.9 s | Hundred and twenty days' credit at twelve percent: thirty-nine thousand five hundred. |
| 7 | 17.2 – 18.7 s | Returns: twenty thousand. |
| 8 | 19.2 – 22.5 s | Add it up. That order lost fourteen thousand five hundred rupees. |
| 9 | 23.1 – 25.8 s | Do you know which of your top ten customers make you money? |
| 10 | 26.2 – 29.5 s | Book a five-hundred-and-one rupee Discovery Call with Divyansh. |

Total: 76 words, about 2.6 words a second, which is a brisk but natural boardroom pace.
Lines 1 and 2 need the longest pause between them (about 1.3 s): the screen holds the black hook.

**Then run** (from `order-post-mortem/`):

```bash
python3 scripts/audio.py all
```

```bash
node scripts/render.mjs
```

`audio.py all` cleans the voice (80 Hz high-pass, afftdn nf=−25, light compression, −14 LUFS / −1 dBTP), keeps your
original `vo.wav`, runs Whisper locally for word timings, rewrites the TIMINGS block in `src/config.ts`,
re-checks the arithmetic, and builds `assets/mix.wav` (voice + ElevenLabs music bed at −24 LUFS + SFX).
