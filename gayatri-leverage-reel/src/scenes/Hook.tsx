import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { COLORS, SAFE, TEXT } from '../config';
import { Header } from '../components/Chrome';
import { pop, ramp, sans, serif, serifItalic } from '../theme';

const BASE = 300;   // bar height before growth
const FLOOR = 1300; // bar baseline (y)

const Bar: React.FC<{ x: number; growth: number; p: number; color: string; label: string }> = ({ x, growth, p, color, label }) => {
  const extra = BASE * (growth / 100) * p * 2.2; // growth exaggerated x2.2 so 10% vs 30% reads at a glance
  return (
    <div style={{ position: 'absolute', left: x, width: 230, top: 0, bottom: 0 }}>
      <div style={{ position: 'absolute', bottom: 1920 - FLOOR, width: 230, height: BASE, background: COLORS.green, opacity: 0.16, borderRadius: '10px 10px 0 0' }} />
      <div style={{ position: 'absolute', bottom: 1920 - FLOOR + BASE, width: 230, height: extra, background: color, borderRadius: '10px 10px 0 0' }} />
      <div style={{ position: 'absolute', bottom: 1920 - FLOOR + BASE + extra + 14, width: 230, textAlign: 'center',
        fontFamily: sans, fontWeight: 800, fontSize: 56, color }}>+{Math.round(growth * p)}%</div>
      <div style={{ position: 'absolute', top: FLOOR + 16, width: 230, textAlign: 'center', fontFamily: sans, fontWeight: 700, fontSize: 34, color: COLORS.muted }}>{label}</div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const salesP = ramp(f, 0.5, 1.6);
  const profitP = ramp(f, 1.1, 2.6);
  const how = pop(f, 2.6);
  return (
    <AbsoluteFill>
      <Header />
      <div style={{ position: 'absolute', top: 330, left: SAFE.side, right: SAFE.side, fontFamily: serif, fontWeight: 800, fontSize: 112, lineHeight: 1.02, color: COLORS.green }}>
        <div>{TEXT.hook.lines[0]}</div>
        <div>Profit up <span style={{ color: COLORS.gold }}>30%.</span></div>
        <div style={{ fontFamily: serifItalic, fontStyle: 'italic', color: COLORS.gold, opacity: how, transform: `translateX(${(1 - how) * -30}px)` }}>{TEXT.hook.question}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: FLOOR, height: 3, background: COLORS.line, marginLeft: SAFE.side, width: 936 }} />
      <Bar x={250} growth={TEXT.hook.salesGrowth} p={salesP} color={COLORS.up} label={TEXT.hook.salesLabel} />
      <Bar x={600} growth={TEXT.hook.profitGrowth} p={profitP} color={COLORS.gold} label={TEXT.hook.profitLabel} />
      <div style={{ position: 'absolute', left: 250, top: FLOOR - BASE - 2, width: 580, borderTop: `2px dashed ${COLORS.muted}`,
        opacity: interpolate(f, [10, 20], [0, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
    </AbsoluteFill>
  );
};
