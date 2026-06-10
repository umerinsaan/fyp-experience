/**
 * ImpactMetrics — Act IV outcome numbers. Opacity fade + count-up; no Y slide.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { ACCENTS, IMPACT_METRICS } from '@/experience/narrative';
import { clamp01, interp } from '@/story/scroll-math';

export function ImpactMetrics({ progress }: { progress: MotionValue<number> }) {
  const { start, end } = actWindowById('impact');
  const fade = (end - start) * 0.18;
  const [groupOpacity, setGroupOpacity] = useState(0);

  useMotionValueEvent(progress, 'change', (p) => {
    setGroupOpacity(interp(p, [start, start + fade, end - fade, end], [0, 1, 1, 0]));
  });

  if (groupOpacity < 0.02) return null;

  return (
    <div className="exp-metrics" style={{ opacity: groupOpacity }} aria-hidden>
      {IMPACT_METRICS.map((m, i) => (
        <Metric key={m.label} progress={progress} index={i} start={start} end={end} metric={m} />
      ))}
    </div>
  );
}

function Metric({
  progress,
  index,
  start,
  end,
  metric,
}: {
  progress: MotionValue<number>;
  index: number;
  start: number;
  end: number;
  metric: (typeof IMPACT_METRICS)[number];
}) {
  const reduce = useReducedMotion();
  const span = end - start;
  const inAt = start + span * (0.12 + index * 0.16);
  const [opacity, setOpacity] = useState(0);
  const [prog, setProg] = useState(reduce ? 1 : 0);

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, [inAt, inAt + span * 0.12], [0, 1]));
    setProg(reduce ? 1 : clamp01(interp(p, [inAt, inAt + span * 0.16], [0, 1])));
  });

  const numericTarget = Number.parseInt(metric.value, 10);
  const isNumeric = !Number.isNaN(numericTarget);
  const display = isNumeric ? String(Math.round(prog * numericTarget)) : metric.value;

  return (
    <div className="exp-metric" style={{ opacity, ['--act-accent' as string]: ACCENTS[metric.accent] }}>
      <div className="exp-metric__value" style={{ color: ACCENTS[metric.accent] }}>
        {display}
      </div>
      <div className="exp-metric__label">{metric.label}</div>
      <MetricArt index={index} prog={prog} accent={ACCENTS[metric.accent]} />
    </div>
  );
}

function MetricArt({ index, prog, accent }: { index: number; prog: number; accent: string }) {
  if (index === 0) {
    const r = 14;
    const c = 2 * Math.PI * r;
    return (
      <div className="exp-metric__art">
        <svg width="36" height="36" viewBox="0 0 36 36" aria-hidden>
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - prog)}
            transform="rotate(-90 18 18)"
          />
        </svg>
      </div>
    );
  }
  if (index === 1) {
    const lit = Math.round(prog * 8);
    return (
      <div className="exp-metric__art">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="exp-metric__dot" data-on={i < lit} />
        ))}
      </div>
    );
  }
  const whole = prog > 0.5;
  return (
    <div className="exp-metric__art" data-whole={whole}>
      <span className="exp-metric__chain exp-metric__chain--broken">
        <span className="exp-metric__link" />
        <span className="exp-metric__link exp-metric__link--gap" />
        <span className="exp-metric__link" />
      </span>
      <span className="exp-metric__chain-arrow">→</span>
      <span className="exp-metric__chain exp-metric__chain--whole">
        <span className="exp-metric__link" />
        <span className="exp-metric__link" />
        <span className="exp-metric__link" />
      </span>
    </div>
  );
}
