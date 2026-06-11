/**
 * FeatureAmbientScene — shared lightweight 3D backdrop for RBAC, Reports, and
 * Dashboard key-feature acts. Accent-colored particle field + subtle grid.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS, type AccentKey, type ActId } from '@/experience/narrative';

const PARTICLE_COUNT = 120;
const CENTER_Z = -4.2;

interface FeatureAmbientSceneProps {
  progressRef: React.MutableRefObject<number>;
  actId: ActId;
  accent: AccentKey;
}

export function FeatureAmbientScene({ progressRef, actId, accent }: FeatureAmbientSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const gridMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const accentColor = useMemo(() => new THREE.Color(ACCENTS[accent]), [accent]);

  const particlesGeom = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.5;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, actId, { padIn: 0.05, padOut: 0.05 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    group.rotation.y = Math.sin(t * 0.12) * 0.08;

    const points = pointsRef.current;
    if (points) {
      points.rotation.y = t * 0.04;
      const mat = points.material as THREE.PointsMaterial;
      mat.opacity = pres.value * 0.55;
    }

    const gridMat = gridMatRef.current;
    if (gridMat) gridMat.opacity = pres.value * 0.22;
  });

  return (
    <group ref={groupRef} position={[0, 0, CENTER_Z]} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[10, 6, 1, 1]} />
        <meshBasicMaterial
          ref={gridMatRef}
          color={accentColor}
          transparent
          opacity={0}
          wireframe
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <points ref={pointsRef} geometry={particlesGeom}>
        <pointsMaterial
          color={accentColor}
          size={0.045}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
