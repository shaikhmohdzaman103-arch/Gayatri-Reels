import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header, SceneTitle } from '../components/Chrome';
import { ICONS } from '../components/Icons';
import { enter, pop, sans, serifItalic } from '../theme';

export const FixedCosts: React.FC = () => {
  const f = useCurrentFrame();
  const { title, subtitle, items, stamp } = TEXT.fixedCosts;
  const s = pop(f, 3.9, 11);
  return (
    <AbsoluteFill>
      <Header />
      <SceneTitle style={enter(f, 0.1)}>{title}:</SceneTitle>
      <div style={{ position: 'absolute', top: 422, left: SAFE.side, fontFamily: serifItalic, fontStyle: 'italic', fontWeight: 600, fontSize: 64, color: COLORS.gold, ...enter(f, 0.35) }}>{subtitle}</div>
      {items.map((it, i) => {
        const Icon = ICONS[it.icon as keyof typeof ICONS];
        const p = pop(f, 0.7 + i * 0.9, 13);
        return (
          <div key={it.label} style={{
            position: 'absolute', left: SAFE.side, width: 936, top: 580 + i * 196, height: 172, borderRadius: 24,
            background: '#FFFFFF', border: `2px solid ${COLORS.line}`, boxShadow: '0 14px 30px rgba(6,63,50,0.07)',
            display: 'flex', alignItems: 'center', gap: 34, padding: '0 40px',
            opacity: Math.min(1, p * 1.5), transform: `translateX(${(1 - p) * 700}px)`,
          }}>
            <div style={{ width: 112, height: 112, borderRadius: 24, background: COLORS.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={80} color={COLORS.gold} stroke={5.5} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 54, color: COLORS.green }}>{it.label}</div>
              <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 30, color: COLORS.muted, marginTop: 4 }}>{it.note}</div>
            </div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.12em', color: COLORS.gold }}>FIXED</div>
          </div>
        );
      })}
      <div style={{
        position: 'absolute', left: SAFE.side, width: 936, top: 1190, padding: '24px 30px', borderRadius: 20, background: COLORS.green,
        fontFamily: sans, fontWeight: 700, fontSize: 38, color: '#FFFFFF', textAlign: 'center',
        opacity: Math.min(1, s * 1.4), transform: `scale(${0.9 + 0.1 * s})`,
      }}>{stamp}</div>
    </AbsoluteFill>
  );
};
