// Recomputes every figure from src/config.ts and stops (exit 1) on any mismatch.
import { NUMBERS as N, TIMINGS, SCENES, CONTACT, DURATION_S, AUDIO } from '../src/config.ts';

const cr = (n: number) => `₹${(n / 1e7).toFixed(2)} Cr`;
let ok = true;
const eq = (label: string, got: number, want: number, fmt = cr) => {
  const pass = Math.abs(got - want) < 1e-6;
  if (!pass) ok = false;
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${label}: ${fmt(got)}${pass ? '' : `  (config says ${fmt(want)})`}`);
};
const pct = (n: number) => `${n}%`;

eq('Messy post-money valuation = 6 x profit', N.messyMultiple * N.profit, N.messyValuation);
eq('Clean post-money valuation = 8 x profit', N.cleanMultiple * N.profit, N.cleanValuation);
eq('Messy stake = 6 / 24', (N.raise / N.messyValuation) * 100, N.messyStakePct, pct);
eq('Clean stake = 6 / 32', (N.raise / N.cleanValuation) * 100, N.cleanStakePct, pct);
eq("Investor's share, messy = 25% x ₹4 Cr", (N.messyStakePct / 100) * N.profit, N.messyShare);
eq("Investor's share, clean = 18.75% x ₹4 Cr", (N.cleanStakePct / 100) * N.profit, N.cleanShare);
eq('Yearly saving', N.messyShare - N.cleanShare, N.yearlySaving);
eq('10 years of ₹1 Cr', N.messyShare * N.years, 100000000);
if (CONTACT.phone !== '+91 88580 48888' || CONTACT.site !== 'gayatri-business.com') { ok = false; console.log('FAIL contact'); }

let prev = 0;
for (const [k, [a, b]] of Object.entries(SCENES)) {
  if (a < prev - 1e-6 || b <= a || b > DURATION_S) { ok = false; console.log(`FAIL scene ${k} ${a.toFixed(2)}-${b.toFixed(2)}s`); }
  prev = b;
}
const turnSilence = TIMINGS.anchors['M4'] - TIMINGS.anchors['R3.end'];
console.log(`Silence after the turn: ${turnSilence.toFixed(2)} s`);
if (Math.abs(turnSilence - 2) > 0.05) { ok = false; console.log('FAIL turn silence is not 2 s'); }
if (TIMINGS.anchors['M5.end'] > DURATION_S - 0.3) { ok = false; console.log('FAIL dialogue runs past the end'); }
if (AUDIO.musicStart < 30) { ok = false; console.log('FAIL music before 30 s'); }
console.log(`Timings source: ${TIMINGS.source}`);
if (!ok) { console.log('\nSTOP'); process.exit(1); }
console.log('All checks passed.');
