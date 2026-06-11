/**
 * ComparisonBeat — typographic before/after with staggered row reveals.
 */
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById, beatWindow } from '@/experience/act-model';
import { OBJ_COMPARE_ROW_STAGGER } from '@/experience/objective-phases';
import { clamp01, interp } from '@/story/scroll-math';

const ROWS: readonly { before: string; after: string }[] = [
  { before: 'Recon in one tool', after: 'Configured jobs, one click' },
  { before: 'Manual scripts to chain work', after: 'Visual pipelines' },
  { before: 'Findings without framework context', after: 'MITRE + ranked remediation' },
  { before: 'Reports built from scratch', after: 'Generated in the app' },
];

export function ComparisonBeat({ progress }: { progress: MotionValue<number> }) {
  const approachWin = beatWindow('objective', 5, 6);
  const { start, end } = actWindowById('objective');
  const span = end - start;
  const inAt = approachWin.inStart + span * 0.08;
  const fade = span * 0.06;
  const outAt = end - span * 0.04;

  const [opacity, setOpacity] = useState(0);
  const [rowOps, setRowOps] = useState<number[]>(() => ROWS.map(() => 0));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, [inAt, inAt + fade, outAt - fade, outAt], [0, 1, 1, 0]));
    const compareLocal = clamp01((p - inAt) / Math.max(outAt - inAt, 1e-6));
    setRowOps(
      ROWS.map((_, i) => {
        const rowIn = i * OBJ_COMPARE_ROW_STAGGER;
        return clamp01((compareLocal - rowIn) / 0.12);
      }),
    );
  });

  if (opacity < 0.02) return null;

  return (
    <div className="exp-compare" style={{ opacity }} aria-hidden>
      <div className="exp-compare__cols">
        <div className="exp-compare__col">
          <span className="exp-compare__heading">Today</span>
          <ul>
            {ROWS.map((r, i) => (
              <li
                key={r.before}
                className="exp-compare__row"
                style={{
                  opacity: rowOps[i],
                  transform: `translateX(${(1 - rowOps[i]) * -8}px)`,
                }}
              >
                {r.before}
              </li>
            ))}
          </ul>
        </div>
        <span className="exp-compare__sep" aria-hidden>
          →
        </span>
        <div className="exp-compare__col">
          <span className="exp-compare__heading">This platform</span>
          <ul>
            {ROWS.map((r, i) => (
              <li
                key={r.after}
                className="exp-compare__row"
                style={{
                  opacity: rowOps[i],
                  transform: `translateX(${(1 - rowOps[i]) * 8}px)`,
                }}
              >
                {r.after}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
