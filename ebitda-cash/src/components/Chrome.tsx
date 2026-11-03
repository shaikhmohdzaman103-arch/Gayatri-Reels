import React from 'react';
import { Img, interpolate, staticFile } from 'remotion';
import { BRAND, COLORS, SAFE, SCENES, STAGE, SUBTITLES } from '../config';
import { T, clamp, ramp, sans } from '../theme';

// Which background the chrome sits on, so it can pick legible colours.
export type Tone = 'dark' | 'light' | 'green';

// The supplied logo, scaled proportionally. The circular clip only trims the white JPEG matte
// outside the logo's own green ring; the artwork itself is untouched.
export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', ...style }}>
    <Img src={staticFile(BRAND.logo)} style={{ width: size, height: size, display: 'block' }} />
  </div>
);

const LOGO = 104;
const TOP = SAFE.top + 8;

export const CornerLogo: React.FC<{ t: number }> = ({ t }) => {
  const out = ramp(t, SCENES.cta[0] - 0.05, 0.3);
  return <Logo size={LOGO} style={{ position: 'absolute', left: SAFE.side, top: TOP, opacity: 1 - out, boxShadow: '0 6px 18px rgba(0,0,0,0.18)' }} />;
};

export const Label: React.FC<{ tone: Tone }> = ({ tone }) => {
  const color = tone === 'light' ? COLORS.grey : 'rgba(250,248,243,0.72)';
  return (
    <div style={{ position: 'absolute', right: SAFE.side, top: TOP + LOGO / 2 - 20, height: 40, padding: '0 18px', display: 'flex', alignItems: 'center',
      borderRadius: 20, border: `1.5px solid ${tone === 'light' ? 'rgba(86,101,95,0.45)' : 'rgba(250,248,243,0.35)'}`,
      fontFamily: sans, fontWeight: 500, fontSize: 21, letterSpacing: '0.04em', color }}>{BRAND.label}</div>
  );
};

export const FOOTER_H = 52;
export const Footer: React.FC<{ tone: Tone }> = ({ tone }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: STAGE.height - FOOTER_H, height: FOOTER_H, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: tone === 'green' ? '#042E24' : COLORS.green, borderTop: `2px solid ${COLORS.gold}`,
    fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: '0.06em', color: '#FAF8F3', whiteSpace: 'pre' }}>{BRAND.footer}</div>
);

// Burned-in subtitles: Inter SemiBold, white on a dark-green pill, max 2 lines, bottom edge at the safe line.
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  const resolve = (k: string) => T(k);
  const cue = SUBTITLES.map((c, i) => {
    const from = resolve(c.from);
    const next = SUBTITLES[i + 1];
    const to = Math.min(resolve(c.to) + 0.25, next ? resolve(next.from) : Infinity);
    return { ...c, from, to };
  }).find((c) => t >= c.from && t < c.to);
  if (!cue) return null;
  const o = Math.min(interpolate(t, [cue.from, cue.from + 0.1], [0, 1], clamp), interpolate(t, [cue.to - 0.1, cue.to], [1, 0], clamp));
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, bottom: SAFE.bottom, display: 'flex', justifyContent: 'center', opacity: o }}>
      <div style={{ maxWidth: 920, padding: '14px 30px 16px', borderRadius: 24, background: 'rgba(6,63,50,0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        fontFamily: sans, fontWeight: 600, fontSize: 40, lineHeight: 1.25, color: '#FFFFFF', textAlign: 'center',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        fontVariantNumeric: 'tabular-nums lining-nums' }}>{cue.text}</div>
    </div>
  );
};
