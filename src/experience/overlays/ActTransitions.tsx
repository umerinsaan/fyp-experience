/**
 * ActTransitions — chapter punctuation. A subtle accent light sweeps across the
 * frame as the scroll crosses each act boundary, so the film reads as distinct
 * chapters rather than one continuous ambient scroll. Deliberately understated.
 */
import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { useMemo } from 'react';
import { ACT_WINDOWS } from '@/experience/act-model';

const HALF = 0.018; // half-width of a transition window in global progress

export function ActTransitions({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();

  const boundaries = useMemo(
    () => ACT_WINDOWS.map((w) => w.start).filter((s) => s > 0.001),
    [],
  );

  /** Nearest-boundary crossing position 0..1, or -1 when not in any window. */
  const crossing = (p: number): number => {
    for (const b of boundaries) {
      if (p >= b - HALF && p <= b + HALF) return (p - (b - HALF)) / (2 * HALF);
    }
    return -1;
  };

  const opacity = useTransform(progress, (p) => {
    const c = crossing(p);
    return c < 0 ? 0 : Math.sin(c * Math.PI) * 0.5;
  });

  const y = useTransform(progress, (p) => {
    const c = crossing(p);
    return `${(c < 0 ? 0 : c) * 120 - 10}vh`;
  });

  if (reduce) return null;

  return (
    <motion.div className="exp-transition" style={{ opacity }} aria-hidden>
      <motion.div className="exp-transition__sweep" style={{ y }} />
    </motion.div>
  );
}
