/**
 * Shared glow / filament materials — additive highlights, no cartoon emissive solids.
 */
import * as THREE from 'three';

export function glowLineMaterial(color: string | THREE.Color, opacity = 0.5): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

export function glowPointMaterial(color: string, size = 0.02, opacity = 0.6): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

export function filamentMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: '#c8d4e4',
    metalness: 1,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
    transparent: true,
  });
}
