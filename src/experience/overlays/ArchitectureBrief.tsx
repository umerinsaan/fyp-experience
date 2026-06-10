/**

 * ArchitectureBrief — per-node copy during depth-first traverse.

 * ArchitectureIntro — opening beats 0–2 during handoff and pullback.

 */

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';

import { useRef, useState } from 'react';

import {

  ARCH_PHASE_LOCAL,

  architectureGlobalLocal,

  architectureNodeStep,

  architecturePhase,

  architecturePhaseProgress,

} from '@/experience/architecture-phases';

import { actWindowById } from '@/experience/act-model';

import { traverseEdgeIndex } from '@/experience/canvas/scenes/architecture-layout';

import { STREAM_VISUALS } from '@/experience/architecture-streams';

import { ACTS, ACCENTS, ARCH_CONNECTIONS, ARCH_NODES } from '@/experience/narrative';

import { TechLogo, techMeta } from '@/experience/ui/TechLogo';

import { clamp01, interp } from '@/story/scroll-math';



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



export function ArchitectureIntro({ progress }: { progress: MotionValue<number> }) {

  const reduced = useReducedMotion();

  const archAct = ACTS.find((a) => a.id === 'architecture');

  const introBeats = archAct?.beats.slice(0, 3) ?? [];

  const [visible, setVisible] = useState(false);

  const [lines, setLines] = useState<{ text: string; accentText?: string; weight?: string; opacity: number }[]>(

    [],

  );



  useMotionValueEvent(progress, 'change', (p) => {

    const local = architectureGlobalLocal(p);

    const phase = local >= 0 ? architecturePhase(local) : null;

    setVisible(phase === 'handoff' || phase === 'pullback');



    if (!archAct) return;

    const win = actWindowById('architecture');

    const span = win.end - win.start;

    const next = introBeats.map((beat, i) => {

      const localStart = i === 0 ? 0 : i === 1 ? 0.03 : ARCH_PHASE_LOCAL.pullback.start;

      const localEnd =

        i === 0 ? 0.05 : i === 1 ? ARCH_PHASE_LOCAL.pullback.start + 0.04 : ARCH_PHASE_LOCAL.pullback.end;

      const inStart = win.start + span * localStart;

      const inEnd = win.start + span * localEnd;

      const outEnd = win.start + span * Math.min(localEnd + 0.06, ARCH_PHASE_LOCAL.traverse.start);

      const op =

        p <= inStart || p >= outEnd

          ? 0

          : p < inEnd

            ? clamp01((p - inStart) / (inEnd - inStart))

            : clamp01(1 - (p - inEnd) / (outEnd - inEnd));

      return { text: beat.text, accentText: beat.accentText, weight: beat.weight, opacity: op };

    });

    setLines(next);

  });



  const groupOpacity = lines.reduce((m, l) => Math.max(m, l.opacity), 0);

  if (!visible || groupOpacity < 0.02) return null;



  return (

    <div className="exp-arch-intro" style={{ opacity: clamp01(groupOpacity) }} aria-hidden>

      <div className="exp-arch-intro__panel">

        {lines.map((line, i) =>

          line.opacity > 0.02 ? (

            <motion.p

              key={i}

              className={`exp-arch-intro__line exp-arch-intro__line--${line.weight ?? 'lead'}`}

              initial={reduced ? false : { opacity: 0, y: 20 }}

              animate={{ opacity: line.opacity, y: reduced ? 0 : (1 - line.opacity) * 20 }}

              transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : i * 0.08 }}

            >

              {line.accentText && line.text.includes(line.accentText) ? (

                <>

                  {line.text.split(line.accentText)[0]}

                  <span className="exp-accent">{line.accentText}</span>

                  {line.text.split(line.accentText)[1]}

                </>

              ) : (

                line.text

              )}

            </motion.p>

          ) : null,

        )}

      </div>

    </div>

  );

}


