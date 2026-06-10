/** MitreOverlay — feature card for the MITRE & Remediation act. */
import type { MotionValue } from 'framer-motion';
import { FeatureCard, type FeatureRow } from '@/experience/overlays/FeatureCard';
import { MITRE_FACTS, MITRE_MAP } from '@/experience/narrative';

const ROWS: readonly FeatureRow[] = MITRE_MAP.map((m) => ({
  label: m.signal,
  value: `${m.technique} · ${m.name}`,
}));

export function MitreOverlay({ progress }: { progress: MotionValue<number> }) {
  return (
    <FeatureCard
      progress={progress}
      actId="mitre"
      accent="magenta"
      kicker="Key feature 03 · MITRE & Remediation"
      title="From finding to ranked fix."
      facts={MITRE_FACTS}
      rows={ROWS}
    />
  );
}
