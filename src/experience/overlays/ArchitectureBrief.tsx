/** ArchitectureBrief — per-node copy during depth-first traverse. */

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';

import { useRef, useState } from 'react';

import {
  architectureGlobalLocal,
  architectureNodeStep,
  architecturePhase,
  architecturePhaseProgress,
} from '@/experience/architecture-phases';

import { actWindowById } from '@/experience/act-model';

import { traverseEdgeIndex } from '@/experience/canvas/scenes/architecture-layout';

import { STREAM_VISUALS } from '@/experience/architecture-streams';

import { ACCENTS, ARCH_CONNECTIONS, ARCH_NODES } from '@/experience/narrative';

import { TechLogo, techMeta } from '@/experience/ui/TechLogo';

import { interp } from '@/story/scroll-math';



const FLOW_ARROW: Record<string, string> = {

  down: '↓',

  up: '↑',

  bidirectional: '↔',

};



function outgoingConnection(step: number) {

  const edgeIdx = traverseEdgeIndex(step);

  if (edgeIdx >= 0) return ARCH_CONNECTIONS[edgeIdx];

  return ARCH_CONNECTIONS[0];

}



export function ArchitectureBrief({ progress }: { progress: MotionValue<number> }) {

  const reduced = useReducedMotion();

  const { start, end } = actWindowById('architecture');

  const [opacity, setOpacity] = useState(0);

  const [step, setStep] = useState(0);

  const lastRef = useRef({ opacity: 0, step: 0 });



  useMotionValueEvent(progress, 'change', (p) => {

    let nextOpacity = 0;

    let nextStep = 0;



    if (p >= start && p < end) {

      const local = architectureGlobalLocal(p);

      const phase = architecturePhase(local);

      if (phase === 'traverse') {

        const traverseLocal = architecturePhaseProgress(local, 'traverse');

        const fadeIn = interp(traverseLocal, [0, 0.04], [0, 1]);

        const fadeOut = interp(traverseLocal, [0.88, 1], [1, 0]);

        nextOpacity = fadeIn * fadeOut;

        nextStep = architectureNodeStep(local);

      }

    }



    const last = lastRef.current;

    if (last.opacity === nextOpacity && last.step === nextStep) return;

    lastRef.current = { opacity: nextOpacity, step: nextStep };

    setOpacity(nextOpacity);

    setStep(nextStep);

  });



  if (opacity < 0.02) return null;



  const node = ARCH_NODES[step];

  const conn = outgoingConnection(step);

  const streamAccent = ACCENTS[STREAM_VISUALS[conn.stream].accent];

  const lift = reduced ? 0 : (1 - opacity) * 18;



  return (

    <div className="exp-arch-brief" style={{ opacity, transform: `translateY(${lift}px)` }} aria-hidden>

      <AnimatePresence mode="wait">

        <motion.div

          key={node.id}

          className="exp-arch-brief__card"

          style={{ ['--arch-accent' as string]: ACCENTS[node.accent] }}

          initial={reduced ? false : { opacity: 0, x: 28 }}

          animate={{ opacity: 1, x: 0 }}

          exit={reduced ? undefined : { opacity: 0, x: -20 }}

          transition={{ duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}

        >

          <div className="exp-arch-brief__header">

            <span className="exp-arch-brief__index">

              {String(step + 1).padStart(2, '0')} / {String(ARCH_NODES.length).padStart(2, '0')}

            </span>

            <span className="exp-arch-brief__plane" data-plane={node.plane}>

              {node.plane === 'cloud' ? 'Control plane' : 'Execution plane'}

            </span>

          </div>



          <h2 className="exp-arch-brief__name">{node.label}</h2>

          <p className="exp-arch-brief__role">{node.role}</p>

          {node.explain ? <p className="exp-arch-brief__explain">{node.explain}</p> : null}



          {node.statusChip ? <span className="exp-arch-brief__chip">{node.statusChip}</span> : null}

          {node.endpoint ? <code className="exp-arch-brief__snippet">{node.endpoint}</code> : null}



          {(node.primaryTech || node.services?.length) ? (

            <div className="exp-arch-brief__stack">

              {node.primaryTech ? (

                <span className="exp-arch-tech">

                  <TechLogo id={node.primaryTech} size={14} />

                  {techMeta(node.primaryTech).label}

                </span>

              ) : null}

              {node.services?.map((tech) => (

                <span key={tech} className="exp-arch-tech">

                  <TechLogo id={tech} size={13} />

                  {techMeta(tech).label}

                </span>

              ))}

            </div>

          ) : null}



          <p className="exp-arch-brief__flow" style={{ color: streamAccent }}>

            <span className="exp-arch-brief__flow-dir">{FLOW_ARROW[conn.direction]}</span>

            Next: {conn.label}

          </p>

        </motion.div>

      </AnimatePresence>

    </div>

  );

}

