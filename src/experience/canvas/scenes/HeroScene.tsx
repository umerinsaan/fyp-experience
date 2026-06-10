/**
 * ACT — Hero. A chain condenses out of drifting particles into a slow,
 * elegant ring. The chain is the motif of the whole film: connected links.
 * No explanation here — only intrigue and atmosphere.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import {
  createLinkGeometry,
  ringPosition,
  scatterPosition,
} from '@/experience/canvas/primitives/MetalLink';
import { easeInOutCubic, easeOutCubic } from '@/story/scroll-math';

const LINK_COUNT = 30;

export function HeroScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createLinkGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const a = useMemo(() => new THREE.Vector3(), []);
  const b = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;

    const p = progressRef.current;
    // No padOut — the chain must be fully gone once the prologue ends.
    const pres = actPresence(p, 'hero', { padIn: 0.02, padOut: 0, fade: 0.02 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    // The ring is mostly formed on load (intrigue, not emptiness), then settles
    // fully as the act progresses. Dust + sparkles imply the "emergence".
    const formation = easeInOutCubic(Math.min(1, 0.62 + pres.local * 0.9));
    group.rotation.z = t * 0.05;

    // Dissolve in the final third of the prologue so Act I starts on a clean stage.
    const dissolve = 1 - easeInOutCubic(Math.max(0, (pres.local - 0.68) / 0.32));

    const mat = mesh.material as THREE.MeshPhysicalMaterial;
    mat.opacity = pres.value * dissolve;
    mat.transparent = true;

    for (let i = 0; i < LINK_COUNT; i += 1) {
      scatterPosition(i, 4.2, a);
      ringPosition(i, LINK_COUNT, 2.55, 0, b);
      const f = easeOutCubic(Math.min(1, formation * 1.1 - (i / LINK_COUNT) * 0.08));
      dummy.position.lerpVectors(a, b, Math.max(0, f));
      const scale = (0.55 + 0.45 * Math.max(0, f)) * 1;
      dummy.scale.setScalar(scale);
      dummy.rotation.set(0, 0, (i / LINK_COUNT) * Math.PI * 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, undefined, LINK_COUNT]}
        frustumCulled={false}
      >
        <meshPhysicalMaterial
          color="#cdd9e8"
          metalness={1}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.04}
          envMapIntensity={1.6}
          transparent
        />
      </instancedMesh>
    </group>
  );
}
