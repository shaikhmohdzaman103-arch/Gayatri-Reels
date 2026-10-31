import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header, SceneTitle } from '../components/Chrome';
import { ICONS } from '../components/Icons';
import { enter, pop, ramp, sans } from '../theme';

export const FinancialLeverage: React.FC = () => {
  const f = useCurrentFrame();
  const { title, icons, chain, note } = TEXT.financial;
  return (
    <AbsoluteFill>
      <Header />
      <SceneTitle style={enter(f, 0.05)}>{title}</SceneTitle>
      <div style={{ position: 'absolute', top: 470, left: SAFE.side, width: 936, display: 'flex', gap: 36 }}>
        {icons.map((it, i) => {
          const Icon = ICONS[it.icon as keyof typeof ICONS];
          const p = pop(f, 0.4 + i * 0.6, 13);
          return (
            <div key={it.label} style={{ flex: 1, height: 190, borderRadius: 24, background: '#FFFFFF', border: `2px solid ${COLORS.line}`,
              display: 'flex', alignItems: 'center', gap: 24, padding: '0 30px', opacity: Math.min(1, p * 1.5),
              transform: `translateX(${(1 - p) * (i === 0 ? -500 : 500)}px)` }}>
              <Icon size={110} color={COLORS.green} stroke={5} />
              <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 38, color: COLORS.green, lineHeight: 1.15 }}>{it.label}</div>
            </div>
          );
        })}
      </div>
      {chain.map((c, i) => {
        const at = 2.0 + i * 1.15;
        const p = pop(f, at, 14);
        const last = i === chain.length - 1;
        const link = ramp(f, at - 0.35, at);
        return (
          <React.Fragment key={c}>
            {i > 0 && (
              <div style={{ position: 'absolute', left: 538, top: 742 + i * 160 - 50, width: 4, height: 50 * link, background: COLORS.gold }} />
            )}
            <div style={{ position: 'absolute', left: 190, width: 700, top: 742 + i * 160, height: 110, borderRadius: 55,
              background: last ? COLORS.down : COLORS.green, color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: sans, fontWeight: 800, fontSize: 46, opacity: Math.min(1, p * 1.5), transform: `scale(${0.85 + 0.15 * p})` }}>
              {c}{last ? '  ↑' : ''}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', top: 1250, left: SAFE.side, right: SAFE.side, textAlign: 'center', fontFamily: sans, fontWeight: 700,
        fontSize: 36, color: COLORS.muted, ...enter(f, 5.4, 20) }}>{note}</div>
    </AbsoluteFill>
  );
};
