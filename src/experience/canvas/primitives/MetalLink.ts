/**
 * Shared chain-link geometry + deterministic scatter helpers used by the
 * hero / workflow / vision rings so the "chain" motif carries through the film.
 */
import * as THREE from 'three';

/** Oval curb-link torus, face-on to camera (reused from the original system). */
export function createLinkGeometry(): THREE.TorusGeometry {
  const geo = new THREE.TorusGeometry(0.14, 0.04, 18, 32);
  geo.scale(1.15, 1, 1);
  return geo;
}

/** Stable pseudo-random in [-1,1] from an integer seed. */
export function seededUnit(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/** A scattered start position for link `i`, used when formation = 0. */
export function scatterPosition(i: number, spread: number, target: THREE.Vector3): THREE.Vector3 {
  return target.set(
    seededUnit(i + 1) * spread,
    seededUnit(i + 7) * spread * 0.6,
    -3.8 + seededUnit(i + 13) * spread * 0.5,
  );
}

/** Position of link `i` on a ring of `count` in the XY plane at z=-3.8. */
export function ringPosition(
  i: number,
  count: number,
  radius: number,
  rotation: number,
  target: THREE.Vector3,
): THREE.Vector3 {
  const a = (i / count) * Math.PI * 2 + rotation;
  return target.set(Math.cos(a) * radius, Math.sin(a) * radius * 0.62 - 0.15, -3.8);
}
