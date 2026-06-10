/**
 * Pass 7 — chapter navigation (rail clicks, act jumps).
 */
import { ACT_WINDOWS } from '@/experience/act-model';
import type { ActId } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

/** Global progress at the opening beat of an act (past cross-fade pad). */
export function actJumpProgress(actId: ActId, localOffset = 0.08): number {
  const w = ACT_WINDOWS.find((a) => a.id === actId);
  if (!w) return 0;
  return w.start + (w.end - w.start) * clamp01(localOffset);
}

export function actJumpProgressByIndex(index: number, localOffset = 0.08): number {
  const w = ACT_WINDOWS[index];
  if (!w) return 0;
  return w.start + (w.end - w.start) * clamp01(localOffset);
}
