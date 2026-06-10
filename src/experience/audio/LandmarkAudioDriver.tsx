/**
 * Pass 6 — dedicated chimes for Impact and Vision (not bundled on act index).
 */
import { useMotionValueEvent } from 'framer-motion';
import { useRef } from 'react';
import { actWindowById } from '@/experience/act-model';
import { getFypAudio } from '@/experience/audio/audio-engine';
import { useExperience } from '@/experience/ExperienceContext';

export function LandmarkAudioDriver() {
  const { progress } = useExperience();
  const impactFired = useRef(false);
  const visionFired = useRef(false);

  useMotionValueEvent(progress, 'change', (p) => {
    const engine = getFypAudio();
    if (!engine.isRunning) return;

    const impact = actWindowById('impact');
    if (p >= impact.start + 0.015 && p < impact.end + 0.02) {
      if (!impactFired.current) {
        impactFired.current = true;
        engine.impactChime();
      }
    } else if (p < impact.start - 0.05) {
      impactFired.current = false;
    }

    const vision = actWindowById('vision');
    if (p >= vision.start + 0.015 && p < vision.end + 0.02) {
      if (!visionFired.current) {
        visionFired.current = true;
        engine.visionResolve();
      }
    } else if (p < vision.start - 0.05) {
      visionFired.current = false;
    }
  });

  return null;
}
