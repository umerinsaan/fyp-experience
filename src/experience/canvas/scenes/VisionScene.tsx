/**
 * ACT IV–V — Impact & Vision finale. The chain returns, now whole: a complete,
 * connected ring slowly turning, with agents orbiting it. One platform, one
 * workflow, shared context. Calm, bright, confident. Accent: amber.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actWindowById } from '@/experience/act-model';
import { windowPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { createLinkGeometry, ringPosition } from '@/experience/canvas/primitives/MetalLink';
import { easeOutCubic } from '@/story/scroll-math';

const LINK_COUNT = 26;
const ORBITERS = 4;
const ORBIT_COLORS = [ACCENTS.cyan, ACCENTS.mint, ACCENTS.purple, ACCENTS.magenta];

export function VisionScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const orbitRefs = useRef<(THREE.Mesh | null)[]>([]);
  const geometry = useMemo(() => createLinkGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const slot = useMemo(() => new THREE.Vector3(), []);

  const startAt = useMemo(() => actWindowById('impact').start - 0.03, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;
    const p = progressRef.current;
    const value = windowPresence(p, startAt, 1.001, 0.04);
    group.visible = value > 0.002;
    if (!group.visible) return;

    const t = clock.getElapsedTime();
    const appear = easeOutCubic(Math.min(1, (p - startAt) / 0.05));
    group.rotation.z = t * 0.06;

    const mat = mesh.material as THREE.MeshPhysicalMaterial;
    mat.opacity = value;
    mat.transparent = true;

    for (let i = 0; i < LINK_COUNT; i += 1) {
      ringPosition(i, LINK_COUNT, 2.7, 0, slot);
      dummy.position.copy(slot);
      dummy.scale.setScalar(0.95 * appear);
      dummy.rotation.set(0, 0, (i / LINK_COUNT) * Math.PI * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < ORBITERS; i += 1) {
      const m = orbitRefs.current[i];
      if (!m) continue;
      const a = t * (0.3 + i * 0.05) + (i / ORBITERS) * Math.PI * 2;
      m.position.set(Math.cos(a) * 3.4, Math.sin(a) * 2.0, -3.8 + Math.sin(a * 1.3) * 0.6);
      m.scale.setScalar(0.16 * value);
      (m.material as THREE.MeshStandardMaterial).opacity = value;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, LINK_COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#f0e3cf"
          metalness={1}
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.03}
          envMapIntensity={1.7}
          transparent
        />
      </instancedMesh>

      {ORBIT_COLORS.map((c, i) => (
        <mesh
          key={c}
          ref={(el) => {
            orbitRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={c} emissive={c} emissiveIntensity={0.8} transparent />
        </mesh>
      ))}
    </group>
  );
}
