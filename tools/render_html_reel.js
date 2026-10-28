// Render an HTML page that exposes window.seek(t) into an H.264 video, frame by frame.
// Usage: node tools/render_html_reel.js <page.html> <seconds> <out.mp4> [fps]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const [page, seconds, out, fpsArg] = process.argv.slice(2);
  const fps = parseInt(fpsArg || '30', 10);
  const frames = Math.round(parseFloat(seconds) * fps);
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);

  const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c === 0 ? res() : rej(new Error('ffmpeg exit ' + c)))));

  for (let i = 0; i < frames; i++) {
    await p.evaluate(t => window.seek(t), i / fps);
    const buf = await p.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
  }
  ff.stdin.end();
  await done;
  await browser.close();
  console.log(`wrote ${out}: ${frames} frames`);
})();
