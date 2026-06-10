/**
 * Architecture finale — headline bridge at wide/ecosystem reveal.
 * Beats 4–5 from the architecture act, timed to finale sub-phase.
 */
import { motion, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import {
  architectureGlobalLocal,
  architecturePhase,
  architecturePhaseProgress,
} from '@/experience/architecture-phases';
import { ACTS } from '@/experience/narrative';

const archAct = ACTS.find((a) => a.id === 'architecture')!;
const finaleBeats = archAct.beats.slice(-2);

function renderAccent(text: string, accentText?: string) {
  if (!accentText || !text.includes(accentText)) return text;
  const [before, after] = text.split(accentText);
  return (
    <>
      {before}
      <span className="exp-accent">{accentText}</span>
      {after}
    </>
  );
}

export function ArchitectureFinale({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(progress, 'change', (p) => {
    const local = architectureGlobalLocal(p);
    const phase = local >= 0 ? architecturePhase(local) : null;
    const inFinale = phase === 'finale';
    const finaleT = inFinale ? architecturePhaseProgress(local, 'finale') : 0;

    // Hold copy at full strength through the finale — beat windows were fading it out too early.
    setVisible(inFinale && finaleT > 0.42);
  });

  if (!visible) return null;

  return (
    <div className="exp-arch-finale" aria-hidden>
      <div className="exp-arch-finale__panel">
        {finaleBeats.map((line, i) => (
          <motion.p
            key={i}
            className={`exp-arch-finale__line exp-arch-finale__line--${line.weight ?? 'lead'}`}
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : i * 0.1 }}
          >
            {renderAccent(line.text, line.accentText)}
          </motion.p>
        ))}
      </div>
    </div>
  );
}
