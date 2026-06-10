/**
 * ACT I — The Problem. A scattered toolbox: eight tinted "tool" cards drift
 * across the field, each on its own slow path, none connected to anything.
 * There is no cluster and no link — the disconnection IS the message. The
 * floating tool badges (ToolSprawlOverlay) ride on top of this backdrop.
 * Dominant accent: magenta, shading toward purple.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { easeOutCubic } from '@/story/scroll-math';

interface CardDef {
  /** Resting scatter position. */
  base: [number, number, number];
  /** Amplitude of the idle drift on each axis. */
  amp: [number, number, number];
  /** Per-card phase + speed so nothing moves in unison. */
  phase: number;
  speed: number;
  /** 0 = magenta, 1 = purple — per-card tint. */
  tint: number;
  scale: number;
}

const CARDS: CardDef[] = [
  { base: [-3.1, 1.9, -2.4], amp: [0.35, 0.35, 0.25], phase: 0.0, speed: 0.6, tint: 0.0, scale: 1.0 },
  { base: [3.2, 2.4, -2.9], amp: [0.35, 0.4, 0.3], phase: 1.1, speed: 0.5, tint: 1.0, scale: 0.92 },
  { base: [3.5, -1.6, -2.2], amp: [0.35, 0.38, 0.25], phase: 2.3, speed: 0.65, tint: 0.4, scale: 1.05 },
  { base: [-3.2, -2.0, -2.6], amp: [0.32, 0.38, 0.32], phase: 3.0, speed: 0.55, tint: 0.7, scale: 0.88 },
  { base: [-1.4, 0.4, -1.6], amp: [0.4, 0.32, 0.25], phase: 0.7, speed: 0.7, tint: 0.2, scale: 1.1 },
  { base: [1.6, -0.6, -1.9], amp: [0.35, 0.35, 0.28], phase: 1.8, speed: 0.6, tint: 0.9, scale: 0.96 },
  { base: [0.3, 2.4, -3.2], amp: [0.32, 0.38, 0.25], phase: 2.7, speed: 0.5, tint: 0.5, scale: 0.84 },
  { base: [-0.3, -2.4, -2.0], amp: [0.35, 0.32, 0.28], phase: 3.4, speed: 0.62, tint: 0.3, scale: 0.9 },
];

export function ProblemScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRefs = useRef<(THREE.Mesh | null)[]>([]);

  const colors = useMemo(() => {
    const magenta = new THREE.Color(ACCENTS.magenta);
    const purple = new THREE.Color(ACCENTS.purple);
    return CARDS.map((c) => magenta.clone().lerp(purple, c.tint));
  }, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'problem', { padIn: 0.05, padOut: 0.04 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    // Cards ease outward from a loose center as the act enters, then keep
    // drifting on their own loops — never re-converging.
    const spread = easeOutCubic(pres.local);

    for (let i = 0; i < CARDS.length; i += 1) {
      const c = CARDS[i];
      const mesh = cardRefs.current[i];
      if (!mesh) continue;

      const dx = Math.sin(t * c.speed + c.phase) * c.amp[0];
      const dy = Math.cos(t * c.speed * 0.8 + c.phase) * c.amp[1];
      const dz = Math.sin(t * c.speed * 0.6 + c.phase * 1.7) * c.amp[2];

      mesh.position.set(
        c.base[0] * (0.58 + spread * 0.38) + dx,
        c.base[1] * (0.58 + spread * 0.38) + dy,
        c.base[2] + dz,
      );
      mesh.rotation.set(
        Math.sin(t * 0.3 + c.phase) * 0.25,
        t * 0.12 + c.phase,
        Math.cos(t * 0.25 + c.phase) * 0.18,
      );
      mesh.scale.setScalar(c.scale * (0.6 + spread * 0.4));

      const m = mesh.material as THREE.MeshPhysicalMaterial;
      m.opacity = pres.value * 0.9;
      m.transparent = true;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {CARDS.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
        >
          <boxGeometry args={[0.6, 0.42, 0.05]} />
          <meshPhysicalMaterial
            color={colors[i]}
            metalness={0.85}
            roughness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.08}
            envMapIntensity={1.3}
            emissive={colors[i]}
            emissiveIntensity={0.12}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}
