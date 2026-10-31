# Gayatri Business: leverage reel (Remotion)

45s, 1080×1920, 30fps H.264 reel explaining operating and financial leverage, ending on the ₹501 Discovery Call.

- **Edit text, timings, colours, subtitles:** `src/config.ts` (one file).
- **Scenes:** `src/scenes/*.tsx`, one component per scene. Shared pieces are in `src/components/`.
- **Optional media:** drop these into `assets/` and they're picked up automatically:
  - `voiceover.mp3`
  - `music.mp3` (ducks to 15% while the voiceover speaks)
  - `logo.png` (replaces the wordmark on the end card)
- **Fonts:** self-hosted in `assets/fonts` (Playfair Display and Inter, OFL), so renders don't depend on the network.

```bash
npm install
npm run studio   # live preview
npm run render   # out/gayatri-leverage-reel.mp4
npx remotion still src/index.ts Leverage out/cover.png --frame=95 --props='{"cover":true}'
```
