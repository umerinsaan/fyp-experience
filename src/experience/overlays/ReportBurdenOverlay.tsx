/**
 * ReportBurdenOverlay — Act I, phase 4 (Report burden). After all the tools
 * have run, the work still ends at a blank document. Two format icons — PDF
 * and Word — rise into view to land the final cost: the report is written
 * from scratch, by hand, every time.
 *
 * Icons come from react-icons/bs (already part of the installed react-icons
 * package) — no new dependencies.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { BsFillFilePdfFill, BsFillFileWordFill } from 'react-icons/bs';
import { actWindowById } from '@/experience/act-model';
import { REPORT_START } from '@/experience/problem-phases';
import { interp } from '@/story/scroll-math';

const DOCS = [
  { key: 'pdf', label: 'report.pdf', color: '#E84242', Icon: BsFillFilePdfFill },
  { key: 'docx', label: 'report.docx', color: '#2B579A', Icon: BsFillFileWordFill },
] as const;

export function ReportBurdenOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const { start, end } = actWindowById('problem');
  const span = end - start;

  const inAt = start + span * REPORT_START;
  const outAt = end - span * 0.01;
  const range = [inAt, inAt + span * 0.08, outAt - span * 0.04, outAt];

  const [opacity, setOpacity] = useState(() => interp(progress.get(), range, [0, 1, 1, 0]));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, range, [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  const scale = reduce ? 1 : 0.86 + opacity * 0.14;

  return (
    <div className="exp-report" aria-hidden>
      <div
        className="exp-report__docs"
        style={{
          opacity,
          transform: `scale(${scale})`,
          transition: reduce ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {DOCS.map(({ key, label, color, Icon }) => (
          <figure key={key} className="exp-report__doc">
            <span className="exp-report__icon" style={{ color }}>
              <Icon size={88} />
            </span>
            <figcaption className="exp-report__label">{label}</figcaption>
          </figure>
        ))}
      </div>
      <p className="exp-report__caption">Written by hand — hours, every time.</p>
    </div>
  );
}
