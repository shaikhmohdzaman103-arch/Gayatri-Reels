import React from 'react';
import { interpolate } from 'remotion';
import { COLORS, NUMBERS, SAFE, SCENES, TEXT } from '../config';
import { T, clamp, cr, mix, pop, ramp, sans, serif, tnum } from '../theme';

// The cash bridge: EBITDA, four drops, cash from operations. Then the verdict on the same chart.
const BASE = 1000; // baseline y on the stage
const SCALE = 230 / 1e7; // px per rupee (₹1 Cr = 230 px)
const BAR_W = 116, GAP = 36;
const LEFT = SAFE.side + (920 - (6 * BAR_W + 5 * GAP)) / 2;
const y = (v: number) => BASE - v * SCALE;
const x = (i: number) => LEFT + i * (BAR_W + GAP);

const Label: React.FC<{ i: number; lines: readonly string[]; show: number; color?: string }> = ({ i, lines, show, color }) => (
  <div style={{ position: 'absolute', left: x(i) - 18, width: BAR_W + 36, top: BASE + 12, textAlign: 'center', opacity: show,
    fontFamily: sans, fontWeight: 600, fontSize: 21, lineHeight: 1.2, color: color ?? COLORS.grey }}>
    {lines.map((l) => <div key={l}>{l}</div>)}
  </div>
);

