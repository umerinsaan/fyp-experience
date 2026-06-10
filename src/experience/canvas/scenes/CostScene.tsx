/**
 * ACT I — The Cost. The same unit of work duplicates into a dense grid:
 * repeated effort across subnets, engagements, quarters. It accumulates until
 * it feels heavy and overwhelming, then the act ends. Accent: magenta.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { beatWindow } from '@/experience/act-model';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { createLinkGeometry } from '@/experience/canvas/primitives/MetalLink';
import { clamp01, easeOutCubic } from '@/story/scroll-math';

const COLS = 9;
const ROWS = 6;
const COUNT = COLS * ROWS;

export function CostScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const accent = useMemo(() => new THREE.Color(ACCENTS.magenta), []);
  // Reuse the chain-link motif: the "cost" is the same link duplicated endlessly.
  const linkGeometry = useMemo(() => createLinkGeometry(), []);

  // Reveal order ripples out from the centre so it reads as "spreading".
  const order = useMemo(() => {
    const arr = Array.from({ length: COUNT }, (_, i) => i);
    const cx = (COLS - 1) / 2;
    const cy = (ROWS - 1) / 2;
    return arr.sort((p, q) => {
      const dp = Math.hypot((p % COLS) - cx, Math.floor(p / COLS) - cy);
      const dq = Math.hypot((q % COLS) - cx, Math.floor(q / COLS) - cy);
      return dp - dq;
    });
  }, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'cost', { padIn: 0.045, padOut: 0.035 });
    const manualWin = beatWindow('cost', 1, 4);
    const stitchWin = beatWindow('cost', 2, 4);
    const hideChains =
      (p >= manualWin.inStart && p <= manualWin.outEnd) ||
      (p >= stitchWin.inStart && p <= stitchWin.outEnd);
    group.visible = pres.visible && !hideChains;
    if (!pres.visible || hideChains) return;

    const t = clock.getElapsedTime();
    group.rotation.z = t * 0.04 * pres.local;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.opacity = pres.value;
    mat.transparent = true;

    const gapX = 1.05;
    const gapY = 0.95;
    for (let i = 0; i < COUNT; i += 1) {
      const idx = order[i];
      const col = idx % COLS;
      const row = Math.floor(idx / COLS);
      const x = (col - (COLS - 1) / 2) * gapX;
      const y = (row - (ROWS - 1) / 2) * gapY;
      const reveal = clamp01(pres.local * 1.4 - (i / COUNT) * 1.1);
      const e = easeOutCubic(reveal);
      const pop = Math.sin(t * 1.2 + i) * 0.04 * e;
      dummy.position.set(x, y + pop, -4.2 - (1 - e) * 2.2);
      // Alternate link orientation so the grid reads as repeating chain links.
      dummy.rotation.set(0, 0, (idx % 2 === 0 ? 0 : Math.PI / 2) + t * 0.05);
      dummy.scale.setScalar(0.95 * e);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={meshRef} args={[linkGeometry, undefined, COUNT]} frustumCulled={false}>
        <meshStandardMaterial
          color="#ffffff"
          emissive={accent}
          emissiveIntensity={0.32}
          metalness={0.6}
          roughness={0.25}
          transparent
        />
      </instancedMesh>
    </group>
  );
}
