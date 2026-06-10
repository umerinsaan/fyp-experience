/**

 * WorkflowBrief — single active step copy for the workflow ring. No 3D HTML labels.

 */

import { useMotionValueEvent, type MotionValue } from 'framer-motion';

import { useState } from 'react';

import { actWindowById } from '@/experience/act-model';

import { ACCENTS, WORKFLOW_STEPS } from '@/experience/narrative';

import { clamp01, interp } from '@/story/scroll-math';



export function WorkflowBrief({ progress }: { progress: MotionValue<number> }) {

  const { start, end } = actWindowById('workflow');

  const span = end - start;

  const [opacity, setOpacity] = useState(0);

  const [step, setStep] = useState(0);



  useMotionValueEvent(progress, 'change', (p) => {

    if (p < start || p >= end) {

      setOpacity(0);

      return;

    }

    const local = clamp01((p - start) / span);

    setOpacity(interp(local, [0.04, 0.14], [0, 1]) * interp(local, [0.9, 1], [1, 0]));

    setStep(Math.min(WORKFLOW_STEPS.length - 1, Math.floor(local * WORKFLOW_STEPS.length * 1.02)));

  });



  if (opacity < 0.02) return null;



  const current = WORKFLOW_STEPS[step];

  const lift = (1 - opacity) * 16;



  return (

    <div

      className="exp-flow-brief"

      style={{ opacity, transform: `translateX(-50%) translateY(${lift}px)` }}

      aria-hidden

    >

      <span className="exp-flow-brief__index" style={{ color: ACCENTS[current.accent] }}>

        {String(step + 1).padStart(2, '0')}

      </span>

      <h2 className="exp-flow-brief__name">{current.label}</h2>

      <p className="exp-flow-brief__desc">{current.description}</p>

    </div>

  );

}


