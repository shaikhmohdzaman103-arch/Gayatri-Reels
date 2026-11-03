// Recomputes every figure from src/config.ts and stops (exit 1) on any mismatch.
import { NUMBERS, TIMINGS, SCENES, CONTACT, DURATION_S } from '../src/config.ts';

const cr = (n: number) => `₹${(n / 1e7).toFixed(2)} Cr`;
let ok = true;
const expect = (label: string, got: number, want: number) => {
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`${pass ? 'OK  ' : 'FAIL'} ${label}: ${cr(got)}${pass ? '' : `  (config says ${cr(want)})`}`);
};

const out = NUMBERS.steps.reduce((s, x) => s + x.amount, 0);
console.log(`${cr(NUMBERS.ebitda)} − ${NUMBERS.steps.map((s) => cr(s.amount)).join(' − ')} = ${cr(NUMBERS.ebitda - out)}`);
expect('Cash from operations', NUMBERS.ebitda - out, NUMBERS.ocf);
expect('Gap (EBITDA − cash)', NUMBERS.ebitda - NUMBERS.ocf, NUMBERS.gap);
expect('Gap = sum of the four steps', out, NUMBERS.gap);
if (CONTACT.phone !== '+91 88580 48888' || CONTACT.site !== 'gayatri-business.com') { ok = false; console.log('FAIL contact details'); }

// Scenes must be in order, non-empty, and inside the reel.
let prev = 0;
for (const [k, [a, b]] of Object.entries(SCENES)) {
  if (a < prev - 1e-6 || b <= a || b > DURATION_S) { ok = false; console.log(`FAIL scene ${k} window ${a.toFixed(2)}-${b.toFixed(2)}s`); }
  prev = b;
}
const last = TIMINGS.anchors['L10.end'];
if (last > DURATION_S - 0.8) { ok = false; console.log(`FAIL narration ends at ${last}s; needs to end by ${DURATION_S - 0.8}s`); }
console.log(`Timings source: ${TIMINGS.source}`);
if (!ok) { console.log('\nSTOP: numbers or timings do not match.'); process.exit(1); }
console.log('All checks passed.');
