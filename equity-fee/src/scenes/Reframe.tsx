import React from 'react';
import { COLORS, SAFE, SCENES, TEXT } from '../config';
import { T, pop, ramp, serif } from '../theme';

// The line worth a screenshot, alone on deep green.
export const Reframe: React.FC<{ t: number }> = ({ t }) => {
  const [start, end] = SCENES.reframe;
  if (t < start - 0.1 || t > end + 0.35) return null;
  const a = pop(t, T('M4'), 16, 160);
  const b = pop(t, T('equity'), 14, 170);
  const rule = ramp(t, T('equity') + 0.3, 0.6);
  const out = ramp(t, end - 0.1, 0.3);
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 620, opacity: 1 - out }}>
      <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.06, color: '#FAF8F3', opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - a) * 30}px)` }}>{TEXT.reframe[0]}</div>
      <div style={{ marginTop: 40, fontFamily: serif, fontSize: 118, lineHeight: 1.04, color: COLORS.gold, opacity: Math.min(1, b * 1.5), transform: `translateY(${(1 - b) * 30}px)` }}>{TEXT.reframe[1]}</div>
      <div style={{ marginTop: 52, width: 180 * rule, height: 5, background: COLORS.gold, borderRadius: 3 }} />
    </div>
  );
};
