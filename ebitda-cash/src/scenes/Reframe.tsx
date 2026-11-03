import React from 'react';
import { COLORS, SAFE, SCENES, TEXT } from '../config';
import { T, pop, ramp, serif } from '../theme';

// The line worth a screenshot, alone on deep green.
export const Reframe: React.FC<{ t: number; still?: boolean }> = ({ t, still }) => {
  const [start, end] = SCENES.reframe;
  if (!still && (t < start - 0.1 || t > end + 0.35)) return null;
  const tt = still ? 999 : t;
  const a = pop(tt, T('L8'), 16, 160);
  const b = pop(tt, T('oxygen'), 14, 170);
  const rule = ramp(tt, T('oxygen') + 0.3, 0.6);
  const out = still ? 0 : ramp(t, end - 0.1, 0.3);
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 390, opacity: 1 - out }}>
      <div style={{ fontFamily: serif, fontSize: 92, lineHeight: 1.08, color: '#FAF8F3', opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - a) * 30}px)` }}>
        {TEXT.reframe[0]}
      </div>
      <div style={{ marginTop: 34, fontFamily: serif, fontSize: 112, lineHeight: 1.04, color: COLORS.gold, opacity: Math.min(1, b * 1.5), transform: `translateY(${(1 - b) * 30}px)` }}>
        {TEXT.reframe[1]}
      </div>
      <div style={{ marginTop: 48, width: 160 * rule, height: 4, background: COLORS.gold, borderRadius: 2 }} />
    </div>
  );
};