export const Bridge: React.FC<{ t: number }> = ({ t }) => {
  const start = SCENES.bridge[0];
  const end = SCENES.verdict[1];
  if (t < start - 0.1 || t > end + 0.35) return null;
  const enter = ramp(t, start - 0.05, 0.4);
  const out = ramp(t, end - 0.1, 0.3);
  const steps = NUMBERS.steps.map((s, i) => ({ ...s, at: T(`L${i + 3}`) }));
  const e = ramp(t, start + 0.25, 0.6, (v) => 1 - Math.pow(1 - v, 3));
  const ocfAt = T('L6.end') + 0.35;
  const ocf = ramp(t, ocfAt, 0.6, (v) => 1 - Math.pow(1 - v, 3));
  let level = NUMBERS.ebitda;
  let running = NUMBERS.ebitda * e;
  const verdictAt = T('L7');
  const v = pop(t, verdictAt + 0.05, 12, 240);
  const ghost = ramp(t, verdictAt - 0.05, 0.5);
  const k = t - verdictAt - 0.1;
  const shake = k > 0 && k < 0.4 ? Math.exp(-k * 10) * 12 : 0;
  const dim = 1 - 0.25 * ghost;

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: enter * (1 - out), transform: `translate(${shake * Math.sin(k * 90)}px, ${shake * 0.5 * Math.cos(k * 110)}px)` }}>
      <div style={{ position: 'absolute', left: SAFE.side, top: 262 }}>
        <div style={{ fontFamily: serif, fontSize: 60, color: COLORS.green, lineHeight: 1.05 }}>{TEXT.bridge.title}</div>
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 22, color: COLORS.grey, marginTop: 8, letterSpacing: '0.06em' }}>{TEXT.bridge.sub}</div>
      </div>
      {/* running counter */}
      {(() => {
        steps.forEach((s) => { running -= s.amount * ramp(t, s.at, 0.5); });
        const f = running / NUMBERS.ebitda;
        const color = f > 0.8 ? COLORS.gold : f > 0.55 ? mix(COLORS.gold, COLORS.loss, (0.8 - f) / 0.25) : COLORS.loss;
        return (
          <div style={{ position: 'absolute', right: SAFE.side, top: 266, textAlign: 'right', opacity: e }}>
            <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 19, letterSpacing: '0.22em', color: COLORS.grey }}>{TEXT.bridge.counter.toUpperCase()}</div>
            <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, color: ocf > 0.5 ? COLORS.profit : color, letterSpacing: '-0.02em', ...tnum }}>{cr(running)}</div>
          </div>
        );
      })()}
      {/* gridline + baseline */}
      <div style={{ position: 'absolute', left: SAFE.side, right: SAFE.side, top: BASE, height: 3, background: COLORS.ink, opacity: enter }} />
      <div style={{ position: 'absolute', left: x(0), top: y(NUMBERS.ebitda), width: x(5) + BAR_W - x(0), borderTop: `2px dashed rgba(6,63,50,0.28)`, opacity: e * dim }} />

      {/* EBITDA */}
      <div style={{ position: 'absolute', left: x(0), width: BAR_W, top: y(NUMBERS.ebitda * e), height: NUMBERS.ebitda * e * SCALE,
        background: COLORS.gold, borderRadius: '10px 10px 0 0', opacity: dim }} />
      <div style={{ position: 'absolute', left: x(0) - 20, width: BAR_W + 40, top: y(NUMBERS.ebitda) - 44, textAlign: 'center', opacity: e,
        fontFamily: sans, fontWeight: 800, fontSize: 28, color: COLORS.ink, ...tnum }}>{cr(NUMBERS.ebitda)}</div>
      <Label i={0} lines={TEXT.bridge.ebitda.filter(Boolean)} show={e} color={COLORS.ink} />

      {/* the four drops */}
      {steps.map((s, i) => {
        const p = ramp(t, s.at, 0.5, (q) => 1 - Math.pow(1 - q, 3));
        const top = y(level);
        const h = s.amount * SCALE * p;
        const lab = pop(t, s.at + 0.25, 14, 220);
        const conn = (
          <div key={`c${i}`} style={{ position: 'absolute', left: x(i) + BAR_W, width: GAP, top: top - 1, borderTop: `2px solid rgba(16,35,29,0.45)`, opacity: p > 0 ? 1 : 0 }} />
        );
        const el = (
          <React.Fragment key={s.key}>
            {conn}
            <div style={{ position: 'absolute', left: x(i + 1), width: BAR_W, top, height: h, background: COLORS.loss, borderRadius: 8, opacity: dim,
              boxShadow: p > 0 && p < 1 ? '0 10px 24px rgba(192,80,77,0.35)' : 'none' }} />
            <div style={{ position: 'absolute', left: x(i + 1) - 20, width: BAR_W + 40, top: top + s.amount * SCALE + 10, textAlign: 'center',
              fontFamily: sans, fontWeight: 800, fontSize: 26, color: COLORS.loss, opacity: Math.min(1, lab * 2), transform: `scale(${interpolate(lab, [0, 1], [1.4, 1])})`, ...tnum }}>
              {cr(-s.amount)}</div>
            <Label i={i + 1} lines={s.label} show={ramp(t, s.at - 0.1, 0.3)} />
          </React.Fragment>
        );
        level -= s.amount;
        return el;
      })}
      {/* connector into cash bar */}
      <div style={{ position: 'absolute', left: x(4) + BAR_W, width: GAP, top: y(NUMBERS.ocf) - 1, borderTop: `2px solid rgba(16,35,29,0.45)`, opacity: ocf > 0 ? 1 : 0 }} />

      {/* cash from operations */}
      <div style={{ position: 'absolute', left: x(5), width: BAR_W, top: y(NUMBERS.ocf * ocf), height: NUMBERS.ocf * ocf * SCALE,
        background: COLORS.profit, borderRadius: '10px 10px 0 0' }} />
      <div style={{ position: 'absolute', left: x(5) - 20, width: BAR_W + 40, top: y(NUMBERS.ocf) + 14, textAlign: 'center', opacity: ocf,
        fontFamily: sans, fontWeight: 800, fontSize: 26, color: '#FFFFFF', ...tnum }}>{cr(NUMBERS.ocf)}</div>
      <Label i={5} lines={TEXT.bridge.ocf} show={ocf} color={COLORS.profit} />

      {/* verdict: the missing ₹1.30 Cr drawn as a ghost bar on top of the cash bar */}
      <div style={{ position: 'absolute', left: x(5), width: BAR_W, top: y(NUMBERS.ebitda), height: NUMBERS.gap * SCALE * ghost,
        border: `3px dashed ${COLORS.loss}`, borderBottom: 'none', borderRadius: '10px 10px 0 0', opacity: ghost,
        background: 'repeating-linear-gradient(135deg, rgba(192,80,77,0.16) 0 10px, rgba(192,80,77,0) 10px 20px)' }} />
      {v > 0 && (
        <div style={{ position: 'absolute', left: SAFE.side + 150, top: 786, width: 560, display: 'flex', justifyContent: 'center',
          opacity: Math.min(1, v * 3), transform: `rotate(-4deg) scale(${interpolate(v, [0, 1], [2.2, 1])})` }}>
          <div style={{ padding: '12px 28px 14px', border: `7px solid ${COLORS.loss}`, outline: `3px solid ${COLORS.loss}`, outlineOffset: 5, borderRadius: 16,
            background: 'rgba(250,248,243,0.95)', textAlign: 'center', boxShadow: '0 18px 40px rgba(192,80,77,0.22)' }}>
            <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 66, lineHeight: 1, color: COLORS.loss, letterSpacing: '0.01em', ...tnum }}>{cr(NUMBERS.gap)}</div>
            {TEXT.verdict.map((l) => (
              <div key={l} style={{ fontFamily: sans, fontWeight: 800, fontSize: 28, letterSpacing: '0.12em', color: COLORS.loss, marginTop: 4 }}>{l.toUpperCase()}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
