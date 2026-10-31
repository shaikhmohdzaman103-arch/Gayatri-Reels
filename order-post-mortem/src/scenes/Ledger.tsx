import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, NUMBERS, SCENES, TEXT } from '../config';
import { T, clamp, inr, mix, pop, ramp, sans, serif, tnum } from '../theme';

// 4–23s as one continuous piece: the invoice (celebration), the flip into a receipt
// (post-mortem), and the verdict stamp. One component so nothing jumps between scenes.

const CARD = { left: 160, top: 300, width: 760 };
const PAPER = { left: 80, top: 286, width: 620 };
const METER = { left: 744, top: 300, width: 256 };
const HEADER_H = 206;
const LINE_H = 86;
const TOTAL_H = 96;

const count = (t: number, at: number, dur: number, to: number) => to * ramp(t, at, dur);

// ── Celebration card ──────────────────────────────────────────────────────────
const Row: React.FC<{ label: string; value: string; show: number; big?: boolean; color?: string }> = ({ label, value, show, big, color }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', height: big ? 128 : 92,
    opacity: Math.min(1, show * 1.5), transform: `translateY(${(1 - show) * 24}px)` }}>
    <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 32, color: COLORS.grey }}>{label}</span>
    <span style={{ fontFamily: sans, fontWeight: 800, fontSize: big ? 104 : 62, color: color ?? COLORS.ink, letterSpacing: '-0.02em', ...tnum }}>{value}</span>
  </div>
);

