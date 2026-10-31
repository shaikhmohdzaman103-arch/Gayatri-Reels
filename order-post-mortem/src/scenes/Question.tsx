import React from 'react';
import { COLORS, SAFE, SCENES, TEXT } from '../config';
import { T, pop, ramp, sans, serif } from '../theme';

// 23–26s: the question for the owner / CXO, over ten unlabelled customer bars.
const BARS = [100, 86, 74, 63, 55, 47, 40, 34, 29, 25]; // sales rank, illustrative shape only

export const Question: React.FC<{ t: number }> = ({ t }) => {
  const [start, end] = SCENES.question;
  if (t < start - 0.1 || t > end + 0.3) return null;
  const at = Math.min(T('L9'), start + 0.15);
  const enter = ramp(t, start - 0.05, 0.45);
  const out = ramp(t, end - 0.1, 0.25);
  const { before, em, after } = TEXT.question;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out) }}>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 300, fontFamily: serif, fontSize: 84, lineHeight: 1.08,
        color: COLORS.green, transform: `translateY(${(1 - enter) * 30}px)` }}>
        {before}<span style={{ color: COLORS.gold }}>{em}</span>{after}
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 720, height: 300, display: 'flex', alignItems: 'flex-end', gap: 22 }}>
        {BARS.map((h, i) => {
          const p = ramp(t, at + 0.25 + i * 0.07, 0.4);
          const q = pop(t, at + 0.9 + i * 0.09, 12, 220);
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <div style={{ fontFamily: serif, fontSize: 44, color: COLORS.gold, opacity: Math.min(1, q * 2), transform: `scale(${q})`, marginBottom: 8 }}>?</div>
              <div style={{ width: '100%', height: h * 1.9 * p, borderRadius: '10px 10px 0 0', background: i === 0 ? COLORS.green : 'rgba(6,63,50,0.22)' }} />
              <div style={{ marginTop: 10, fontFamily: sans, fontWeight: 600, fontSize: 20, color: COLORS.grey, fontVariantNumeric: 'tabular-nums' }}>#{i + 1}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
