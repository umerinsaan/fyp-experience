import { easeInOutQuint, phaseProgress } from '@/story/scroll-math';
import { STORY_PHASES } from '@/content/chapter-pentest';

export const CHAIN_NODE_COUNT = 8;
const SLOT = 1 / CHAIN_NODE_COUNT;

/** 0→1 across the sequential chain-build scroll window. */
export function chainBuildT(scrollP: number): number {
  return easeInOutQuint(
    phaseProgress(scrollP, STORY_PHASES.anchorZoomEnd, STORY_PHASES.orbitEnd),
  );
}

/** @deprecated use chainBuildT */
export function chainExplodeT(scrollP: number): number {
  return chainBuildT(scrollP);
}

/** Per-link appear progress — each node gets its own scroll slot, stays at 1 once added. */
export function chainNodeT(globalBuild: number, order: number): number {
  const appearStart = order * SLOT;
  const appearEnd = appearStart + SLOT * 0.4;
  if (globalBuild <= appearStart) return 0;
  if (globalBuild >= appearEnd) return 1;
  return easeInOutQuint((globalBuild - appearStart) / (appearEnd - appearStart));
}

export function chainNodeRevealed(globalBuild: number, order: number): boolean {
  return chainNodeT(globalBuild, order) > 0.03;
}

/** Which link is currently being introduced (-1 = full-chain view). */
export function chainActiveIndex(globalBuild: number): number {
  const full = chainFullViewTFromBuild(globalBuild);
  if (full > 0.55) return -1;

  for (let i = CHAIN_NODE_COUNT - 1; i >= 0; i -= 1) {
    const t = chainNodeT(globalBuild, i);
    if (t > 0 && t < 1) return i;
  }

  for (let i = CHAIN_NODE_COUNT - 1; i >= 0; i -= 1) {
    const holdStart = i * SLOT + SLOT * 0.4;
    const holdEnd = (i + 1) * SLOT;
    if (globalBuild >= holdStart && globalBuild < holdEnd) return i;
  }

  return 0;
}

/** 0 during build, 1 when the complete chain is on display. */
export function chainFullViewT(scrollP: number): number {
  return easeInOutQuint(
    phaseProgress(scrollP, STORY_PHASES.orbitEnd, STORY_PHASES.chaosStart + 0.03),
  );
}

function chainFullViewTFromBuild(globalBuild: number): number {
  const threshold = 1 - SLOT * 0.35;
  if (globalBuild < threshold) return 0;
  return easeInOutQuint((globalBuild - threshold) / (1 - threshold));
}

export function chainFlowProgress(globalBuild: number): number {
  let sum = 0;
  for (let i = 0; i < CHAIN_NODE_COUNT; i += 1) sum += chainNodeT(globalBuild, i);
  return sum / (CHAIN_NODE_COUNT - 1);
}

export function chainVisibleCount(globalBuild: number): number {
  let count = 0;
  for (let i = 0; i < CHAIN_NODE_COUNT; i += 1) {
    if (chainNodeRevealed(globalBuild, i)) count += 1;
  }
  return count;
}
