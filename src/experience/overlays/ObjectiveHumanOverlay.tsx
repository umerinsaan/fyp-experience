/**
 * ObjectiveHumanOverlay — beats 0–1. Analyst stays central; no tool badges
 * (logos appear in 3D only on "So we built one.").
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { beatWindow } from '@/experience/act-model';
import { interp } from '@/story/scroll-math';

export function ObjectiveHumanOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const win0 = beatWindow('objective', 0, 6);
  const win1 = beatWindow('objective', 1, 6);
  const mountStart = Math.max(0, win0.inStart - (win0.inEnd - win0.inStart));
  const endAt = win1.outEnd;

  const p0 = progress.get();
  const [mounted, setMounted] = useState(() => p0 >= mountStart && p0 <= endAt);
  const [opacity, setOpacity] = useState(() => {
    const o0 = interp(p0, [win0.inStart, win0.inEnd, win0.outStart, win0.outEnd], [0, 1, 1, 0]);
    const o1 = interp(p0, [win1.inStart, win1.inEnd, win1.outStart, win1.outEnd], [0, 1, 1, 0]);
    return Math.max(o0, o1);
  });
  const [humanGlow, setHumanGlow] = useState(() =>
    interp(p0, [win1.inStart, win1.inEnd, win1.outStart, win1.outEnd], [0.4, 1, 1, 0.5]),
  );

  useMotionValueEvent(progress, 'change', (p) => {
    setMounted(p >= mountStart && p <= endAt);
    const o0 = interp(p, [win0.inStart, win0.inEnd, win0.outStart, win0.outEnd], [0, 1, 1, 0]);
    const o1 = interp(p, [win1.inStart, win1.inEnd, win1.outStart, win1.outEnd], [0, 1, 1, 0]);
    setOpacity(Math.max(o0, o1));
    setHumanGlow(interp(p, [win1.inStart, win1.inEnd, win1.outStart, win1.outEnd], [0.4, 1, 1, 0.5]));
  });

  if (!mounted) return null;

  return (
    <div className="exp-objective-human" style={{ opacity }} aria-hidden>
      <div
        className="exp-objective-human__node"
        style={{
          opacity: humanGlow,
          boxShadow: reduce
            ? undefined
            : `0 0 ${24 + humanGlow * 32}px color-mix(in srgb, var(--act-accent) ${40 + humanGlow * 30}%, transparent)`,
        }}
      >
        <span className="exp-objective-human__icon" aria-hidden>
          ◉
        </span>
        <span className="exp-objective-human__label">Analyst</span>
      </div>
    </div>
  );
}
