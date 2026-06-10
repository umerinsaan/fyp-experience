/**
 * Cross-layer signals between R3F scenes and DOM audio driver (Pass 2.5).
 * Avoids coupling ArchitectureScene to React audio hooks.
 */

type RippleListener = (strength: number) => void;

let rippleListeners: RippleListener[] = [];
let lastRippleEmit = 0;

const RIPPLE_THROTTLE_MS = 160;

/** Called from ArchitectureScene when a packet crosses the trust membrane. */
export function emitBoundaryRipple(strength = 1): void {
  const now = performance.now();
  if (now - lastRippleEmit < RIPPLE_THROTTLE_MS) return;
  lastRippleEmit = now;
  for (const listener of rippleListeners) listener(strength);
}

export function onBoundaryRipple(listener: RippleListener): () => void {
  rippleListeners.push(listener);
  return () => {
    rippleListeners = rippleListeners.filter((l) => l !== listener);
  };
}

export function resetArchitectureSignals(): void {
  lastRippleEmit = 0;
}
