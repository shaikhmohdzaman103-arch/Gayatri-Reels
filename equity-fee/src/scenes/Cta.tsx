import React from 'react';
import { COLORS, CONTACT, SAFE, SCENES, TEXT } from '../config';
import { Logo } from '../components/Chrome';
import { T, pop, ramp, sans, serif } from '../theme';

const Tick: React.FC = () => (
  <svg width={34} height={34} viewBox="0 0 34 34"><circle cx={17} cy={17} r={16} fill={COLORS.gold} />
    <path d="M10 17.5 L15 22.5 L24.5 12" stroke={COLORS.green} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// End card: logo, offer name, published price, keyword, WhatsApp.
export const Cta: React.FC<{ t: number }> = ({ t }) => {
  const [start] = SCENES.cta;
  if (t < start - 0.05) return null;
  const { offer, price, ticks, keyword, keywordLead, whatsapp } = TEXT.cta;
  const logo = pop(t, start + 0.1, 14);
  const name = ramp(t, T('M5'), 0.45);
  const pr = pop(t, T('price'), 13, 200);
  const kw = pop(t, T('keyword') - 0.15, 11, 200);
  const info = ramp(t, T('price') + 0.8, 0.4);
  const pulse = t > T('keyword') + 0.8 ? 1 + 0.02 * Math.max(0, Math.sin((t - T('keyword')) * 4.5)) : 1;
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 300, display: 'flex', justifyContent: 'center' }}>
        <Logo size={300} style={{ opacity: Math.min(1, logo * 1.5), transform: `scale(${0.85 + 0.15 * logo})`, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }} />
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 660, textAlign: 'center', opacity: name, transform: `translateY(${(1 - name) * 20}px)` }}>
        <div style={{ fontFamily: serif, fontSize: 72, lineHeight: 1.08, color: '#FAF8F3' }}>{offer}</div>
        <div style={{ marginTop: 14, fontFamily: sans, fontWeight: 800, fontSize: 62, color: COLORS.gold, fontVariantNumeric: 'tabular-nums lining-nums',
          opacity: Math.min(1, pr * 2), transform: `scale(${0.85 + 0.15 * Math.min(1, pr)})` }}>{price}</div>
        <div style={{ marginTop: 26, display: 'flex', justifyContent: 'center', gap: 34, opacity: ramp(t, T('price') + 0.4, 0.4) }}>
          {ticks.map((x) => (
            <div key={x} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: sans, fontWeight: 600, fontSize: 30, color: 'rgba(250,248,243,0.9)' }}><Tick />{x}</div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1010, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '26px 54px', borderRadius: 22, background: COLORS.gold, fontFamily: sans, fontWeight: 800, fontSize: 60, color: COLORS.green,
          boxShadow: '0 18px 44px rgba(0,0,0,0.3)', opacity: Math.min(1, kw * 1.6), transform: `scale(${(0.82 + 0.18 * kw) * pulse})`, whiteSpace: 'nowrap' }}>
          {keywordLead} <span style={{ letterSpacing: '0.08em' }}>{keyword}</span></div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 1190, textAlign: 'center', opacity: info, transform: `translateY(${(1 - info) * 16}px)` }}>
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 34, color: 'rgba(250,248,243,0.85)' }}>{whatsapp} {CONTACT.name}</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 58, color: COLORS.gold, marginTop: 6, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums lining-nums' }}>{CONTACT.phone}</div>
        <div style={{ marginTop: 14, fontFamily: sans, fontWeight: 600, fontSize: 36, color: '#FAF8F3' }}>{CONTACT.site}</div>
      </div>
    </div>
  );
};
