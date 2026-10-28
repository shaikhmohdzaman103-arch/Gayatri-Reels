// Usage: node tools/snap_html.js <page.html> <outdir> t1 t2 ...   (writes <outdir>/t<sec>.png)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [page, outdir, ...times] = process.argv.slice(2);
  const browser = await chromium.launch();
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(page));
  await p.evaluate(() => document.fonts.ready);
  for (const t of times) {
    await p.evaluate(x => window.seek(x), parseFloat(t));
    await p.screenshot({ path: `${outdir}/t${t}.png` });
  }
  await browser.close();
})();