const Invoice: React.FC<{ t: number }> = ({ t }) => {
  const enter = ramp(t, SCENES.celebration[0] - 0.05, 0.45);
  const closed = T('closed');
  const stamp = pop(t, closed, 11, 260);
  const bump = 1 + 0.025 * Math.sin(Math.PI * ramp(t, closed, 0.35));
  const rays = ramp(t, closed + 0.04, 0.55);
  const pill = pop(t, closed + 0.12, 14);
  const order = count(t, T('L2'), 0.45, NUMBERS.order);
  const profit = count(t, T('profit'), 0.9, NUMBERS.profit);
  return (
    <>
      <div style={{ position: 'absolute', ...CARD, padding: '40px 48px 34px', borderRadius: 28, background: '#FFFFFF',
        boxShadow: `0 30px 70px rgba(6,63,50,0.16), 0 0 0 ${stamp > 0 ? 3 : 0}px rgba(201,151,43,${0.55 * (1 - rays)})`,
        opacity: enter, transform: `translateY(${(1 - enter) * 60}px) scale(${bump})` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 22, letterSpacing: '0.24em', color: COLORS.gold }}>{TEXT.invoice.title.toUpperCase()}</span>
          <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, color: COLORS.grey }}>Your biggest customer</span>
        </div>
        <div style={{ height: 2, background: COLORS.line, margin: '22px 0 10px' }} />
        <Row label={TEXT.invoice.orderLabel} value={inr(order)} show={ramp(t, T('L2') - 0.05, 0.35)} />
        <Row label={TEXT.invoice.marginLabel} value={`${NUMBERS.marginPct}%`} show={ramp(t, T('margin') - 0.05, 0.35)} />
        <div style={{ height: 2, background: COLORS.line, margin: '6px 0 4px' }} />
        <Row label={TEXT.invoice.profitLabel} value={inr(profit)} show={ramp(t, T('profit') - 0.05, 0.3)} big color={COLORS.profit} />
      </div>
      {/* gold burst behind the stamp */}
      <svg style={{ position: 'absolute', left: 612, top: 630, overflow: 'visible' }} width={300} height={300}>
        {Array.from({ length: 14 }).map((_, i) => {
          const a = (i / 14) * Math.PI * 2;
          const r0 = 90 + rays * 60, r1 = 110 + rays * 120;
          return <line key={i} x1={150 + Math.cos(a) * r0} y1={150 + Math.sin(a) * r0} x2={150 + Math.cos(a) * r1} y2={150 + Math.sin(a) * r1}
            stroke={COLORS.gold} strokeWidth={4} strokeLinecap="round" opacity={rays > 0 && rays < 1 ? 1 - rays : 0} />;
        })}
      </svg>
      <div style={{ position: 'absolute', left: 640, top: 722, padding: '6px 26px 2px', border: `9px solid ${COLORS.profit}`, borderRadius: 18,
        fontFamily: sans, fontWeight: 900, fontSize: 92, letterSpacing: '0.12em', color: COLORS.profit, background: 'rgba(255,255,255,0.78)',
        opacity: Math.min(1, stamp * 3), transform: `rotate(-12deg) scale(${interpolate(stamp, [0, 1], [2.4, 1])})` }}>{TEXT.invoice.stamp}</div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 900, display: 'flex', justifyContent: 'center',
        opacity: Math.min(1, pill * 2), transform: `translateY(${(1 - pill) * 30}px)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 30px', borderRadius: 40, background: COLORS.green }}>
          <svg width={34} height={34} viewBox="0 0 34 34"><circle cx={17} cy={17} r={16} fill={COLORS.gold} />
            <path d="M10 17.5 L15 22.5 L24.5 12" stroke={COLORS.green} strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, color: '#FAF8F3' }}>{TEXT.invoice.kicker}: <span style={{ color: COLORS.gold }}>{TEXT.invoice.kickerNote}</span></span>
        </div>
      </div>
    </>
  );
};

// ── Receipt ───────────────────────────────────────────────────────────────────
const zigzag = (w: number, h = 16, n = 24) => {
  const step = w / n;
  let d = `M0 0 H${w} V${h * 0.2}`;
  for (let i = n; i > 0; i--) d += ` L${(i - 0.5) * step} ${h} L${(i - 1) * step} ${h * 0.2}`;
  return d + ' Z';
};

const Receipt: React.FC<{ t: number }> = ({ t }) => {
  const lines = NUMBERS.costs.map((c, i) => ({ ...c, at: T(`L${i + 4}`), amtAt: T(`amt${i + 1}`) }));
  const printed = lines.reduce((s, l) => s + ramp(t, l.at, 0.32), 0);
  const totalShow = ramp(t, T('L8'), 0.32);
  const paperH = HEADER_H + printed * LINE_H + totalShow * TOTAL_H + 26;
  const strike = ramp(t, T('L8') + 0.35, 0.4);
  return (
    <div style={{ position: 'absolute', left: PAPER.left - 20, top: PAPER.top - 30, width: PAPER.width + 40 }}>
      {/* printer slot */}
      <div style={{ height: 34, borderRadius: 17, background: COLORS.green, boxShadow: '0 8px 18px rgba(6,63,50,0.25)', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'absolute', left: 30, right: 30, top: 15, height: 4, borderRadius: 2, background: '#021F18' }} />
      </div>
      <div style={{ margin: '-14px 20px 0', position: 'relative', height: paperH + 16, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: paperH, background: '#FFFFFF',
          boxShadow: '0 22px 50px rgba(6,63,50,0.14)' }} />
        <svg style={{ position: 'absolute', left: 0, top: paperH - 1 }} width={PAPER.width} height={16}>
          <path d={zigzag(PAPER.width)} fill="#FFFFFF" />
        </svg>
        <div style={{ position: 'absolute', left: 38, right: 38, top: 36 }}>
          <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, letterSpacing: '0.26em', color: COLORS.loss }}>{TEXT.receipt.title.toUpperCase()}</div>
          <div style={{ fontFamily: serif, fontSize: 44, color: COLORS.ink, marginTop: 6 }}>
            {TEXT.receipt.sub}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 18 }}>
            <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 28, color: COLORS.grey }}>{TEXT.receipt.booked}</span>
            <span style={{ position: 'relative', fontFamily: sans, fontWeight: 800, fontSize: 42, color: mix(COLORS.profit, COLORS.grey, strike * 0.7), ...tnum }}>
              {inr(NUMBERS.profit)}
              <span style={{ position: 'absolute', left: -6, top: '52%', height: 6, borderRadius: 3, width: `${strike * 108}%`, background: COLORS.loss,
                transform: 'rotate(-5deg)', transformOrigin: '0 50%' }} />
            </span>
          </div>
          <div style={{ borderTop: `2px dashed ${COLORS.line}`, marginTop: 18 }} />
          {lines.map((l, i) => {
            const p = ramp(t, l.at, 0.32);
            const a = pop(t, l.amtAt, 14, 240);
            return (
              <div key={l.key} style={{ height: LINE_H, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
                opacity: p, transform: `translateY(${(1 - p) * -18}px)` }}>
                <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 27, lineHeight: 1.18, color: COLORS.ink, maxWidth: 330 }}>{l.label}</span>
                <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 38, color: COLORS.loss, whiteSpace: 'nowrap', ...tnum,
                  opacity: Math.min(1, a * 2), transform: `scale(${interpolate(a, [0, 1], [1.5, 1])})`, transformOrigin: '100% 50%' }}>
                  {inr(-l.amount)}</span>
              </div>
            );
          })}
          <div style={{ opacity: totalShow }}>
            <div style={{ borderTop: `3px solid ${COLORS.ink}`, marginTop: 6 }} />
            <div style={{ height: TOTAL_H - 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: sans, fontWeight: 700, fontSize: 28, color: COLORS.ink }}>Hidden costs</span>
              <span style={{ fontFamily: sans, fontWeight: 800, fontSize: 40, color: COLORS.loss, ...tnum }}>{inr(-NUMBERS.totalCost)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Profit-left meter ─────────────────────────────────────────────────────────
const TRACK = { top: 150, height: 470, width: 70 }; // relative to METER
const meterColor = (f: number) =>
  f >= 0.75 ? COLORS.profit : f >= 0.35 ? mix(COLORS.profit, COLORS.amber, (0.75 - f) / 0.4) : f >= 0.05 ? mix(COLORS.amber, COLORS.loss, (0.35 - f) / 0.3) : COLORS.loss;

const Meter: React.FC<{ t: number }> = ({ t }) => {
  const show = ramp(t, T('flip') + 0.3, 0.45);
  let v = NUMBERS.profit;
  NUMBERS.costs.forEach((c, i) => { v -= c.amount * ramp(t, T(`amt${i + 1}`), 0.55); });
  const f = v / NUMBERS.profit;
  const color = meterColor(f);
  const scale = (TRACK.height - 60) / NUMBERS.profit; // keep 60 px below zero for the loss
  const zeroY = TRACK.top + TRACK.height - 60;
  const h = Math.abs(v) * scale;
  const lossPulse = v < 0 ? 0.5 + 0.5 * Math.sin((t - T('loss')) * 9) : 0;
  return (
    <div style={{ position: 'absolute', ...METER, height: 700, opacity: show, transform: `translateX(${(1 - show) * 60}px)` }}>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 21, letterSpacing: '0.22em', color: COLORS.grey }}>{TEXT.receipt.meter.toUpperCase()}</div>
      <div style={{ marginTop: 8, fontFamily: sans, fontWeight: 800, fontSize: 42, color, letterSpacing: '-0.02em', ...tnum }}>{inr(v)}</div>
      <div style={{ position: 'absolute', left: 0, top: TRACK.top, width: TRACK.width, height: TRACK.height, borderRadius: 14, background: 'rgba(6,63,50,0.07)',
        border: `2px solid ${COLORS.line}` }} />
      <div style={{ position: 'absolute', left: 4, width: TRACK.width - 8, borderRadius: 10, background: color,
        top: v >= 0 ? zeroY - h : zeroY, height: Math.max(0, h), boxShadow: v < 0 ? `0 0 ${18 * lossPulse}px ${COLORS.loss}` : 'none' }} />
      {/* ticks */}
      {[{ y: TRACK.top + 2, label: inr(NUMBERS.profit) }, { y: zeroY, label: '₹0' }].map((k) => (
        <div key={k.label} style={{ position: 'absolute', left: TRACK.width + 12, top: k.y - 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 14, height: 2, background: COLORS.grey }} />
          <span style={{ fontFamily: sans, fontWeight: 500, fontSize: 20, color: COLORS.grey, ...tnum }}>{k.label}</span>
        </div>
      ))}
      <div style={{ position: 'absolute', left: -6, width: TRACK.width + 12, top: zeroY - 1, height: 3, background: COLORS.ink }} />
    </div>
  );
};

// ── Verdict stamp ─────────────────────────────────────────────────────────────
const Verdict: React.FC<{ t: number }> = ({ t }) => {
  const s = pop(t, T('loss'), 12, 260);
  if (s <= 0) return null;
  return (
    <div style={{ position: 'absolute', left: 92, top: 560, width: 600, display: 'flex', justifyContent: 'center',
      opacity: Math.min(1, s * 3), transform: `rotate(-8deg) scale(${interpolate(s, [0, 1], [2.3, 1])})` }}>
      <div style={{ padding: '18px 34px 14px', border: `9px solid ${COLORS.loss}`, outline: `3px solid ${COLORS.loss}`, outlineOffset: 6, borderRadius: 16,
        background: 'rgba(250,248,243,0.93)', textAlign: 'center', boxShadow: '0 18px 40px rgba(192,80,77,0.25)' }}>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 58, letterSpacing: '0.03em', color: COLORS.loss, whiteSpace: 'nowrap', ...tnum }}>{TEXT.verdict.stamp1}</div>
        <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 112, letterSpacing: '0.2em', lineHeight: 1, color: COLORS.loss, marginTop: 4 }}>{TEXT.verdict.stamp2}</div>
      </div>
    </div>
  );
};

export const Ledger: React.FC<{ t: number }> = ({ t }) => {
  const [start] = SCENES.celebration;
  const end = SCENES.verdict[1];
  if (t < start - 0.1 || t > end + 0.3) return null;
  const flip = T('flip');
  const cardTurn = ramp(t, flip, 0.22, (x) => x * x);
  const paperTurn = ramp(t, flip + 0.22, 0.32);
  const out = ramp(t, end - 0.15, 0.3);
  // short screen shake on the loss stamp
  const k = t - T('loss') - 0.08;
  const shake = k > 0 && k < 0.45 ? Math.exp(-k * 9) * 16 : 0;
  const dx = shake * Math.sin(k * 95), dy = shake * 0.6 * Math.cos(k * 120);
  return (
    <div style={{ position: 'absolute', inset: 0, perspective: 1800, opacity: 1 - out, transform: `translate(${dx}px, ${dy}px)` }}>
      {cardTurn < 1 && (
        <div style={{ position: 'absolute', inset: 0, transform: `rotateY(${cardTurn * 90}deg)`, transformOrigin: '540px 590px' }}>
          <Invoice t={t} />
        </div>
      )}
      {t >= flip + 0.22 && (
        <>
          <div style={{ position: 'absolute', inset: 0, transform: `rotateY(${(paperTurn - 1) * 90}deg)`, transformOrigin: '390px 590px',
            opacity: interpolate(t, [T('loss'), T('loss') + 0.2], [1, 0.9], clamp) }}>
            <Receipt t={t} />
          </div>
          <Meter t={t} />
          <Verdict t={t} />
        </>
      )}
    </div>
  );
};
