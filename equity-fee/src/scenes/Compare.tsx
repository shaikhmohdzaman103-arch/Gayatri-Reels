import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, SAFE, SCENES, TEXT } from '../config';
import { T, pop, ramp, sans, serif, tnum } from '../theme';

// Same company, same ₹6 Cr: messy books vs clean books. Then the turn, and the silence.
export const Compare: React.FC<{ t: number }> = ({ t }) => {
  const [start, end] = SCENES.compare;
  if (t < start - 0.1 || t > end + 0.35) return null;
  const enter = ramp(t, start - 0.05, 0.45);
  const out = ramp(t, end - 0.1, 0.3);
  const { title, left, right, rows, saving, loan } = TEXT.compare;
  const reveal = [T('eight'), T('stake'), T('stake') + 0.7];
  const turn = pop(t, T('R3'), 12, 200);
  const loanP = ramp(t, T('R3.end') + 0.35, 0.5);
  const COLW = 430;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out) }}>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 400, fontFamily: serif, fontSize: 70, color: COLORS.green, textAlign: 'center' }}>{title}</div>
      {/* column headers */}
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 530, display: 'flex', justifyContent: 'space-between' }}>
        {[left, right].map((h, i) => (
          <div key={h} style={{ width: COLW, padding: '16px 10px', borderRadius: 16, textAlign: 'center', background: i ? COLORS.green : 'rgba(192,80,77,0.1)',
            fontFamily: sans, fontWeight: 700, fontSize: 28, color: i ? '#FAF8F3' : COLORS.loss }}>{h}</div>
        ))}
      </div>
      {rows.map(([label, l, r], i) => {
        const p = pop(t, reveal[i], 13, 210);
        const top = 660 + i * 165;
        return (
          <div key={label} style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top }}>
            <div style={{ textAlign: 'center', fontFamily: sans, fontWeight: 600, fontSize: 24, letterSpacing: '0.14em', color: COLORS.grey }}>{label.toUpperCase()}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <div style={{ width: COLW, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 60, color: COLORS.loss, ...tnum }}>{l}</div>
              <div style={{ width: COLW, textAlign: 'center', fontFamily: sans, fontWeight: 900, fontSize: 64, color: COLORS.profit, ...tnum,
                opacity: Math.min(1, p * 2), transform: `scale(${interpolate(p, [0, 1], [1.4, 1])})` }}>{r}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1170, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '18px 36px', borderRadius: 40, background: COLORS.gold, fontFamily: sans, fontWeight: 800, fontSize: 40, color: COLORS.green,
          opacity: Math.min(1, turn * 2), transform: `scale(${interpolate(turn, [0, 1], [0.7, 1])})` }}>{saving}</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1285, textAlign: 'center', fontFamily: serif, fontSize: 56, color: COLORS.green,
        opacity: loanP, transform: `translateY(${(1 - loanP) * 20}px)` }}>{loan}</div>
    </div>
  );
};
