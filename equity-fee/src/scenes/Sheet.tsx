import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, SCENES, TEXT } from '../config';
import { T, clamp, pop, ramp, sans, serif, tnum } from '../theme';

// The term sheet on the desk, the pen hovering, then the investor's due-diligence notes.
const CARD = { left: 110, top: 400, width: 860 };

const Pen: React.FC<{ t: number }> = ({ t }) => {
  const bob = Math.sin(t * 3.2) * 10;
  return (
    <svg width={260} height={90} viewBox="0 0 260 90" style={{ position: 'absolute', left: 560, top: 905 + bob, transform: 'rotate(-18deg)', overflow: 'visible' }}>
      <path d="M8 45 L36 34 L36 56 Z" fill={COLORS.ink} />
      <rect x={36} y={32} width={46} height={26} rx={4} fill={COLORS.gold} />
      <rect x={82} y={30} width={150} height={30} rx={14} fill={COLORS.green} />
      <rect x={120} y={22} width={84} height={8} rx={4} fill={COLORS.gold} />
    </svg>
  );
};

export const Sheet: React.FC<{ t: number }> = ({ t }) => {
  const end = SCENES.sheet[1];
  if (t > end + 0.35) return null;
  const enter = pop(t, 0.05, 15, 160);
  const out = ramp(t, end - 0.1, 0.3);
  const pct = pop(t, T('pct'), 10, 220);
  const six = pop(t, T('six'), 12, 220);
  const { rows } = TEXT.sheet;
  const row = (label: string, value: React.ReactNode, i: number, extra?: React.ReactNode) => (
    <div key={label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '22px 0', borderTop: i ? `2px solid ${COLORS.line}` : 'none' }}>
      <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 32, color: COLORS.grey }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>{extra}{value}</span>
    </div>
  );
  const notes = TEXT.notes.map((n, i) => ({ n, at: T(`note${i + 1}`) }));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - out }}>
      <div style={{ position: 'absolute', ...CARD, padding: '40px 48px 44px', borderRadius: 26, background: '#FFFFFF',
        boxShadow: '0 30px 70px rgba(6,63,50,0.16)', transform: `translateY(${(1 - enter) * 160}px) rotate(${-1.2 * enter}deg)`, opacity: Math.min(1, enter * 1.5) }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: '0.26em', color: COLORS.gold }}>{TEXT.sheet.title.toUpperCase()}</span>
          <span style={{ padding: '4px 14px', borderRadius: 12, border: `1.5px solid ${COLORS.line}`, fontFamily: sans, fontSize: 20, color: COLORS.grey }}>DRAFT</span>
        </div>
        <div style={{ fontFamily: serif, fontSize: 46, color: COLORS.ink, marginTop: 8, marginBottom: 10 }}>{TEXT.sheet.sub}</div>
        {row(rows.investment[0], <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 60, color: COLORS.ink, ...tnum }}>{rows.investment[1]}</span>, 0)}
        {row(rows.valuation[0], <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 60, color: COLORS.ink, ...tnum }}>{rows.valuation[1]}</span>, 1,
          <span style={{ padding: '4px 14px', borderRadius: 12, background: COLORS.loss, fontFamily: sans, fontWeight: 700, fontSize: 24, color: '#fff',
            opacity: Math.min(1, six * 2), transform: `scale(${interpolate(six, [0, 1], [1.6, 1])})` }}>only {rows.valuation[2]}</span>)}
        {row(rows.equity[0], <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 96, color: pct > 0 ? COLORS.loss : COLORS.ink, ...tnum,
          display: 'inline-block', transform: `scale(${1 + 0.18 * Math.sin(Math.PI * Math.min(1, pct))})` }}>{rows.equity[1]}</span>, 2)}
        <div style={{ marginTop: 40, borderTop: `3px solid ${COLORS.ink}`, width: 420 }} />
        <div style={{ marginTop: 10, fontFamily: sans, fontSize: 22, letterSpacing: '0.12em', color: COLORS.grey }}>{TEXT.sheet.sign.toUpperCase()}</div>
      </div>
      <div style={{ opacity: Math.min(1, enter * 1.5) }}><Pen t={t} /></div>
      {/* due-diligence notes */}
      <div style={{ position: 'absolute', left: 80, top: 1112, opacity: ramp(t, notes[0].at - 0.3, 0.3), fontFamily: sans, fontWeight: 700, fontSize: 22,
        letterSpacing: '0.2em', color: COLORS.loss }}>{TEXT.notesTitle.toUpperCase()}</div>
      {notes.map(({ n, at }, i) => {
        const p = pop(t, at, 12, 200);
        return (
          <div key={n} style={{ position: 'absolute', left: 80 + i * 312, top: 1160, width: 290, minHeight: 170, padding: '22px 22px', borderRadius: 10,
            background: COLORS.note, borderTop: `8px solid ${COLORS.loss}`, boxShadow: '0 14px 30px rgba(6,63,50,0.16)',
            fontFamily: sans, fontWeight: 700, fontSize: 34, lineHeight: 1.18, color: COLORS.ink,
            opacity: Math.min(1, p * 2), transform: `rotate(${[-3, 2, -2][i]}deg) scale(${interpolate(p, [0, 1], [1.4, 1])})` }}>
            <span style={{ color: COLORS.loss }}>✗ </span>{n}
          </div>
        );
      })}
    </div>
  );
};
