// Recomputes every figure from src/config.ts and stops (exit 1) if anything disagrees.
// Run: node --experimental-strip-types scripts/check.ts
import { NUMBERS, TIMINGS, SCENES, ANCHORS, VO_LINES, CONTACT, TEXT } from '../src/config.ts';

const inr = (n: number) => {
  const s = Math.abs(n).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return (n < 0 ? '−' : '') + (rest ? rest + ',' + last3 : last3);
};

let ok = true;
const expect = (label: string, got: number, want: number) => {
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${label}: ${inr(got)}${pass ? '' : `  (config says ${inr(want)})`}`);
};

const { order, marginPct, costs } = NUMBERS;
expect('Profit = order x margin', Math.round((order * marginPct) / 100), NUMBERS.profit);
for (const c of costs) {
  if ('pct' in c && c.pct !== undefined) expect(`${c.label} = ${c.pct}% of order`, Math.round((order * c.pct) / 100), c.amount);
  if ('days' in c && c.days !== undefined) {
    const exact = (order * (c.ratePct as number) * c.days) / 100 / 365;
    const rounded = Math.round(exact / 500) * 500;
    console.log(`     interest: ${inr(order)} x ${c.ratePct}% x ${c.days}/365 = ${inr(Math.round(exact))}, shown rounded to nearest 500`);
    expect(`${c.label}`, rounded, c.amount);
  }
}
const total = costs.reduce((s, c) => s + c.amount, 0);
console.log(`\n${costs.map((c) => inr(c.amount)).join(' + ')} = ${inr(total)}`);
expect('Total hidden cost', total, NUMBERS.totalCost);
const actual = NUMBERS.profit - total;
console.log(`${inr(NUMBERS.profit)} − ${inr(total)} = ${inr(actual)}`);
expect('Actual result', actual, NUMBERS.actual);

// The on-screen strings must agree with the numbers.
if (!TEXT.verdict.stamp1.includes(inr(NUMBERS.actual).replace('−', '−₹'))) { ok = false; console.log('FAIL verdict stamp text does not match the actual result'); }
if (CONTACT.phone !== '+91 88580 48888') { ok = false; console.log('FAIL phone number'); }
if (CONTACT.site !== 'gayatri-business.com') { ok = false; console.log('FAIL site'); }

// Every anchor must land inside its scene window.
const sceneOfAnchor: Record<string, keyof typeof SCENES> = {};
let currentScene: keyof typeof SCENES = 'hook';
for (const a of ANCHORS) {
  const line = VO_LINES.find((l) => l.id === a.key);
  if (line) currentScene = line.scene;
  sceneOfAnchor[a.key] = currentScene;
}
for (const l of VO_LINES) sceneOfAnchor[`${l.id}.end`] = l.scene;
for (const [k, t] of Object.entries(TIMINGS.anchors)) {
  const [a, b] = SCENES[sceneOfAnchor[k]];
  if (t < a || t > b) { ok = false; console.log(`FAIL anchor ${k} at ${t}s is outside its scene ${sceneOfAnchor[k]} (${a}-${b}s)`); }
}
console.log(`\nTimings source: ${TIMINGS.source}`);
if (!ok) { console.log('\nSTOP: numbers or timings do not match.'); process.exit(1); }
console.log('All checks passed.');
