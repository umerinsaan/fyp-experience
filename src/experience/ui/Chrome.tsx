/**

 * Chrome — minimal HUD. Progress bar uses CSS width (no motion scaleX).

 */

import { motion, useMotionValueEvent, useReducedMotion } from 'framer-motion';

import { useState } from 'react';

import { FypLogo } from '@/components/brand/FypLogo';

import { useExperience } from '@/experience/ExperienceContext';

import { ChapterRail } from '@/experience/ui/ChapterRail';

import { ACTS, PROJECT_META } from '@/experience/narrative';
import { CHROME_PROGRESS_MS } from '@/story/scroll-math';



export function Chrome() {

  const { progress, actIndex } = useExperience();

  const reduce = useReducedMotion();

  const act = ACTS[actIndex] ?? ACTS[0];

  const [pct, setPct] = useState(0);



  useMotionValueEvent(progress, 'change', (p) => setPct(p));



  return (

    <div className="exp-chrome">

      <div className="exp-chrome-brand" aria-hidden>

        <FypLogo size={30} showWordmark={false} />

        <span className="font-mono text-[0.7rem] uppercase tracking-[0.24em] text-text-muted">

          {PROJECT_META.short}

        </span>

      </div>



      <div className="exp-chrome-meta" aria-hidden>

        <div>{PROJECT_META.group}</div>

        <div style={{ color: 'var(--act-accent)', marginTop: '0.25rem' }}>

          {act.numeral ? `Act ${act.numeral} · ` : ''}

          {act.name}

        </div>

        {act.question ? <div className="exp-chrome-question">{act.question}</div> : null}

      </div>



      <div className="exp-hud" aria-hidden>

        <span className="exp-hud__corner exp-hud__corner--tl" />

        <span className="exp-hud__corner exp-hud__corner--tr" />

        <span className="exp-hud__corner exp-hud__corner--bl" />

        <span className="exp-hud__corner exp-hud__corner--br" />

      </div>



      <ChapterRail />



      {actIndex === 0 && !reduce ? (

        <motion.div

          className="exp-scrollhint"

          initial={{ opacity: 0 }}

          animate={{ opacity: 1 }}

          transition={{ delay: 1.2 }}

          aria-hidden

        >

          <span>Scroll to begin</span>

          <motion.span

            animate={{ y: [0, 6, 0] }}

            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}

            style={{ fontSize: '0.9rem', color: 'var(--act-accent)' }}

          >

            ↓

          </motion.span>

        </motion.div>

      ) : null}



      <div
        className="exp-progress"
        style={{
          width: `${pct * 100}%`,
          transition: reduce ? 'none' : `width ${CHROME_PROGRESS_MS}ms linear`,
        }}
        aria-hidden
      />



    </div>

  );

}


