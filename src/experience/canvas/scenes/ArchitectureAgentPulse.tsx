/**
 * Pass 4 — agent intelligence pulse; bridges Architecture wide → Agent act.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  AGENT_ORBIT_COUNT,
  AGENT_ORBIT_RADIUS,
  agentHandoffPosition,
  agentHandoffState,
} from '@/experience/agent-handoff';
import { experiencePerfCaps } from '@/experience/experience-performance';
import {
  architectureGlobalLocal,
  architecturePhase,
  architecturePhaseProgress,
} from '@/experience/architecture-phases';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

export function ArchitectureAgentPulse({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const caps = useMemo(() => experiencePerfCaps(reduced), [reduced]);
  const groupRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.InstancedMesh>(null);
  const coreMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const ringMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const orbitAngles = useMemo(
    () => Array.from({ length: AGENT_ORBIT_COUNT }, (_, i) => (i / AGENT_ORBIT_COUNT) * Math.PI * 2),
    [],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    const p = progressRef.current;
    const handoff = agentHandoffState(p);
    const archPres = actPresence(p, 'architecture', { padIn: 0.04, padOut: 0.06 });
    const local = architectureGlobalLocal(p);

    let strength = handoff.pulse * (1 - handoff.morph * 0.85);
    if (archPres.visible && local >= 0) {
      const phase = architecturePhase(local);
      const wideT = architecturePhaseProgress(local, 'wide');
      const finaleT = architecturePhaseProgress(local, 'finale');
      const phaseStrength =
        phase === 'wide'
          ? 0.35 + wideT * 0.65
          : phase === 'finale'
            ? clamp01(1 - finaleT * 0.35)
            : 0;
      strength = Math.max(strength, phaseStrength * archPres.value);
    }

    if (strength < 0.04) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const t = clock.getElapsedTime();
    const op = strength;

    const anchor = agentHandoffPosition(p);
    group.position.set(anchor.x, anchor.y + 0.12, anchor.z);

    if (coreMatRef.current) coreMatRef.current.opacity = op * 0.42;
    if (ringMatRef.current) {
      ringMatRef.current.opacity = op * (0.28 + Math.sin(t * 2.8) * 0.08);
    }

    const mesh = orbitRef.current;
    if (!mesh) return;

    for (let i = 0; i < AGENT_ORBIT_COUNT; i += 1) {
      if (i >= caps.agentOrbitCount) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const a = orbitAngles[i] + t * (0.55 + (i % 3) * 0.12);
      const lift = Math.sin(t * 1.4 + i * 0.5) * 0.08;
      dummy.position.set(
        Math.cos(a) * AGENT_ORBIT_RADIUS,
        lift + 0.08,
        Math.sin(a) * AGENT_ORBIT_RADIUS * 0.65,
      );
      const s = 0.018 + (i % 4) * 0.004;
      dummy.scale.set(s, s, s * 1.6);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    (mesh.material as THREE.MeshBasicMaterial).opacity = op * 0.88;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial
          ref={coreMatRef}
          color={ACCENTS.purple}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[AGENT_ORBIT_RADIUS, 0.004, 8, 48]} />
        <meshBasicMaterial
          ref={ringMatRef}
          color={ACCENTS.mint}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <instancedMesh ref={orbitRef} args={[undefined, undefined, AGENT_ORBIT_COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={ACCENTS.purple}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
