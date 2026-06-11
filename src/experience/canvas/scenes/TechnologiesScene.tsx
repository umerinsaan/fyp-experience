/**
 * ACT III — Technologies. Ambient drifting particles + soft radial pulse.
 * Motion stays peripheral — copy lives on opaque 2D panels.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { experiencePerfCaps } from '@/experience/experience-performance';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { techListLocal, TECH_EXPLOSION_END } from '@/experience/technologies-phases';
import { clamp01 } from '@/story/scroll-math';

function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function TechnologiesScene({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const caps = useMemo(() => experiencePerfCaps(reduced), [reduced]);
  const count = caps.technologiesParticleCount;

  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.InstancedMesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: (seeded(i + 1) - 0.5) * 14,
        y: (seeded(i + 9) - 0.5) * 8,
        z: -4.2 - seeded(i + 17) * 3,
        speed: 0.08 + seeded(i + 23) * 0.14,
        phase: seeded(i + 31) * Math.PI * 2,
      })),
    [count],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const particles = particlesRef.current;
    if (!group || !particles) return;

    const p = progressRef.current;
    const pres = actPresence(p, 'technologies', { padIn: 0.05, padOut: 0.08 });
    if (!pres.visible) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const t = clock.getElapsedTime();
    const local = pres.local;
    const listL = techListLocal(local);
    const burst = clamp01(local / TECH_EXPLOSION_END);
    const ambient = 0.12 + burst * 0.1 + listL * 0.05;
    const sceneOpacity = pres.value * Math.min(0.25, ambient);

    for (let i = 0; i < count; i += 1) {
      const o = offsets[i]!;
      const drift = Math.sin(t * o.speed + o.phase) * 0.35;
      const lift = Math.cos(t * o.speed * 0.7 + o.phase) * 0.2;
      dummy.position.set(o.x + drift, o.y + lift, o.z);
      const s = (0.025 + seeded(i + 5) * 0.02) * sceneOpacity * 4;
      dummy.scale.setScalar(Math.max(0.001, s));
      dummy.updateMatrix();
      particles.setMatrixAt(i, dummy.matrix);
    }
    particles.instanceMatrix.needsUpdate = true;
    (particles.material as THREE.MeshBasicMaterial).opacity = sceneOpacity;

    const pulse = pulseRef.current;
    if (pulse) {
      const pulseScale = 2.8 + Math.sin(t * 0.45) * 0.35 + burst * 0.6;
      pulse.scale.setScalar(pulseScale);
      (pulse.material as THREE.MeshBasicMaterial).opacity = sceneOpacity * 0.35;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={pulseRef} position={[0, 0, -5.2]}>
        <ringGeometry args={[1.8, 2.2, 48]} />
        <meshBasicMaterial
          color={ACCENTS.mint}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      <instancedMesh ref={particlesRef} args={[undefined, undefined, count]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial
          color={ACCENTS.cyan}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  );
}
