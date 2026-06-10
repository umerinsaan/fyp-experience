export function phaseProgress(p: number, start: number, end: number): number {
  if (p <= start) return 0;
  if (p >= end) return 1;
  return (p - start) / (end - start);
}

export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/** Weighted cinematic ease — slow start and end */
export function easeInOutQuint(t: number): number {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function damp(current: number, target: number, lambda: number, delta: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * delta));
}

export function clamp01(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Maps x in [inA,inB] to [outA,outB], clamped. */
export function mapRange(x: number, inA: number, inB: number, outA: number, outB: number): number {
  return lerp(outA, outB, clamp01((x - inA) / (inB - inA)));
}

/** Frame-rate independent damping for THREE-like vector lerp factors. */
export function dampFactor(lambda: number, delta: number): number {
  return 1 - Math.exp(-lambda * delta);
}

/**
 * Piecewise-linear interpolation across sorted stops → values, clamped at ends.
 * Used by overlays via function-form `useTransform` so they stay JS-driven and
 * in perfect lockstep with the 3D (no native ScrollTimeline offloading).
 */
export function interp(x: number, stops: number[], values: number[]): number {
  if (x <= stops[0]) return values[0];
  const n = stops.length;
  if (x >= stops[n - 1]) return values[n - 1];
  for (let i = 0; i < n - 1; i += 1) {
    if (x >= stops[i] && x <= stops[i + 1]) {
      const span = stops[i + 1] - stops[i] || 1e-6;
      return lerp(values[i], values[i + 1], (x - stops[i]) / span);
    }
  }
  return values[n - 1];
}
