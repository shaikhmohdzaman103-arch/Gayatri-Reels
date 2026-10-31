import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { COLORS, FOOTER_HEIGHT, FOOTER_TEXT, SAFE, SUBTITLES, TEXT, WIDTH, FPS } from '../config';
import { sans, serif } from '../theme';

// Small brand line just inside the top safe edge, on the light scenes.
export const Header: React.FC<{ dark?: boolean }> = ({ dark }) => (
  <div style={{
    position: 'absolute', top: SAFE.top + 6, left: SAFE.side, right: SAFE.side, display: 'flex', alignItems: 'center', gap: 16,
    fontFamily: sans, fontWeight: 700, fontSize: 24, letterSpacing: '0.24em', color: dark ? COLORS.gold : COLORS.muted,
  }}>
    <div style={{ width: 34, height: 3, background: COLORS.gold }} />
    {TEXT.brand}
  </div>
);

export const SceneTitle: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: 'absolute', top: 320, left: SAFE.side, right: SAFE.side, fontFamily: serif, fontWeight: 700,
    fontSize: 92, lineHeight: 1.04, color: COLORS.green, letterSpacing: '-0.01em', ...style }}>{children}</div>
);

// Thin deep-green strip on every frame.
export const Footer: React.FC = () => (
  <div style={{
    position: 'absolute', left: 0, bottom: 0, width: WIDTH, height: FOOTER_HEIGHT, background: COLORS.footer,
    borderTop: `2px solid ${COLORS.gold}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: sans, fontWeight: 600, fontSize: 25, color: COLORS.gold, whiteSpace: 'nowrap', letterSpacing: '0.01em',
  }}>{FOOTER_TEXT}</div>
);

// White-on-dark pill, one line of the script at a time, in the lower area above the safe zone.
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cue = SUBTITLES.find((c) => t >= c.from && t < c.to);
  if (!cue) return null;
  const local = (t - cue.from) * FPS;
  const p = Math.min(1, local / 6);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: 60, right: 60, bottom: 1920 - SAFE.bottom + 24, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          maxWidth: 940, padding: '20px 34px', borderRadius: 28, background: 'rgba(8,24,19,0.86)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)', textAlign: 'center',
          fontFamily: sans, fontWeight: 800, fontSize: 50, lineHeight: 1.22, color: '#FFFFFF',
          opacity: p, transform: `translateY(${(1 - p) * 14}px) scale(${0.97 + 0.03 * p})`,
        }}>{cue.text}</div>
      </div>
    </AbsoluteFill>
  );
};
