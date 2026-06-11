/** DashboardOverlay — screenshot showcase for the Security Posture dashboard act. */
import type { MotionValue } from 'framer-motion';
import { FeatureShowcase } from '@/experience/overlays/FeatureShowcase';

export function DashboardOverlay({ progress }: { progress: MotionValue<number> }) {
  return <FeatureShowcase progress={progress} actId="dashboard" />;
}
