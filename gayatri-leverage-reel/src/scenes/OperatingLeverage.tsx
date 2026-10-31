import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header, SceneTitle } from '../components/Chrome';
import { enter, pop, sans } from '../theme';

// One arrow; `dir` 1 = up, -1 = down. Grows from its base with a short overshoot.
const Arrow: React.FC<{ dir: 1 | -1; color: string; p: number; h: number; w?: number }> = ({ dir, color, p, h, w = 64 }) => (
  <svg width={w + 40} height={h} viewBox={`0 0 ${w + 40} ${h}`} style={{ overflow: 'visible', transform: dir === -1 ? 'scaleY(-1)' : undefined }}>
    <g style={{ transformOrigin: `50% ${h}px`, transform: `scaleY(${p})` }}>
      <rect x={20 + w / 2 - w / 6} y={w * 0.75} width={w / 3} height={h - w * 0.75} rx={6} fill={color} />
      <path d={`M20 ${w * 0.8} L${20 + w / 2} 0 L${20 + w} ${w * 0.8} Z`} fill={color} />
    </g>
  </svg>
);

const Panel: React.FC<{ x: number; dir: 1 | -1; color: string; tint: string; at: number; tag: string; sales: string; ebit: string }> =
  ({ x, dir, color, tint, at, tag, sales, ebit }) => {
    const f = useCurrentFrame();
    const show = pop(f, at, 16);
    const a1 = pop(f, at + 0.3, 12);
    const a2 = pop(f, at + 0.9, 9, 0.9);
    const shake = f > (at + 1.1) * 30 && f < (at + 1.6) * 30 ? Math.sin(f * 2.2) * 4 : 0;
    return (
      <div style={{ position: 'absolute', left: x, top: 520, width: 450, height: 800, borderRadius: 28, background: tint,
        border: `3px solid ${color}`, opacity: Math.min(1, show * 1.4), transform: `translateY(${(1 - show) * 60}px)` }}>
        <div style={{ marginTop: 30, textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 30, letterSpacing: '0.16em', color }}>{tag.toUpperCase()}</div>
        <div style={{ position: 'absolute', top: 110, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 64, color: COLORS.green }}>{sales}</span>
          <Arrow dir={dir} color={color} p={a1} h={96} w={44} />
        </div>
        <div style={{ position: 'absolute', top: 250, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 64, color: COLORS.muted }}>↓</div>
        <div style={{ position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          transform: `translateX(${shake}px)` }}>
          <span style={{ fontFamily: sans, fontWeight: 900, fontSize: 74, color: COLORS.green, marginRight: 6 }}>{ebit}</span>
          <Arrow dir={dir} color={color} p={a2} h={290} w={70} />
          <Arrow dir={dir} color={color} p={pop(f, at + 1.05, 9, 0.9)} h={290} w={70} />
        </div>
      </div>
    );
  };

export const OperatingLeverage: React.FC = () => {
  const f = useCurrentFrame();
  const { title, left, right, note } = TEXT.operating;
  return (
    <AbsoluteFill>
      <Header />
      <SceneTitle style={enter(f, 0.05)}>{title}</SceneTitle>
      <Panel x={SAFE.side} dir={1} color={COLORS.up} tint="rgba(46,139,87,0.07)" at={0.4} tag={left.tag} sales={left.sales} ebit={left.ebit} />
      <Panel x={558} dir={-1} color={COLORS.down} tint="rgba(192,80,77,0.07)" at={2.6} tag={right.tag} sales={right.sales} ebit={right.ebit} />
      <div style={{ position: 'absolute', top: 1340, left: SAFE.side, right: SAFE.side, textAlign: 'center', fontFamily: sans, fontWeight: 700,
        fontSize: 36, color: COLORS.muted, ...enter(f, 4.9, 20) }}>{note}</div>
    </AbsoluteFill>
  );
};
