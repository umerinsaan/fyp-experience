/**
 * Semantic information streams — motion teaches architecture (Pass 1–4).
 * Each ARCH_CONNECTION maps to a stream kind with distinct visual behaviour.
 */
import type { StreamKind } from '@/experience/narrative';
import { ACCENTS, type AccentKey } from '@/experience/narrative';
import type { ArchPhase } from '@/experience/architecture-phases';
import { architecturePhaseProgress } from '@/experience/architecture-phases';
import { clamp01 } from '@/story/scroll-math';

export interface StreamVisual {
  kind: StreamKind;
  /** Base travel speed along curve (multiplier). */
  speed: number;
  /** Base scale multiplier. */
  scale: number;
  /** Instances per connection when stream is active. */
  count: number;
  /** Elongation along travel axis (streak vs dot). */
  stretch: number;
  accent: AccentKey;
}

export const STREAM_VISUALS: Record<StreamKind, StreamVisual> = {
  command: { kind: 'command', speed: 0.38, scale: 1.15, count: 5, stretch: 2.4, accent: 'mint' },
  telemetry: { kind: 'telemetry', speed: 0.52, scale: 0.75, count: 6, stretch: 1.2, accent: 'amber' },
  artifact: { kind: 'artifact', speed: 0.28, scale: 1.35, count: 4, stretch: 1.8, accent: 'mint' },
  finding: { kind: 'finding', speed: 0.44, scale: 1.0, count: 5, stretch: 1.6, accent: 'magenta' },
  correlation: { kind: 'correlation', speed: 0.32, scale: 0.9, count: 4, stretch: 2.0, accent: 'purple' },
  sync: { kind: 'sync', speed: 0.48, scale: 0.85, count: 6, stretch: 1.4, accent: 'cyan' },
};

export const STREAM_KINDS = Object.keys(STREAM_VISUALS) as StreamKind[];

/** Pass 4 — max instances per connection at wide / finale (pre-allocated in scene). */
export const STREAM_WIDE_MAX: Partial<Record<StreamKind, number>> = {
  finding: 2.0,
  correlation: 1.9,
  sync: 1.3,
  command: 1.2,
};

export function streamMaxPerConnection(kind: StreamKind): number {
  const boost = STREAM_WIDE_MAX[kind] ?? 1.15;
  return Math.ceil(STREAM_VISUALS[kind].count * boost);
}

/** Active packet instances per connection — ramps up during wide / finale. */
export function streamActivePerConnection(kind: StreamKind, phase: ArchPhase, local: number): number {
  const base = STREAM_VISUALS[kind].count;
  const max = streamMaxPerConnection(kind);

  if (phase !== 'wide' && phase !== 'finale') return base;

  const t =
    phase === 'finale' ? architecturePhaseProgress(local, 'finale') : architecturePhaseProgress(local, 'wide');

  const isIntel = kind === 'finding' || kind === 'correlation';
  const target =
    phase === 'finale' && isIntel
      ? base + (max - base) * clamp01(0.55 + t * 0.45)
      : base + (max - base) * t * (isIntel ? 0.92 : 0.65);

  return Math.min(max, Math.ceil(target));
}

export function streamSpeedMultiplier(phase: ArchPhase, local: number): number {
  if (phase === 'traverse') return 1.08;
  if (phase === 'wide') return 1 + architecturePhaseProgress(local, 'wide') * 0.28;
  if (phase === 'finale') return 1.28 + architecturePhaseProgress(local, 'finale') * 0.22;
  return 1;
}

export function streamColor(kind: StreamKind, target = { r: 1, g: 1, b: 1 }): { r: number; g: number; b: number } {
  const hex = ACCENTS[STREAM_VISUALS[kind].accent].replace('#', '');
  target.r = parseInt(hex.slice(0, 2), 16) / 255;
  target.g = parseInt(hex.slice(2, 4), 16) / 255;
  target.b = parseInt(hex.slice(4, 6), 16) / 255;
  return target;
}
