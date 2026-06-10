/**

 * Architecture finale — headline bridge at wide/ecosystem reveal.

 * Beats 4–5 from the architecture act, timed to finale sub-phase.

 */

import { motion, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';

import { useState } from 'react';

import { beatOpacity, beatWindow } from '@/experience/act-model';

import {
  architectureGlobalLocal,
  architecturePhase,
  architecturePhaseProgress,
} from '@/experience/architecture-phases';

import { ACTS, ACCENTS_DEEP } from '@/experience/narrative';

import { clamp01 } from '@/story/scroll-math';



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

  const [lines, setLines] = useState<{ text: string; accentText?: string; weight?: string; opacity: number }[]>(

    [],

  );



  useMotionValueEvent(progress, 'change', (p) => {

    const local = architectureGlobalLocal(p);

    const phase = local >= 0 ? architecturePhase(local) : null;

    const inFinale = phase === 'finale';

    const finaleT = inFinale ? architecturePhaseProgress(local, 'finale') : 0;

    // Let the zoomed-out diagram breathe before headline copy covers it.

    setVisible(inFinale && finaleT > 0.58);



    const next = finaleBeats.map((beat, i) => {

      const win = beatWindow('architecture', archAct.beats.length - 2 + i, archAct.beats.length);

      const op = beatOpacity(p, win);

      return { text: beat.text, accentText: beat.accentText, weight: beat.weight, opacity: op };

    });

    setLines(next);

  });



  const groupOpacity = lines.reduce((m, l) => Math.max(m, l.opacity), 0);

  if (!visible || groupOpacity < 0.02) return null;



  return (

    <div className="exp-arch-finale" style={{ opacity: clamp01(groupOpacity) }} aria-hidden>

      <div className="exp-arch-finale__panel">

        {lines.map((line, i) =>

          line.opacity > 0.02 ? (

            <motion.p

              key={i}

              className={`exp-arch-finale__line exp-arch-finale__line--${line.weight ?? 'lead'}`}

              initial={reduced ? false : { opacity: 0, y: 24 }}

              animate={{ opacity: line.opacity, y: reduced ? 0 : (1 - line.opacity) * 24 }}

              transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.1 }}

              style={{

                color: line.weight === 'hero' ? undefined : ACCENTS_DEEP.purple,

              }}

            >

              {renderAccent(line.text, line.accentText)}

            </motion.p>

          ) : null,

        )}

      </div>

    </div>

  );

}


