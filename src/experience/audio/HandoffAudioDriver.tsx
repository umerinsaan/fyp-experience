/**
 * Pass 5 — audio bridge: architecture finale → workflow → Agent act.
 */
import { useMotionValueEvent } from 'framer-motion';
import { useRef } from 'react';
import { agentHandoffState } from '@/experience/agent-handoff';
import {
  architectureGlobalLocal,
  architecturePhase,
} from '@/experience/architecture-phases';
import { actWindowById } from '@/experience/act-model';
import { getFypAudio } from '@/experience/audio/audio-engine';
import { useExperience } from '@/experience/ExperienceContext';

export function HandoffAudioDriver() {
  const { progress } = useExperience();
  const finaleFired = useRef(false);
  const agentFired = useRef(false);
  const workflowFlowFired = useRef(false);

  useMotionValueEvent(progress, 'change', (p) => {
    const engine = getFypAudio();
    if (!engine.isRunning) return;

    const local = architectureGlobalLocal(p);
    if (local >= 0) {
      const phase = architecturePhase(local);
      if (phase === 'finale' && !finaleFired.current) {
        finaleFired.current = true;
        engine.correlationFinale();
      }
    } else if (finaleFired.current && p < actWindowById('architecture').start) {
      finaleFired.current = false;
    }

    const wf = actWindowById('workflow');
    if (p >= wf.start + (wf.end - wf.start) * 0.55 && p < wf.end && !workflowFlowFired.current) {
      workflowFlowFired.current = true;
      engine.workflowFlow();
    }
    if (p < wf.start) workflowFlowFired.current = false;

    const handoff = agentHandoffState(p);
    const agent = actWindowById('agent');
    if (p >= agent.start + 0.008 && handoff.morph < 0.35 && !agentFired.current) {
      agentFired.current = true;
      engine.agentHandoff();
    }
    if (p < agent.start - 0.02) agentFired.current = false;
  });

  return null;
}
