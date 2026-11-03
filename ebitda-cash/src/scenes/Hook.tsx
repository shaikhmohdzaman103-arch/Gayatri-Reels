import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, NUMBERS, SAFE, SCENES, TEXT } from '../config';
import { T, clamp, cr, pop, ramp, sans, serif, tnum } from '../theme';

// Black screen. EBITDA counts up, cash counts up to much less, then the question and a red bracket.
export const Hook: React.FC<{ t: number; cover?: boolean }> = ({ t, cover }) => {
  if (!cover && t >= SCENES.hook[1] + 0.3) return null;
  const tt = cover ? 99 : t;
  const a1 = T('L1'), a2 = T('cash'), a3 = T('gap');
  const e = ramp(tt, a1, 0.9);
  const c = ramp(tt, a2, 0.9);
  const q = pop(tt, a3, 13, 200);
  const br = ramp(tt, a3 + 0.1, 0.45);
  const out = cover ? 0 : ramp(t, SCENES.hook[1] - 0.15, 0.3);
  const row = (label: string, value: string, p: number, color: string, top: number) => (
    <div style={{ position: 'absolute', left: SAFE.side, top, opacity: Math.min(1, p * 2.5), transform: `translateY(${(1 - Math.min(1, p * 2)) * 24}px)` }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: '0.14em', color: 'rgba(250,248,243,0.62)' }}>{label.toUpperCase()}</div>
      <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 150, lineHeight: 1.05, letterSpacing: '-0.03em', color, ...tnum }}>{value}</div>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - out }}>
      <div style={{ position: 'absolute', left: SAFE.side, top: 282, display: 'flex', alignItems: 'center', gap: 16, opacity: ramp(tt, 0, 0.4) }}>
        <div style={{ width: 54, height: 3, background: COLORS.gold }} />
        <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 26, letterSpacing: '0.22em', color: COLORS.gold }}>{TEXT.hook.kicker.toUpperCase()}</span>
      </div>
      {row(TEXT.hook.ebitdaLabel, cr(NUMBERS.ebitda * e), e, COLORS.gold, 360)}
      {row(TEXT.hook.cashLabel, cr(NUMBERS.ocf * c), c, '#FAF8F3', 610)}
      {/* red bracket joining the two numbers */}
      <svg style={{ position: 'absolute', left: 870, top: 470, overflow: 'visible' }} width={120} height={270}>
        <path d={`M0 0 H60 V${250 * br} ${br > 0.98 ? 'H0' : ''}`} stroke={COLORS.loss} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={br > 0 ? 1 : 0} />
      </svg>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 880, fontFamily: serif, fontSize: 74, lineHeight: 1.1, color: '#FAF8F3',
        opacity: Math.min(1, q * 2), transform: `translateY(${interpolate(q, [0, 1], [30, 0], clamp)}px)` }}>
        {TEXT.hook.question[0]}<span style={{ color: COLORS.loss, fontFamily: sans, fontWeight: 800, ...tnum }}>{cr(NUMBERS.gap)}</span>{TEXT.hook.question[1]}
      </div>
    </div>
  );
};
