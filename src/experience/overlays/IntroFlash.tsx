/**
 * IntroFlash — a single cinematic "power-on" sweep the moment the experience is
 * revealed (after the preloader). It plays exactly once and never reappears, so
 * the opening reads as a deliberate title-card reveal rather than a hard cut.
 * Skipped entirely under reduced-motion.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { usePreload } from '@/app/PreloadContext';

export function IntroFlash() {
  const reduce = useReducedMotion();
  const { revealed } = usePreload();
  if (reduce) return null;

  return (
    <motion.div
      className="exp-introflash"
      aria-hidden
      initial={{ opacity: 0 }}
      animate={revealed ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
      transition={{ duration: 1.4, times: [0, 0.28, 1], ease: 'easeOut' }}
    />
  );
}
