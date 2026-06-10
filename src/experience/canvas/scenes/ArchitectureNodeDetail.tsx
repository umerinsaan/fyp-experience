/**
 * Per-node interior micro-animations — orbit accents around diagram node cores.
 */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import {
  architectureGlobalLocal,
  architectureNodePower,
  architectureNodeStep,
  architecturePhase,
} from '@/experience/architecture-phases';
import { ACCENTS, type ArchNode } from '@/experience/narrative';

export function ArchitectureNodeDetail({
  node,
  nodeIndex,
  progressRef,
}: {
  node: ArchNode;
  nodeIndex: number;
  progressRef: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Mesh>(null);
  const accent = ACCENTS[node.accent];

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    const local = architectureGlobalLocal(progressRef.current);
    const phase = local >= 0 ? architecturePhase(local) : 'handoff';
    const allActive = phase === 'wide' || phase === 'finale';
    const step = local >= 0 ? architectureNodeStep(local) : -1;
    const power =
      local >= 0 && phase === 'traverse'
        ? architectureNodePower(local, nodeIndex)
        : allActive
          ? 1
          : 0;
    const active = allActive || step === nodeIndex;

    g.visible = power > 0.2 && active;
    g.scale.setScalar(power);

    const t = clock.getElapsedTime();
    if (spinRef.current) spinRef.current.rotation.z = t * 0.9;

    g.children.forEach((child) => {
      if (child.userData.orbit) {
        const o = child.userData.orbit as { r: number; speed: number; phase: number };
        child.position.set(
          Math.cos(t * o.speed + o.phase) * o.r,
          Math.sin(t * o.speed * 0.85 + o.phase) * o.r * 0.35,
          Math.sin(t * o.speed + o.phase) * o.r * 0.25,
        );
      }
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {node.id === 'console' && (
        <mesh position={[0, 0, 0.06]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={accent} transparent opacity={0.75} />
        </mesh>
      )}
      {node.id === 'api' &&
        [0, 1, 2].map((i) => (
          <mesh key={i} userData={{ orbit: { r: 0.18, speed: 1.1, phase: i * 2.1 } }}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color={accent} transparent opacity={0.55} />
          </mesh>
        ))}
      {(node.id === 'queue' || node.id === 'ingestion') && (
        <mesh ref={spinRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.14, 0.006, 6, 20]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} />
        </mesh>
      )}
      {node.id === 'dispatcher' &&
        [0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[Math.cos(i * 2.09) * 0.2, Math.sin(i * 2.09) * 0.08, 0.02]}
            scale={i === 0 ? 1.2 : 0.75}
          >
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshBasicMaterial color={i === 0 ? accent : '#94a3b8'} transparent opacity={i === 0 ? 0.7 : 0.35} />
          </mesh>
        ))}
      {node.id === 'channel' && (
        <mesh position={[0, 0, 0.08]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.22, 0.022]} />
          <meshBasicMaterial color={accent} transparent opacity={0.45} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
      {node.id === 'agent' &&
        [0, 1, 2].map((i) => (
          <mesh key={i} userData={{ orbit: { r: 0.17, speed: 1.3, phase: i * 2.09 } }}>
            <boxGeometry args={[0.04, 0.04, 0.012]} />
            <meshBasicMaterial color={accent} transparent opacity={0.55} />
          </mesh>
        ))}
      {node.id === 'storage' && (
        <mesh position={[0, 0.06, 0.02]}>
          <coneGeometry args={[0.05, 0.08, 5]} />
          <meshBasicMaterial color={accent} transparent opacity={0.5} />
        </mesh>
      )}
      {node.id === 'livefeed' && (
        <>
          <mesh position={[-0.1, 0, 0.04]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={accent} transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.1, 0, 0.04]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={ACCENTS.cyan} transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}
