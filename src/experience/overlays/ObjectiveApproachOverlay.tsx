/**
 * ObjectiveApproachOverlay — beats 5–6. Platform hub pulses; Jobs, Pipelines,
 * MITRE, Reports chips attach with live threads.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById, beatWindow } from '@/experience/act-model';
import { OBJ_CHIP_STAGGER } from '@/experience/objective-phases';
import { ACCENTS, type AccentKey } from '@/experience/narrative';
import {
  APPROACH_CHIPS,
  approachChipPosition,
  PLATFORM_HUB_POS,
} from '@/experience/sprawl-layout';
import { clamp01, interp } from '@/story/scroll-math';

export function ObjectiveApproachOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const jobsWin = beatWindow('objective', 4, 6);
  const approachWin = beatWindow('objective', 5, 6);
  const { start, end } = actWindowById('objective');
  const span = end - start;
  const mountStart = Math.max(0, jobsWin.inStart - (jobsWin.inEnd - jobsWin.inStart));
  const endAt = approachWin.outEnd;

  const p0 = progress.get();
  const [mounted, setMounted] = useState(() => p0 >= mountStart && p0 <= endAt);
  const [opacity, setOpacity] = useState(() => {
    const o5 = interp(p0, [jobsWin.inStart, jobsWin.inEnd, jobsWin.outStart, jobsWin.outEnd], [0, 1, 1, 0]);
    const o6 = interp(p0, [approachWin.inStart, approachWin.inEnd, approachWin.outStart, approachWin.outEnd], [0, 1, 1, 0]);
    return Math.max(o5, o6);
  });
  const [chipOps, setChipOps] = useState<number[]>(() =>
    APPROACH_CHIPS.map((_, i) => {
      const chipIn = jobsWin.inStart + span * OBJ_CHIP_STAGGER * (i + 1);
      return clamp01((p0 - chipIn) / (span * 0.06));
    }),
  );
  const [pulse, setPulse] = useState(() => (p0 >= jobsWin.inStart && p0 <= approachWin.outEnd ? 1 : 0));

  useMotionValueEvent(progress, 'change', (p) => {
    setMounted(p >= mountStart && p <= endAt);
    const o5 = interp(p, [jobsWin.inStart, jobsWin.inEnd, jobsWin.outStart, jobsWin.outEnd], [0, 1, 1, 0]);
    const o6 = interp(p, [approachWin.inStart, approachWin.inEnd, approachWin.outStart, approachWin.outEnd], [0, 1, 1, 0]);
    setOpacity(Math.max(o5, o6));
    setChipOps(
      APPROACH_CHIPS.map((_, i) => {
        const chipIn = jobsWin.inStart + span * OBJ_CHIP_STAGGER * (i + 1);
        return clamp01((p - chipIn) / (span * 0.06));
      }),
    );
    setPulse(p >= jobsWin.inStart && p <= approachWin.outEnd ? 1 : 0);
  });

  if (!mounted) return null;

  return (
    <div className="exp-objective-approach" style={{ opacity }} aria-hidden>
      <div
        className={`exp-objective-approach__hub${!reduce && pulse ? ' exp-objective-approach__hub--pulse' : ''}`}
        style={{ top: PLATFORM_HUB_POS.top, left: PLATFORM_HUB_POS.left }}
      >
        <span className="exp-objective-approach__hub-ring" />
        <span className="exp-objective-approach__hub-label">Platform</span>
      </div>
      {APPROACH_CHIPS.map((chip, i) => {
        const pos = approachChipPosition(i);
        const op = chipOps[i] * opacity;
        if (op < 0.02) return null;
        const accent = ACCENTS[chip.accent as AccentKey];
        return (
          <div
            key={chip.id}
            className="exp-objective-approach__chip"
            style={{
              top: pos.top,
              left: pos.left,
              opacity: op,
              borderColor: accent,
              boxShadow: `0 0 12px color-mix(in srgb, ${accent} 35%, transparent)`,
            }}
          >
            <span className="exp-objective-approach__chip-dot" style={{ background: accent }} />
            {chip.label}
          </div>
        );
      })}
    </div>
  );
}
