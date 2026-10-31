# Gayatri Business: leverage reel (Remotion)

45s, 1080×1920, 30fps H.264 reel explaining operating and financial leverage, ending on the ₹501 Discovery Call.

- **Edit text, timings, colours, subtitles:** `src/config.ts` (one file).
- **Scenes:** `src/scenes/*.tsx`, one component per scene. Shared pieces are in `src/components/`.
- **Audio:** `python3 scripts/build_audio.py assets/source/voiceover-take.mp3` writes three stems to `assets/`:
  - `voiceover.wav`: the ElevenLabs take (voice "Nishant – Professional Indian English"), cut into its 8 lines and placed on each scene
  - `music.wav`: an original 100 BPM score composed in code, so there's no copyright claim risk
  - `sfx.wav`: small sounds synced to the animations

  Remotion ducks the music to 15% under the voice. After rendering, normalise to −14 LUFS (see below).
- **Optional media:** you can also drop these into `assets/` and they're picked up automatically:
  - your own `voiceover.wav` or `music.wav` (same names replace the built stems)
  - `logo.png` (replaces the wordmark on the end card)
- **Fonts:** self-hosted in `assets/fonts` (Playfair Display and Inter, OFL), so renders don't depend on the network.

```bash
npm install
npm run studio   # live preview
npm run render   # out/gayatri-leverage-reel.mp4 (then normalise: two-pass ffmpeg loudnorm to I=-14, TP=-1.5)
npx remotion still src/index.ts Leverage out/cover.png --frame=95 --props='{"cover":true}'
```
