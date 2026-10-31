import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, getStaticFiles } from 'remotion';
import { COLORS, CONTACT, MEDIA, SAFE, TEXT } from '../config';
import { enter, pop, sans, serif } from '../theme';

const hasLogo = () => getStaticFiles().some((f) => f.name === MEDIA.logo);

export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const btn = pop(f, 0.9, 11);
  const pulse = f > 50 ? 1 + 0.025 * Math.sin((f - 50) / 6) : 1;
  return (
    <AbsoluteFill style={{ background: COLORS.green }}>
      <div style={{ position: 'absolute', top: SAFE.top + 40, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', ...enter(f, 0.05, 20) }}>
        {hasLogo() ? (
          <Img src={staticFile(MEDIA.logo)} style={{ height: 120 }} />
        ) : (
          <>
            <div style={{ width: 70, height: 3, background: COLORS.gold, marginBottom: 22 }} />
            <div style={{ fontFamily: serif, fontWeight: 700, fontSize: 64, letterSpacing: '0.12em', color: COLORS.gold }}>{TEXT.brand}</div>
            <div style={{ width: 70, height: 3, background: COLORS.gold, marginTop: 22 }} />
          </>
        )}
      </div>
      <div style={{ position: 'absolute', top: 540, left: SAFE.side, right: SAFE.side, textAlign: 'center', fontFamily: serif, fontWeight: 800,
        fontSize: 96, whiteSpace: 'nowrap', color: '#FFFFFF', lineHeight: 1.04, ...enter(f, 0.35) }}>{TEXT.cta.headline}</div>
      <div style={{ position: 'absolute', top: 720, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '30px 52px', borderRadius: 22, background: COLORS.gold, fontFamily: sans, fontWeight: 800, fontSize: 52,
          color: COLORS.green, boxShadow: '0 18px 50px rgba(0,0,0,0.3)', opacity: Math.min(1, btn * 1.4),
          transform: `scale(${(0.8 + 0.2 * btn) * pulse})` }}>{TEXT.cta.button}</div>
      </div>
      <div style={{ position: 'absolute', top: 900, left: 0, right: 0, textAlign: 'center', fontFamily: sans, fontWeight: 600, fontSize: 44,
        color: COLORS.gold, letterSpacing: '0.02em', ...enter(f, 1.4, 20) }}>{CONTACT.site}</div>
      <div style={{ position: 'absolute', top: 1010, left: SAFE.side, right: SAFE.side, textAlign: 'center', ...enter(f, 1.8, 30) }}>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 44, color: '#FFFFFF' }}>{TEXT.cta.callLabel}</div>
        <div style={{ marginTop: 10, fontFamily: sans, fontWeight: 900, fontSize: 92, color: '#FFFFFF', letterSpacing: '0.01em' }}>{CONTACT.phone}</div>
      </div>
    </AbsoluteFill>
  );
};
