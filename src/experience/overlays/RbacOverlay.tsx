/** RbacOverlay — screenshot showcase for the Live RBAC act. */
import type { MotionValue } from 'framer-motion';
import { FeatureShowcase } from '@/experience/overlays/FeatureShowcase';

export function RbacOverlay({ progress }: { progress: MotionValue<number> }) {
  return <FeatureShowcase progress={progress} actId="rbac" />;
}
