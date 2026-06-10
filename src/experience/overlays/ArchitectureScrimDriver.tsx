/**
 * Eases the legibility scrim during the architecture wide shot so node labels stay readable.
 */
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { architectureGlobalLocal, architecturePhase } from '@/experience/architecture-phases';

function applyScrimStrength(p: number) {
  const local = architectureGlobalLocal(p);
  const phase = local >= 0 ? architecturePhase(local) : null;
  const wideDiagram = phase === 'wide' || phase === 'finale';
  document.documentElement.style.setProperty('--exp-scrim-strength', wideDiagram ? '0.78' : '1');
}

export function ArchitectureScrimDriver({ progress }: { progress: MotionValue<number> }) {
  useMotionValueEvent(progress, 'change', applyScrimStrength);
  useEffect(() => {
    applyScrimStrength(progress.get());
    return () => {
      document.documentElement.style.removeProperty('--exp-scrim-strength');
    };
  }, [progress]);
  return null;
}
