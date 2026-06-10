/** PipelineOverlay — feature card for the Pipeline Designer act. */
import type { MotionValue } from 'framer-motion';
import { FeatureCard } from '@/experience/overlays/FeatureCard';
import { PIPELINE_FACTS } from '@/experience/narrative';

export function PipelineOverlay({ progress }: { progress: MotionValue<number> }) {
  return (
    <FeatureCard
      progress={progress}
      actId="pipeline"
      accent="cyan"
      kicker="Key feature 02 · Pipeline Designer"
      title="Orchestrate the chain — as a graph."
      facts={PIPELINE_FACTS}
      snippet="Start → Recon → { Web ∥ Host } → Verify"
    />
  );
}
