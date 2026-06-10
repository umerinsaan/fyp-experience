/** SmartOverlay — feature card for the Smart Behavior act. */
import type { MotionValue } from 'framer-motion';
import { FeatureCard } from '@/experience/overlays/FeatureCard';
import { SMART_FACTS, SMART_RULES } from '@/experience/narrative';

const PLAYBOOK = SMART_RULES[0];

export function SmartOverlay({ progress }: { progress: MotionValue<number> }) {
  return (
    <FeatureCard
      progress={progress}
      actId="smart"
      accent="mint"
      kicker="Key feature 04 · Smart Behavior"
      title="The system reasons. You decide."
      facts={SMART_FACTS}
      snippet={`WHEN ${PLAYBOOK.when}  →  ${PLAYBOOK.then}`}
    />
  );
}
