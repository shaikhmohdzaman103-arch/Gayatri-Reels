import React from 'react';
import { COLORS, SAFE, SCENES, TEXT } from '../config';
import { T, pop, ramp, sans, serif } from '../theme';

const Warn: React.FC = () => (
  <svg width={64} height={58} viewBox="0 0 64 58">
    <path d="M32 4 L60 54 H4 Z" fill={COLORS.loss} stroke={COLORS.loss} strokeWidth={6} strokeLinejoin="round" />
    <path d="M32 21 V37" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
    <circle cx={32} cy={46} r={3.6} fill="#fff" />
  </svg>
);

// Three warning signs that cash is getting stuck.
export const Signs: React.FC<{ t: number }> = ({ t }) => {
  const [start, end] = SCENES.signs;
  if (t < start - 0.1 || t > end + 0.35) return null;
  const enter = ramp(t, start - 0.05, 0.4);
  const out = ramp(t, end - 0.1, 0.3);
  const { title, sub, items } = TEXT.signs;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out) }}>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 268 }}>
        <div style={{ fontFamily: serif, fontSize: 84, lineHeight: 1.04, color: COLORS.green }}>{title}</div>
        <div style={{ marginTop: 14, fontFamily: sans, fontWeight: 500, fontSize: 32, color: COLORS.grey }}>{sub}</div>
      </div>
      {items.map((it, i) => {
        const p = pop(t, T(`sign${i + 1}`), 14, 200);
        return (
          <div key={it.text} style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 500 + i * 170, height: 146, borderRadius: 24,
            background: '#FFFFFF', border: `2px solid ${COLORS.line}`, boxShadow: '0 14px 30px rgba(6,63,50,0.07)', display: 'flex', alignItems: 'center',
            gap: 28, padding: '0 34px', opacity: Math.min(1, p * 1.6), transform: `translateX(${(1 - p) * 70}px)` }}>
            <Warn />
            <div>
              <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 40, color: COLORS.ink, lineHeight: 1.15 }}>{it.text}</div>
              <div style={{ marginTop: 8, display: 'inline-block', padding: '4px 14px', borderRadius: 14, background: 'rgba(192,80,77,0.1)',
                fontFamily: sans, fontWeight: 600, fontSize: 24, color: COLORS.loss }}>{it.tag}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
