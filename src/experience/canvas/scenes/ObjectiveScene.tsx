/**
 * ACT II — ambient center glow behind the 2D orbit overlay (Platform hub).
 */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { beatWindow } from '@/experience/act-model';
import { architectureGlobalLocal, insightFreezeT } from '@/experience/architecture-phases';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { clamp01, easeInOutCubic, smoothstep } from '@/story/scroll-math';

const CENTER_Z = -3.8;
const BEAT_COUNT = 6;

function beatProgress(p: number, index: number): number {
  const win = beatWindow('objective', index, BEAT_COUNT);
  if (p <= win.inStart) return 0;
  const end = win.outStart + (win.outEnd - win.outStart) * 0.65;
  return clamp01((p - win.inStart) / Math.max(end - win.inStart, 1e-6));
}

export function ObjectiveScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    if (architectureGlobalLocal(p) >= 0) {
      group.visible = false;
      return;
    }
    const pres = actPresence(p, 'objective', { padIn: 0.05, padOut: 0 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    const freeze = insightFreezeT(p);
    const unifyWin = beatWindow('objective', 3, BEAT_COUNT);
    const onOrbit = p >= unifyWin.inStart;
    const unifyT = onOrbit ? beatProgress(p, 3) : 0;
    const reveal = onOrbit ? easeInOutCubic(smoothstep(0.08, 0.9, unifyT)) : 0;
    const motion = (1 - freeze * 0.85) * (onOrbit ? 0.45 : 0);
    const glow = pres.value * reveal * 0.42;

    if (coreRef.current && coreMatRef.current) {
      const s = 0.05 + reveal * 0.28;
      coreRef.current.scale.setScalar(s);
      coreMatRef.current.opacity = glow;
      coreMatRef.current.emissiveIntensity = 0.35 + Math.sin(t * 1.4) * 0.08 * reveal;
    }
    if (haloRef.current && haloMatRef.current) {
      haloRef.current.rotation.z = t * 0.06 * motion;
      haloMatRef.current.opacity = glow * 0.35;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, CENTER_Z]} visible={false}>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          ref={coreMatRef}
          color="#ffffff"
          emissive={ACCENTS.cyan}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.2}
          transparent
          opacity={0}
        />
      </mesh>
      <mesh ref={haloRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.01, 10, 60]} />
        <meshBasicMaterial
          ref={haloMatRef}
          color={ACCENTS.cyan}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
