/**
 * FeatureCard — shared glass info panel for the four key-feature acts (Jobs,
 * Pipeline, MITRE, Smart). Binds to an act window and fades a compact, factual
 * card in at the bottom of the stage while the 3D scene plays behind it.
 *
 * Typography beats (top-aligned, via ActCopy) carry the headline; this card
 * carries the supporting facts a viva audience reads.
 */
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { ACCENTS, type AccentKey, type ActId } from '@/experience/narrative';
import { interp } from '@/story/scroll-math';

export interface FeatureRow {
  label: string;
  value: string;
}

export interface FeatureCardProps {
  progress: MotionValue<number>;
  actId: ActId;
  kicker: string;
  title: string;
  accent: AccentKey;
  facts: readonly string[];
  /** Optional key/value rows (e.g. technique mappings). */
  rows?: readonly FeatureRow[];
  /** Optional mono snippet shown at the foot. */
  snippet?: string;
}

export function FeatureCard({ progress, actId, kicker, title, accent, facts, rows, snippet }: FeatureCardProps) {
  const { start, end } = actWindowById(actId);
  const span = end - start;
  const [opacity, setOpacity] = useState(0);

  useMotionValueEvent(progress, 'change', (p) => {
    if (p < start || p >= end) {
      setOpacity(0);
      return;
    }
    const local = (p - start) / span;
    setOpacity(interp(local, [0.16, 0.26, 0.9, 1], [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  const lift = (1 - opacity) * 18;

  return (
    <div
      className="exp-feature"
      style={{ opacity, transform: `translateX(-50%) translateY(${lift}px)`, ['--feat-accent' as string]: ACCENTS[accent] }}
      aria-hidden
    >
      <div className="exp-feature__card">
        <span className="exp-feature__kicker">{kicker}</span>
        <h2 className="exp-feature__title">{title}</h2>
        <ul className="exp-feature__facts">
          {facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        {rows && rows.length > 0 ? (
          <div className="exp-feature__rows">
            {rows.map((r) => (
              <div key={r.label} className="exp-feature__row">
                <span className="exp-feature__row-label">{r.label}</span>
                <span className="exp-feature__row-arrow">→</span>
                <span className="exp-feature__row-value">{r.value}</span>
              </div>
            ))}
          </div>
        ) : null}
        {snippet ? <code className="exp-feature__snippet">{snippet}</code> : null}
      </div>
    </div>
  );
}
