/**

 * FeatureShowcase — screenshot slot(s) + act description for key-feature acts.

 */

import { useMotionValueEvent, type MotionValue } from 'framer-motion';

import { useCallback, useState } from 'react';

import { keyFeatureByActId } from '@/content/key-features';

import { actWindowById } from '@/experience/act-model';

import { FeatureScreenshot } from '@/experience/overlays/FeatureScreenshot';

import { ACTS, ACCENTS, type ActId } from '@/experience/narrative';

import { interp } from '@/story/scroll-math';



interface FeatureShowcaseProps {

  progress: MotionValue<number>;

  actId: ActId;

}



function showcaseOpacity(p: number, start: number, end: number): number {

  if (p < start || p >= end) return 0;

  const local = (p - start) / Math.max(end - start, 1e-6);

  return interp(local, [0.08, 0.2, 0.92, 1], [0, 1, 1, 0]);

}



export function FeatureShowcase({ progress, actId }: FeatureShowcaseProps) {

  const feature = keyFeatureByActId(actId);

  const act = ACTS.find((a) => a.id === actId);

  const { start, end } = actWindowById(actId);



  const [opacity, setOpacity] = useState(() => showcaseOpacity(progress.get(), start, end));



  const apply = useCallback(

    (p: number) => {

      setOpacity(showcaseOpacity(p, start, end));

    },

    [start, end],

  );



  useMotionValueEvent(progress, 'change', apply);



  if (!feature || !act || opacity < 0.02) return null;



  const accent = act.accent;

  const lift = (1 - opacity) * 8;



  return (

    <div

      className="exp-feature__showcase"

      style={{

        opacity,

        transform: `translateX(-50%) translateY(${lift}px)`,

        ['--feat-accent' as string]: ACCENTS[accent],

      }}

      aria-hidden

    >

      <div className={`exp-feature__shots${feature.secondary ? ' exp-feature__shots--dual' : ''}`}>

        <FeatureScreenshot actId={actId} accent={accent} spec={feature.primary} />

        {feature.secondary ? (

          <FeatureScreenshot actId={actId} accent={accent} spec={feature.secondary} />

        ) : null}

      </div>

      <div className="exp-feature__desc">

        <p className="exp-feature__desc-act">

          {act.numeral ? `Act ${act.numeral} · ` : ''}

          {act.name}

        </p>

        {act.question ? <p className="exp-feature__desc-question">{act.question}</p> : null}

      </div>

    </div>

  );

}


