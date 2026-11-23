import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, NUMBERS, SCENES, TEXT, SAFE } from '../config';
import { T, clamp, pop, ramp, sans, serif, tnum } from '../theme';

// What 25% costs: the slice, the yearly share, and ten years of it.
const CX = 540, CY = 790, R = 250;
const arc = (a0: number, a1: number, r = R) => {
  const p = (a: number) => [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  const [x0, y0] = p(a0), [x1, y1] = p(a1);
  return `M${CX} ${CY} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${x1} ${y1} Z`;
};

export const Pie: React.FC<{ t: number }> = ({ t }) => {
  const [start, end] = SCENES.pie;
  if (t < start - 0.1 || t > end + 0.35) return null;
  const enter = ramp(t, start - 0.05, 0.45);
  const out = ramp(t, end - 0.1, 0.3);
  const slice = pop(t, T('pie'), 11, 200);
  const sweep = Math.PI * 2 * 0.25 * Math.min(1, slice);
  const push = 34 * Math.min(1, slice);
  const four = ramp(t, T('four'), 0.4);
  const one = pop(t, T('oneCr'), 12, 220);
  const every = T('every');
  const mid = Math.PI * 0.25; // middle of the investor's slice
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out) }}>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 400, fontFamily: serif, fontSize: 70, color: COLORS.green, textAlign: 'center' }}>
        {TEXT.pie.title}</div>
      <svg width={1080} height={1100} style={{ position: 'absolute', left: 0, top: 0 }}>
        <path d={arc(Math.PI * 0.5, Math.PI * 2.0)} fill={COLORS.green} />
        <path d={arc(0, Math.PI * 0.5)} fill={COLORS.green} opacity={1 - Math.min(1, slice)} />
        <g transform={`translate(${push * Math.sin(mid)} ${-push * Math.cos(mid)})`}>
          {sweep > 0.01 && <path d={arc(0, sweep)} fill={COLORS.gold} />}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 370, top: 860, fontFamily: sans, fontWeight: 800, fontSize: 40, color: '#FAF8F3' }}>{TEXT.pie.you}</div>
      <div style={{ position: 'absolute', left: 630, top: 600, fontFamily: sans, fontWeight: 800, fontSize: 34, color: COLORS.green,
        opacity: Math.min(1, slice * 2) }}>{TEXT.pie.investor}</div>
      {/* yearly share */}
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1090, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ opacity: four }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.16em', color: COLORS.grey }}>{TEXT.pie.profit[0].toUpperCase()}</div>
          <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: COLORS.ink, ...tnum }}>{TEXT.pie.profit[1]}</div>
        </div>
        <div style={{ textAlign: 'right', opacity: Math.min(1, one * 2), transform: `scale(${interpolate(one, [0, 1], [1.3, 1])})`, transformOrigin: '100% 50%' }}>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.16em', color: COLORS.grey }}>{TEXT.pie.share[0].toUpperCase()}</div>
          <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 60, color: COLORS.loss, ...tnum }}>{TEXT.pie.share[1]}</div>
        </div>
      </div>
      {/* ten years */}
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1240, display: 'flex', gap: 8 }}>
        {Array.from({ length: NUMBERS.years }).map((_, i) => {
          const p = ramp(t, every - 0.2 + i * 0.05, 0.12);
          return (
            <div key={i} style={{ flex: 1, height: 64, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: p > 0.5 ? COLORS.loss : 'rgba(6,63,50,0.08)', color: p > 0.5 ? '#fff' : COLORS.grey,
              fontFamily: sans, fontWeight: 700, fontSize: 20, transform: `scale(${0.9 + 0.1 * p})` }}>Y{i + 1}</div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1318, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 32,
        color: COLORS.loss, opacity: interpolate(t, [every + 0.35, every + 0.6], [0, 1], clamp) }}>{TEXT.pie.years}</div>
    </div>
  );
};
