/**
 * AccentDriver — pushes the blended per-act accent color into CSS custom
 * properties so HTML overlays, labels, and chrome all tint in sync with the 3D.
 */
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useEffect } from 'react';
import { accentColorAt } from '@/experience/act-model';

function apply(p: number) {
  const c = accentColorAt(p);
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const root = document.documentElement.style;
  root.setProperty('--act-accent', `rgb(${r}, ${g}, ${b})`);
  root.setProperty('--act-accent-soft', `rgba(${r}, ${g}, ${b}, 0.16)`);
}

export function AccentDriver({ progress }: { progress: MotionValue<number> }) {
  useMotionValueEvent(progress, 'change', apply);
  useEffect(() => {
    apply(progress.get());
  }, [progress]);
  return null;
}
