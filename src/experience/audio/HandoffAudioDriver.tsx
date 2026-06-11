/**
 * Pass 5 — audio bridge: architecture finale → technologies act.
 */
import { useMotionValueEvent } from 'framer-motion';
import { useRef } from 'react';
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
  const technologiesFlowFired = useRef(false);

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

    const tech = actWindowById('technologies');
    if (p >= tech.start + (tech.end - tech.start) * 0.55 && p < tech.end && !technologiesFlowFired.current) {
      technologiesFlowFired.current = true;
      engine.technologiesFlow();
    }
    if (p < tech.start) technologiesFlowFired.current = false;
  });

  return null;
}
