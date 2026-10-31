import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header, SceneTitle } from '../components/Chrome';
import { Check } from '../components/Icons';
import { enter, pop, ramp, sans } from '../theme';

export const Takeaway: React.FC = () => {
  const f = useCurrentFrame();
  const { title, items } = TEXT.takeaway;
  return (
    <AbsoluteFill>
      <Header />
      <SceneTitle style={enter(f, 0.05)}>{title}</SceneTitle>
      {items.map((it, i) => {
        const at = 0.5 + i * 1.2;
        const row = pop(f, at, 15);
        const tick = pop(f, at + 0.35, 10);
        const strike = ramp(f, at + 0.35, at + 0.7);
        return (
          <div key={it} style={{ position: 'absolute', left: SAFE.side, width: 936, top: 560 + i * 230, minHeight: 190, borderRadius: 26,
            background: '#FFFFFF', border: `2px solid ${strike > 0.5 ? COLORS.gold : COLORS.line}`, display: 'flex', alignItems: 'center', gap: 30,
            padding: '24px 34px', opacity: Math.min(1, row * 1.5), transform: `translateX(${(1 - row) * 80}px)` }}>
            <div style={{ flex: '0 0 auto', width: 110, height: 110, borderRadius: 55, background: strike > 0.5 ? COLORS.green : 'transparent',
              border: `4px solid ${COLORS.green}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ transform: `scale(${tick})` }}><Check size={84} color={COLORS.gold} stroke={9} /></div>
            </div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 48, lineHeight: 1.18, color: COLORS.green }}>{it}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
