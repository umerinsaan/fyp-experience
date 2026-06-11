/** ReportsOverlay — screenshot showcase for the Report Library act. */
import type { MotionValue } from 'framer-motion';
import { FeatureShowcase } from '@/experience/overlays/FeatureShowcase';

export function ReportsOverlay({ progress }: { progress: MotionValue<number> }) {
  return <FeatureShowcase progress={progress} actId="reports" />;
}
