/** SuggestionsOverlay — screenshot showcase for the Suggested Next Steps act. */
import type { MotionValue } from 'framer-motion';
import { FeatureShowcase } from '@/experience/overlays/FeatureShowcase';

export function SuggestionsOverlay({ progress }: { progress: MotionValue<number> }) {
  return <FeatureShowcase progress={progress} actId="suggestions" />;
}
