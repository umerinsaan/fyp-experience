/** JobsOverlay — screenshot showcase for the Jobs Engine act. */
import type { MotionValue } from 'framer-motion';
import { FeatureShowcase } from '@/experience/overlays/FeatureShowcase';

export function JobsOverlay({ progress }: { progress: MotionValue<number> }) {
  return <FeatureShowcase progress={progress} actId="jobs" />;
}
