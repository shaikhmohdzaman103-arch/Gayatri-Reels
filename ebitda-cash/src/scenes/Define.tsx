import React from 'react';
import { COLORS, SAFE, SCENES, TEXT } from '../config';
import { T, pop, ramp, sans, serif } from '../theme';

const Mark: React.FC<{ ok: boolean }> = ({ ok }) => (
  <svg width={44} height={44} viewBox="0 0 44 44">
    <circle cx={22} cy={22} r={21} fill={ok ? COLORS.profit : COLORS.loss} />
    {ok ? <path d="M13 22.5 L19.5 29 L31 16" stroke="#fff" strokeWidth={4.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      : <path d="M15 15 L29 29 M29 15 L15 29" stroke="#fff" strokeWidth={4.2} strokeLinecap="round" />}
  </svg>
);

// What EBITDA is, and what it is not.
export const Define: React.FC<{ t: number }> = ({ t }) => {
  const [start, end] = SCENES.define;
  if (t < start - 0.1 || t > end + 0.35) return null;
  const at = T('L2');
  const enter = ramp(t, start - 0.05, 0.4);
  const out = ramp(t, end - 0.1, 0.3);
  const { word, parts, shows, hides } = TEXT.define;
  const card = (i: number, ok: boolean, [k, v]: readonly string[]) => {
    const p = pop(t, at + (ok ? 1.1 : 2.2), 14);
    return (
      <div style={{ flex: 1, padding: '26px 28px', borderRadius: 22, background: ok ? '#FFFFFF' : 'rgba(192,80,77,0.07)',
        border: `2px solid ${ok ? COLORS.line : 'rgba(192,80,77,0.35)'}`, boxShadow: ok ? '0 14px 34px rgba(6,63,50,0.08)' : 'none',
        opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 40}px)` }} key={i}>
        <Mark ok={ok} />
        <div style={{ marginTop: 16, fontFamily: sans, fontWeight: 600, fontSize: 22, letterSpacing: '0.14em', color: COLORS.grey }}>{k.toUpperCase()}</div>
        <div style={{ marginTop: 8, fontFamily: serif, fontSize: 42, lineHeight: 1.12, color: ok ? COLORS.green : COLORS.loss }}>{v}</div>
      </div>
    );
  };
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out) }}>
      <div style={{ position: 'absolute', left: SAFE.side, top: 262, fontFamily: serif, fontSize: 132, lineHeight: 1, color: COLORS.green, letterSpacing: '0.02em' }}>
        {word.split('').map((ch, i) => (
          <span key={i} style={{ color: ramp(t, start + 0.15 + i * 0.12, 0.25) > 0.5 ? COLORS.gold : COLORS.green }}>{ch}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 430, display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 14, columnGap: 30 }}>
        {parts.map(([l, w], i) => {
          const p = ramp(t, start + 0.15 + i * 0.12, 0.35);
          return (
            <div key={l + w} style={{ display: 'flex', alignItems: 'baseline', gap: 14, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
              <span style={{ fontFamily: serif, fontSize: 48, color: COLORS.gold, width: 34 }}>{l}</span>
              <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 38, color: COLORS.ink }}>{w}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 690, display: 'flex', gap: 24 }}>
        {card(0, true, shows)}
        {card(1, false, hides)}
      </div>
    </div>
  );
};
