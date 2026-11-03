import React from 'react';
import { COLORS, CONTACT, SAFE, SCENES, TEXT } from '../config';
import { Logo } from '../components/Chrome';
import { pop, ramp, sans, serif } from '../theme';

// Green end card: logo, the promise, the ₹501 Discovery Call, website and contact.
export const Cta: React.FC<{ t: number }> = ({ t }) => {
  const [start] = SCENES.cta;
  if (t < start - 0.05) return null;
  const logo = pop(t, start + 0.15, 14);
  const lead = ramp(t, start + 0.4, 0.45);
  const box = pop(t, start + 0.75, 12, 200);
  const pulse = t > start + 1.6 ? 1 + 0.018 * Math.max(0, Math.sin((t - start - 1.6) * 4.2)) : 1;
  const info = ramp(t, start + 1.2, 0.45);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center' }}>
        <Logo size={250} style={{ opacity: Math.min(1, logo * 1.5), transform: `scale(${0.85 + 0.15 * logo})`, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }} />
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 446, textAlign: 'center', fontFamily: serif, fontSize: 52, lineHeight: 1.15,
        color: '#FAF8F3', opacity: lead, transform: `translateY(${(1 - lead) * 20}px)` }}>{TEXT.cta.lead.map((l) => <div key={l}>{l}</div>)}</div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 620, display: 'flex', justifyContent: 'center' }}>
        <div style={{ padding: '28px 48px', borderRadius: 20, background: COLORS.gold, fontFamily: sans, fontWeight: 800, fontSize: 52,
          color: COLORS.green, whiteSpace: 'nowrap', boxShadow: '0 18px 44px rgba(0,0,0,0.3)',
          opacity: Math.min(1, box * 1.6), transform: `scale(${(0.82 + 0.18 * box) * pulse})` }}>{TEXT.cta.button}</div>
      </div>
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: 800, textAlign: 'center', opacity: info, transform: `translateY(${(1 - info) * 20}px)` }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 44, color: '#FAF8F3' }}>{CONTACT.site}</div>
        <div style={{ width: 80, height: 3, background: COLORS.gold, margin: '24px auto' }} />
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 34, color: 'rgba(250,248,243,0.85)' }}>Call / WhatsApp {CONTACT.name}:</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 54, color: COLORS.gold, marginTop: 8, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums lining-nums' }}>{CONTACT.phone}</div>
      </div>
    </div>
  );
};
