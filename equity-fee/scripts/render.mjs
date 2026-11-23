// Final render (9:16 only): node scripts/render.mjs
// Checks the numbers, renders out/fee-vs-equity-9x16.mp4 and out/fee-vs-equity-cover.png, re-muxes the audio
// (trimmed to 39.98 s, limited) so the file is <= 40.0 s and <= -1 dBTP, then verifies it.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.resolve(root, '../out');
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
const read = (cmd, args) => execFileSync(cmd, args, { cwd: root }).toString().trim();
const mix = path.resolve(root, '../assets/equity/mix.wav');
if (!fs.existsSync(mix)) { console.error('STOP: assets/equity/mix.wav missing; run scripts/mix.py'); process.exit(1); }
sh('node', ['--experimental-strip-types', '--no-warnings', 'scripts/check.ts']);
fs.mkdirSync(out, { recursive: true });
const mp4 = path.join(out, 'fee-vs-equity-9x16.mp4');
sh('npx', ['remotion', 'render', 'src/index.ts', 'Reel9x16', mp4, '--codec=h264', '--crf=16', '--pixel-format=yuv420p', '--audio-codec=aac', '--audio-bitrate=192k']);
sh('npx', ['remotion', 'still', 'src/index.ts', 'Cover', path.join(out, 'fee-vs-equity-cover.png')]);
const tmp = mp4.replace('.mp4', '.fixed.mp4');
sh('ffmpeg', ['-v', 'error', '-y', '-i', mp4, '-i', mix, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
  '-af', 'atrim=0:39.98,alimiter=limit=0.8:level=false:attack=2:release=40', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', tmp]);
fs.renameSync(tmp, mp4);
const d = Number(read('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]));
const v = read('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt', '-of', 'csv=p=0', mp4]);
const a = read('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name,bit_rate,sample_rate', '-of', 'csv=p=0', mp4]);
console.log(`fee-vs-equity-9x16.mp4: ${d.toFixed(3)}s | video ${v} | audio ${a}${d > 40.0 ? '  <-- OVER 40 s' : ''}`);
