/**
 * Shared helpers for act scenes living inside the single persistent canvas.
 *
 * Scenes never mount/unmount per act — they self-hide via `presence()` so the
 * scene graph stays stable (smooth) while off-screen geometry is skipped.
 */
import { actWindowById } from '@/experience/act-model';
import type { ActId } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

export interface ScenePresence {
  /** 0..1 visibility envelope for the scene (use for opacity). */
  value: number;
  /** Whether the scene should render this frame. */
  visible: boolean;
  /** Local progress through the act window, ignoring pad, 0..1. */
  local: number;
}

/**
 * Cross-fade envelope for a scene tied to an act window. The scene becomes
 * visible slightly before its act and lingers slightly after, so neighbouring
 * sets dissolve into each other instead of snapping.
 */
export function actPresence(
  p: number,
  actId: ActId,
  opts: { padIn?: number; padOut?: number; fade?: number } = {},
): ScenePresence {
  const { start, end } = actWindowById(actId);
  const padIn = opts.padIn ?? 0.04;
  const padOut = opts.padOut ?? 0.04;
  const fade = opts.fade ?? 0.035;

  const from = start - padIn;
  const to = end + padOut;
  const local = clamp01((p - start) / Math.max(end - start, 1e-6));

  if (p <= from || p >= to) return { value: 0, visible: false, local };

  let value = 1;
  if (p < from + fade) value = clamp01((p - from) / fade);
  else if (p > to - fade) value = clamp01((to - p) / fade);

  return { value, visible: value > 0.002, local };
}

/** Smooth 0..1 envelope across an arbitrary global-progress window. */
export function windowPresence(p: number, start: number, end: number, fade = 0.03): number {
  if (p <= start || p >= end) return 0;
  if (p < start + fade) return clamp01((p - start) / fade);
  if (p > end - fade) return clamp01((end - p) / fade);
  return 1;
}
