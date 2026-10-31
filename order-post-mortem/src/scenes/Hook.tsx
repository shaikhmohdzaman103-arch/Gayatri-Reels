import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, NUMBERS, SAFE, SCENES, TEXT } from '../config';
import { T, clamp, inr, pop, ramp, sans, serif } from '../theme';

// 0–4s: black screen, then the gold headline slams in on the first word of the voiceover.
export const Hook: React.FC<{ t: number; cover?: boolean }> = ({ t, cover }) => {
  if (!cover && t >= SCENES.hook[1] + 0.3) return null;
  const at = cover ? -10 : T('L1');
  const s = pop(t, at, 11, 220);
  const scale = interpolate(s, [0, 1], [1.55, 1]);
  const blur = interpolate(s, [0, 0.7], [14, 0], clamp);
  const under = ramp(t, at + 0.55, 0.6);
  const out = cover ? 0 : ramp(t, SCENES.hook[1] - 0.12, 0.25);
  const words = TEXT.hook.split(' ');
  // "Your biggest order / just lost you / money."
  const lines = [words.slice(0, 3).join(' '), words.slice(3, 6).join(' '), words.slice(6).join(' ')];
  return (
    <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 370, opacity: 1 - out }}>
      <div style={{ fontFamily: serif, fontSize: 104, lineHeight: 1.06, color: COLORS.gold, letterSpacing: '-0.01em',
        transform: `scale(${scale})`, transformOrigin: '0% 50%', filter: `blur(${blur}px)`, opacity: Math.min(1, s * 2) }}>
        {lines.map((l, i) => (
          <div key={i} style={{ position: 'relative', width: 'fit-content', whiteSpace: 'nowrap' }}>
            {l}
            {i === 2 && (
              <div style={{ position: 'absolute', left: 4, bottom: 6, height: 8, width: `${under * 100}%`, background: COLORS.loss, borderRadius: 4 }} />
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 46, display: 'flex', alignItems: 'center', gap: 18, opacity: ramp(t, at + 0.9, 0.5) }}>
        <div style={{ width: 64, height: 3, background: COLORS.gold }} />
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 30, letterSpacing: '0.16em', color: 'rgba(250,248,243,0.75)' }}>AN ORDER POST-MORTEM</div>
      </div>
      {cover && (
        <div style={{ marginTop: 80, display: 'inline-block', padding: '14px 30px', border: `6px solid ${COLORS.loss}`, borderRadius: 14,
          transform: 'rotate(-6deg)', fontFamily: sans, fontWeight: 800, fontSize: 64, color: COLORS.loss, letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums lining-nums' }}>
          {inr(NUMBERS.actual)} LOSS
        </div>
      )}
    </div>
  );
};
