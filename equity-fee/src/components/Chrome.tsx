import React from 'react';
import { Img, interpolate, staticFile } from 'remotion';
import { BRAND, COLORS, SAFE, SCENES, SPEAKERS, STAGE, SUBTITLES } from '../config';
import { T, clamp, condensed, ramp, sans } from '../theme';

export type Tone = 'light' | 'green';

// The supplied circular logo, scaled proportionally. The circular clip only trims the white
// JPEG matte outside the logo's own green ring.
export const Logo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', ...style }}>
    <Img src={staticFile(BRAND.logo)} style={{ width: size, height: size, display: 'block' }} />
  </div>
);

const LOGO = 104;
const TOP = SAFE.top + 6;

export const CornerLogo: React.FC<{ t: number }> = ({ t }) => {
  const out = ramp(t, SCENES.cta[0] - 0.05, 0.3);
  return <Logo size={LOGO} style={{ position: 'absolute', left: SAFE.side, top: TOP, opacity: 1 - out, boxShadow: '0 6px 18px rgba(0,0,0,0.18)' }} />;
};

export const Label: React.FC<{ tone: Tone }> = ({ tone }) => (
  <div style={{ position: 'absolute', right: SAFE.side, top: TOP + LOGO / 2 - 20, height: 40, padding: '0 18px', display: 'flex', alignItems: 'center',
    borderRadius: 20, border: `1.5px solid ${tone === 'light' ? 'rgba(86,101,95,0.45)' : 'rgba(250,248,243,0.35)'}`,
    fontFamily: sans, fontWeight: 500, fontSize: 21, letterSpacing: '0.04em', color: tone === 'light' ? COLORS.grey : 'rgba(250,248,243,0.75)' }}>{BRAND.label}</div>
);

export const FOOTER_H = 52;
export const Footer: React.FC<{ tone: Tone }> = ({ tone }) => (
  <div style={{ position: 'absolute', left: 0, right: 0, top: STAGE.height - FOOTER_H, height: FOOTER_H, display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: tone === 'green' ? '#042E24' : COLORS.green, borderTop: `2px solid ${COLORS.gold}`,
    fontFamily: sans, fontWeight: 500, fontSize: 22, letterSpacing: '0.06em', color: '#FAF8F3', whiteSpace: 'pre' }}>{BRAND.footer}</div>
);

// One line at a time, condensed sans, bottom third, with who is speaking.
export const Subtitles: React.FC<{ t: number }> = ({ t }) => {
  const cue = SUBTITLES.map((c, i) => {
    const next = SUBTITLES[i + 1];
    const from = T(c.from);
    const to = Math.min(T(c.to) + 0.25, next ? T(next.from) : Infinity);
    return { ...c, from, to };
  }).find((c) => t >= c.from && t < c.to);
  if (!cue) return null;
  const o = Math.min(interpolate(t, [cue.from, cue.from + 0.1], [0, 1], clamp), interpolate(t, [cue.to - 0.1, cue.to], [1, 0], clamp));
  const isR = cue.who === 'R';
  return (
    <div style={{ position: 'absolute', left: SAFE.side - 20, right: SAFE.side - 20, bottom: SAFE.bottom + 24, display: 'flex', flexDirection: 'column',
      alignItems: 'center', opacity: o }}>
      <div style={{ marginBottom: 10, padding: '5px 16px', borderRadius: 14, background: isR ? COLORS.loss : COLORS.gold,
        fontFamily: sans, fontWeight: 700, fontSize: 21, letterSpacing: '0.14em', color: '#FFFFFF' }}>{SPEAKERS[cue.who].toUpperCase()}</div>
      <div style={{ padding: '14px 30px 16px', borderRadius: 22, background: 'rgba(6,63,50,0.95)', boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        fontFamily: condensed, fontStretch: '78%', fontWeight: 650, fontSize: 50, lineHeight: 1.1, color: '#FFFFFF', whiteSpace: 'nowrap',
        fontVariantNumeric: 'lining-nums' }}>{cue.text}</div>
    </div>
  );
};
