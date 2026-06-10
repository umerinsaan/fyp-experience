/**
 * Scroll-synced architecture stingers — pullback swell, node dock pings, boundary ripple.
 */
import { useMotionValueEvent } from 'framer-motion';
import { useEffect, useRef } from 'react';
import {
  architectureGlobalLocal,
  architectureNodeStep,
  architectureNodeSubPhase,
  architecturePhase,
  architecturePhaseProgress,
} from '@/experience/architecture-phases';
import { onBoundaryRipple, resetArchitectureSignals } from '@/experience/architecture-signals';
import { useExperience } from '@/experience/ExperienceContext';
import { ARCH_NODES } from '@/experience/narrative';
import { getFypAudio } from '@/experience/audio/audio-engine';

const CHANNEL_IDX = ARCH_NODES.findIndex((n) => n.id === 'channel');

export function ArchitectureAudioDriver() {
  const { progress } = useExperience();
  const pullbackFired = useRef(false);
  const boundaryFired = useRef(false);
  const lastDockStep = useRef(-1);
  const wideFired = useRef(false);
  const lastArchLocal = useRef(-1);

  useEffect(() => {
    const engine = getFypAudio();
    const off = onBoundaryRipple((strength) => {
      if (!engine.isRunning) return;
      engine.boundaryRipple(strength);
    });
    return () => {
      off();
      resetArchitectureSignals();
    };
  }, []);

  useMotionValueEvent(progress, 'change', (p) => {
    const local = architectureGlobalLocal(p);
    const engine = getFypAudio();

    if (local < 0) {
      if (lastArchLocal.current >= 0) {
        pullbackFired.current = false;
        boundaryFired.current = false;
        wideFired.current = false;
        lastDockStep.current = -1;
        resetArchitectureSignals();
      }
      lastArchLocal.current = local;
      return;
    }

    lastArchLocal.current = local;
    if (!engine.isRunning) return;

    const phase = architecturePhase(local);

    if (
      phase === 'pullback' &&
      architecturePhaseProgress(local, 'pullback') > 0.2 &&
      !pullbackFired.current
    ) {
      pullbackFired.current = true;
      engine.revealPullback();
    }

    if (phase === 'traverse') {
      const step = architectureNodeStep(local);
      const sub = architectureNodeSubPhase(local, step);
      if (sub === 'dock' && step !== lastDockStep.current) {
        lastDockStep.current = step;
        engine.boundaryPing();
      }
      if (step >= CHANNEL_IDX && !boundaryFired.current) {
        boundaryFired.current = true;
        engine.boundaryRipple(0.65);
      }
    }

    if (phase === 'wide' && architecturePhaseProgress(local, 'wide') > 0.15 && !wideFired.current) {
      wideFired.current = true;
      engine.revealPullback();
    }
  });

  return null;
}
