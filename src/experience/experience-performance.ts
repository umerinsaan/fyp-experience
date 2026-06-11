/**
 * Pass 5–7 — viva / reduced-motion / lite-mode performance caps.
 */
import { ECOSYSTEM_BOOT, ECOSYSTEM_MAX } from '@/experience/architecture-phases';
import { AGENT_ORBIT_COUNT } from '@/experience/agent-handoff';
import { VIVA_LITE_MODE } from '@/experience/viva/viva-config';

export interface ExperiencePerfCaps {
  ecosystemMax: number;
  ecosystemBoot: number;
  /** Scales active stream instances (0..1). */
  streamDensity: number;
  technologiesParticleCount: number;
  agentOrbitCount: number;
  enablePostFx: boolean;
  /** Scale instanced city + heavy effects. */
  visualDensity: number;
}

const FULL: ExperiencePerfCaps = {
  ecosystemMax: ECOSYSTEM_MAX,
  ecosystemBoot: ECOSYSTEM_BOOT,
  streamDensity: 1,
  technologiesParticleCount: 24,
  agentOrbitCount: AGENT_ORBIT_COUNT,
  enablePostFx: true,
  visualDensity: 1,
};

const REDUCED: ExperiencePerfCaps = {
  ecosystemMax: 768,
  ecosystemBoot: 200,
  streamDensity: 0.52,
  technologiesParticleCount: 10,
  agentOrbitCount: 8,
  enablePostFx: false,
  visualDensity: 0.72,
};

/** Pass 7 — viva laptop: between full quality and reduced-motion caps. */
const VIVA_LITE: ExperiencePerfCaps = {
  ecosystemMax: 1280,
  ecosystemBoot: 320,
  streamDensity: 0.78,
  technologiesParticleCount: 16,
  agentOrbitCount: 12,
  enablePostFx: true,
  visualDensity: 0.88,
};

export function experiencePerfCaps(reduced: boolean): ExperiencePerfCaps {
  if (reduced) return REDUCED;
  if (VIVA_LITE_MODE) return VIVA_LITE;
  return FULL;
}
