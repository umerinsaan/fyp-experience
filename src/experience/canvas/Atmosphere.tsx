/**
 * Atmosphere — depth fog, dust layers, accent lighting.
 * Pass 1: scroll-driven fog + ecosystem dust during architecture revelation.
 */
import { Environment } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { accentColorAt } from '@/experience/act-model';
import { architectureAtmosphereState } from '@/experience/architecture-phases';
import { CANVAS_CLEAR } from '@/experience/canvas/canvas-theme';

const DUST_COUNT = 220;
const ECOSYSTEM_DUST_COUNT = 360;
const BG = CANVAS_CLEAR;
const FOG = '#b4c5d8';

function DustLayer({
  reduced,
  count,
  spread,
  size,
  opacityScale,
  progressRef,
}: {
  reduced: boolean;
  count: number;
  spread: [number, number, number];
  size: number;
  /** Multiplier on architectureAtmosphereState.dustOpacity / ecosystemReveal. */
  opacityScale: (arch: ReturnType<typeof architectureAtmosphereState>) => number;
  progressRef: React.MutableRefObject<number>;
}) {
  const matRef = useRef<THREE.PointsMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * spread[0];
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread[1];
      positions[i * 3 + 2] = -3.5 + (Math.random() - 0.5) * spread[2];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [count, spread]);

  useFrame(() => {
    if (!matRef.current) return;
    const arch = architectureAtmosphereState(progressRef.current);
    matRef.current.opacity = opacityScale(arch);
  });

  if (reduced) return null;

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        size={size}
        sizeAttenuation
        color="#8fa3bc"
        transparent
        opacity={0.22}
        depthWrite={false}
      />
    </points>
  );
}

function AccentKeyLight({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const ref = useRef<THREE.PointLight>(null);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    if (!ref.current) return;
    accentColorAt(progressRef.current, color);
    ref.current.color.lerp(color, 0.06);
    const arch = architectureAtmosphereState(progressRef.current);
    ref.current.intensity = 2.8 + arch.ecosystemReveal * 0.65;
  });

  return <pointLight ref={ref} position={[1.2, 1.8, 1.8]} intensity={2.8} distance={28} decay={2} />;
}

export function Atmosphere({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const scene = useThree((s) => s.scene);

  useFrame(() => {
    const arch = architectureAtmosphereState(progressRef.current);
    if (scene.fog && scene.fog instanceof THREE.Fog) {
      scene.fog.near = arch.fogNear;
      scene.fog.far = arch.fogFar;
    }
  });

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[FOG, 5.5, 24]} />

      <ambientLight intensity={0.32} />
      <hemisphereLight args={['#f0f6fc', '#8fa8c4', 0.28]} />
      <directionalLight position={[5, 9, 4]} intensity={1.05} color="#f8fbff" />
      <directionalLight position={[-5, 1, -3]} intensity={0.35} color="#9eb4d0" />
      <AccentKeyLight progressRef={progressRef} />

      <Environment preset="city" environmentIntensity={reduced ? 0.55 : 0.72} />

      <DustLayer
        reduced={reduced}
        count={DUST_COUNT}
        spread={[22, 12, 12]}
        size={0.016}
        opacityScale={(a) => a.dustOpacity}
        progressRef={progressRef}
      />
      <DustLayer
        reduced={reduced}
        count={ECOSYSTEM_DUST_COUNT}
        spread={[32, 18, 18]}
        size={0.012}
        opacityScale={(a) => a.ecosystemReveal * 0.2}
        progressRef={progressRef}
      />
    </>
  );
}
