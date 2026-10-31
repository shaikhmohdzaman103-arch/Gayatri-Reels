// Final render: node scripts/render.mjs
// Refuses to run without assets/mix.wav (the cleaned voiceover mix), then renders
// out/order-post-mortem-4x5.mp4, out/order-post-mortem-9x16.mp4 and out/cover.png and verifies them.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.resolve(root, '../out');
const sh = (cmd, args) => execFileSync(cmd, args, { cwd: root, stdio: 'inherit' });
const read = (cmd, args) => execFileSync(cmd, args, { cwd: root }).toString().trim();

const musicOnly = process.argv.includes('--music-only');
if (!fs.existsSync(path.resolve(root, '../assets/mix.wav')) && !(musicOnly && fs.existsSync(path.resolve(root, '../assets/mix_music_only.wav')))) {
  console.error('STOP: assets/mix.wav is missing. Run `python3 scripts/audio.py all` after saving assets/vo.wav.');
  process.exit(1);
}
sh('node', ['--experimental-strip-types', '--no-warnings', 'scripts/check.ts']);
fs.mkdirSync(out, { recursive: true });
const common = ['--codec=h264', '--crf=16', '--pixel-format=yuv420p', '--audio-codec=aac', '--audio-bitrate=320k'];
for (const [id, file] of [['Reel4x5', 'order-post-mortem-4x5.mp4'], ['Reel9x16', 'order-post-mortem-9x16.mp4']]) {
  sh('npx', ['remotion', 'render', 'src/index.ts', id, path.join(out, file), ...common]);
}
sh('npx', ['remotion', 'still', 'src/index.ts', 'Cover', path.join(out, 'cover.png')]);

// AAC pads the last audio frame (30.016 s) and adds a little inter-sample overshoot.
// Re-mux the audio from the WAV mix: trimmed to 29.98 s and limited so the file is <= 30.0 s and <= -1 dBTP.
const mixWav = path.resolve(root, '../assets', fs.existsSync(path.resolve(root, '../assets/mix.wav')) ? 'mix.wav' : 'mix_music_only.wav');
for (const f of ['order-post-mortem-4x5.mp4', 'order-post-mortem-9x16.mp4']) {
  const p = path.join(out, f), tmp = p.replace('.mp4', '.fixed.mp4');
  sh('ffmpeg', ['-v', 'error', '-y', '-i', p, '-i', mixWav, '-map', '0:v', '-map', '1:a', '-c:v', 'copy',
    '-af', 'atrim=0:29.98,alimiter=limit=0.84:level=false:attack=3:release=40,volume=0.15dB',
    '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', tmp]);
  fs.renameSync(tmp, p);
}

for (const f of ['order-post-mortem-4x5.mp4', 'order-post-mortem-9x16.mp4']) {
  const p = path.join(out, f);
  const d = Number(read('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]));
  const v = read('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,pix_fmt', '-of', 'csv=p=0', p]);
  const a = read('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=codec_name,bit_rate,sample_rate', '-of', 'csv=p=0', p]);
  console.log(`${f}: ${d.toFixed(3)}s | video ${v} | audio ${a}${d > 30.0 ? '  <-- OVER 30 s' : ''}`);
}
