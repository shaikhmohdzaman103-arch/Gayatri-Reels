import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header, SceneTitle } from '../components/Chrome';
import { enter, pop, ramp, sans, serif, sec } from '../theme';
import { RightArrow } from '../components/Icons';

export const DolFormula: React.FC = () => {
  const f = useCurrentFrame();
  const { title, formula, example, result, resultValue, note } = TEXT.dol;
  // The formula types itself in over 1.4s.
  const chars = Math.floor(interpolate(f, [sec(0.4), sec(1.8)], [0, formula.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }));
  const caret = f < sec(2.1) && Math.floor(f / 8) % 2 === 0;
  const [lhs, rhs] = formula.split(' = ');
  const typed = formula.slice(0, chars);
  const count = ramp(f, 2.7, 3.7);
  const card = pop(f, 2.0, 14);
  return (
    <AbsoluteFill>
      <Header />
      <SceneTitle style={{ fontSize: 76, ...enter(f, 0.05) }}>{title}</SceneTitle>
      <div style={{ position: 'absolute', top: 520, left: SAFE.side, width: 936, minHeight: 230, padding: '34px 40px', borderRadius: 24,
        background: COLORS.green, color: '#FFFFFF', fontFamily: sans, fontWeight: 700, fontSize: 58, lineHeight: 1.3, whiteSpace: 'pre-line' }}>
        <span style={{ color: COLORS.gold }}>{typed.slice(0, Math.min(typed.length, lhs.length))}</span>
        {typed.length > lhs.length ? typed.slice(lhs.length) : ''}
        <span style={{ opacity: caret ? 1 : 0, color: COLORS.gold }}>|</span>
        <span style={{ display: 'none' }}>{rhs}</span>
      </div>
      <div style={{ position: 'absolute', top: 820, left: SAFE.side, width: 936, padding: '36px 40px', borderRadius: 24, background: '#FFFFFF',
        border: `2px solid ${COLORS.line}`, boxShadow: '0 14px 30px rgba(6,63,50,0.07)',
        opacity: Math.min(1, card * 1.4), transform: `translateY(${(1 - card) * 50}px)` }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 26, letterSpacing: '0.18em', color: COLORS.muted }}>EXAMPLE</div>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 22, fontFamily: sans, fontWeight: 800, fontSize: 46, color: COLORS.green }}>
          <span style={{ color: COLORS.up }}>{example[0]}</span><RightArrow /><span style={{ color: COLORS.up }}>{example[1]}</span>
        </div>
        <div style={{ marginTop: 22, fontFamily: serif, fontWeight: 800, fontSize: 120, color: COLORS.green, lineHeight: 1 }}>
          {result}<span style={{ color: COLORS.gold }}>{Math.max(1, Math.round(resultValue * count))}</span>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 1270, left: SAFE.side, right: SAFE.side, fontFamily: sans, fontWeight: 700, fontSize: 36,
        color: COLORS.muted, ...enter(f, 3.9, 20) }}>{note}</div>
    </AbsoluteFill>
  );
};
