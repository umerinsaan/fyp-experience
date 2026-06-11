/**

 * FinaleOverlay — Act V closing. Thank-you handoff before the live demo.

 */

import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';

import { useCallback, useState } from 'react';

import { useExperience } from '@/experience/ExperienceContext';

import { actWindowById } from '@/experience/act-model';

import { FUTURE_FINALE_FADE, FUTURE_FINALE_IN } from '@/experience/future-work-phases';

import { clamp01, interp, overlayMotionTransition } from '@/story/scroll-math';



function finaleOpacity(local: number): number {

  return interp(local, [FUTURE_FINALE_IN, FUTURE_FINALE_IN + FUTURE_FINALE_FADE], [0, 1]);

}



export function FinaleOverlay({ progress }: { progress: MotionValue<number> }) {

  const reduce = useReducedMotion();

  const { conductorEnabled } = useExperience();

  const { start, end } = actWindowById('future-work');

  const span = end - start;



  const [opacity, setOpacity] = useState(0);



  const apply = useCallback(

    (p: number) => {

      if (p < start || p > end) {

        setOpacity(0);

        return;

      }

      const local = clamp01((p - start) / span);

      setOpacity(finaleOpacity(local));

    },

    [start, end, span],

  );



  useMotionValueEvent(progress, 'change', apply);



  if (opacity < 0.02) return null;



  const lift = reduce ? 0 : (1 - opacity) * 16;



  return (

    <div

      className="exp-finale"

      style={{

        opacity,

        transform: `translateY(${lift}px)`,

        transition: overlayMotionTransition(!!reduce, conductorEnabled),

      }}

      aria-hidden

    >

      <div className="exp-finale__glow" />

      <h2 className="exp-finale__thanks">Thank you</h2>

      <p className="exp-finale__handoff">

        That&apos;s all from the presentation part — now let&apos;s move towards the actual demo.

      </p>

    </div>

  );

}


