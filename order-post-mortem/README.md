# Order post-mortem — LinkedIn reel (Remotion)

30 s, 1080×1350 (4:5) plus a 1080×1920 (9:16) copy and a 1080×1350 cover.
All text, numbers and timings: `src/config.ts`. Public dir: `../assets` (logo.png, fonts, vo_clean.wav, mix.wav).

| Step | Command |
|---|---|
| Arithmetic + timing check | `npm run check` |
| Preview stills | `node scripts/stills.mjs <outdir> Reel4x5 3 7.9 16.2 21.6` |
| Voice → clean → Whisper → mix | `python3 scripts/audio.py all` |
| Final render | `node scripts/render.mjs` |

Music (`assets/music.mp3`) and the loss-reveal thud (`assets/sfx/thud-el.mp3`) were generated with ElevenLabs
(flow "Order post-mortem reel — music & SFX"). Other SFX are synthesised in `scripts/audio.py`.
Whisper runs locally (faster-whisper, `small` model, CTranslate2 int8) from `.whisper-small/` (not committed).
