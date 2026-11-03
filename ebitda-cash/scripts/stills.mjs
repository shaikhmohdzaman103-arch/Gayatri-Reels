// Renders preview stills: node scripts/stills.mjs <outdir> <comp> <sec> [sec...]
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';

const [outDir, compId, ...secs] = process.argv.slice(2);
const root = path.resolve(import.meta.dirname, '..');
const browserExecutable = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, '../assets') });
const composition = await selectComposition({ serveUrl, id: compId, browserExecutable });
for (const s of secs.length ? secs : ['0']) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps));
  const output = path.join(outDir, `${compId}-${String(s).replace('.', '_')}s.png`);
  await renderStill({ serveUrl, composition, frame, output, browserExecutable, imageFormat: 'png' });
  console.log(output);
}
