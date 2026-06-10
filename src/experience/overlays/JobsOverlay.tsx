/** JobsOverlay — feature card for the Jobs Engine act. */
import type { MotionValue } from 'framer-motion';
import { FeatureCard } from '@/experience/overlays/FeatureCard';
import { JOBS_FACTS, JOBS_STAGES } from '@/experience/narrative';

export function JobsOverlay({ progress }: { progress: MotionValue<number> }) {
  return (
    <FeatureCard
      progress={progress}
      actId="jobs"
      accent="purple"
      kicker="Key feature 01 · Jobs Engine"
      title="One JSON schema. Every tool."
      facts={JOBS_FACTS}
      snippet={JOBS_STAGES[2].snippet}
    />
  );
}
