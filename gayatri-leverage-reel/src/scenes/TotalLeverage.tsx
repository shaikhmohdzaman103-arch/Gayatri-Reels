import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header, SceneTitle } from '../components/Chrome';
import { enter, pop, ramp, sans, serif } from '../theme';

const NODE_W = [240, 200, 300];
const GAP = 98;

export const TotalLeverage: React.FC = () => {
  const f = useCurrentFrame();
  const { title, nodes, links, formula, example, exampleNote } = TEXT.total;
  const total = NODE_W.reduce((a, b) => a + b, 0) + GAP * 2;
  let x = (1080 - total) / 2;
  const xs = NODE_W.map((w) => { const at = x; x += w + GAP; return at; });
  const f2 = pop(f, 3.3, 13);
  return (
    <AbsoluteFill>
      <Header />
      <SceneTitle style={enter(f, 0.05)}>{title}</SceneTitle>
      {nodes.map((n, i) => {
        const lit = ramp(f, 0.5 + i * 0.95, 0.85 + i * 0.95);
        const p = pop(f, 0.2 + i * 0.15, 14);
        return (
          <div key={n} style={{ position: 'absolute', left: xs[i], top: 560, width: NODE_W[i], height: 150, borderRadius: 22,
            background: interpolate(lit, [0, 1], [0, 1]) > 0.5 ? COLORS.gold : '#FFFFFF',
            border: `3px solid ${lit > 0.5 ? COLORS.gold : COLORS.line}`, boxShadow: lit > 0.5 ? '0 16px 40px rgba(201,151,43,0.35)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
            fontFamily: sans, fontWeight: 900, fontSize: 38, letterSpacing: '0.04em', color: COLORS.green, lineHeight: 1.1,
            opacity: Math.min(1, p * 1.5), transform: `scale(${(0.9 + 0.1 * p) * (1 + 0.06 * Math.sin(lit * Math.PI))})` }}>{n}</div>
        );
      })}
      {links.map((l, i) => {
        const p = ramp(f, 0.75 + i * 0.95, 1.2 + i * 0.95);
        const left = xs[i] + NODE_W[i] + 10;
        return (
          <div key={l} style={{ position: 'absolute', left, top: 560, width: GAP - 20, height: 150 }}>
            <div style={{ position: 'absolute', top: 30, width: '100%', textAlign: 'center', fontFamily: sans, fontWeight: 800, fontSize: 28,
              color: COLORS.gold, opacity: p }}>{l}</div>
            <div style={{ position: 'absolute', top: 76, left: 0, width: `${p * 100}%`, height: 5, background: COLORS.gold, borderRadius: 3 }} />
            <div style={{ position: 'absolute', top: 64, right: -6, width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent',
              borderLeft: `20px solid ${COLORS.gold}`, opacity: p > 0.95 ? 1 : 0 }} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', top: 830, left: SAFE.side, right: SAFE.side, textAlign: 'center', fontFamily: serif, fontWeight: 800,
        fontSize: 100, whiteSpace: 'nowrap', color: COLORS.green, opacity: Math.min(1, f2 * 1.4), transform: `scale(${0.85 + 0.15 * f2})` }}>
        DTL = <span style={{ color: COLORS.gold }}>DOL × DFL</span>
      </div>
      <div style={{ position: 'absolute', top: 1050, left: 150, right: 150, padding: '26px 30px', borderRadius: 22, background: COLORS.green,
        textAlign: 'center', ...enter(f, 4.4, 30) }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 46, color: COLORS.gold }}>{example}</div>
        <div style={{ marginTop: 8, fontFamily: sans, fontWeight: 600, fontSize: 32, color: '#FFFFFF' }}>{exampleNote}</div>
      </div>
      <span style={{ display: 'none' }}>{formula}</span>
    </AbsoluteFill>
  );
};
