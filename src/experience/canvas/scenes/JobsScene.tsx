/**
 * ACT IV·01 — Jobs Engine. One JSON schema describes any tool. A payload token
 * travels through four stations — schema → validation gate → command template
 * → dispatch — changing form at each, then fires toward the edge agent. Behind
 * it, a faint field of template tiles hints at the 600+ seeded jobs. Accent: purple.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS, JOBS_STAGES } from '@/experience/narrative';
import { clamp01, easeInOutCubic, smoothstep } from '@/story/scroll-math';

const CENTER_Z = -4.0;
const STATION_X = [-2.55, -0.85, 0.85, 2.55];
const TILE_COUNT = 220;

export function JobsScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const stationRefs = useRef<(THREE.Group | null)[]>([]);
  const ringMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const plateMatRefs = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);
  const payloadRef = useRef<THREE.Mesh>(null);
  const payloadMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const trackRef = useRef<THREE.Mesh>(null);
  const tilesRef = useRef<THREE.Points>(null);
  const burstRef = useRef<THREE.Mesh>(null);
  const burstMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const stageColors = useMemo(() => JOBS_STAGES.map((s) => new THREE.Color(ACCENTS[s.accent])), []);
  const colA = useMemo(() => new THREE.Color(), []);
  const colB = useMemo(() => new THREE.Color(), []);

  const tilesGeom = useMemo(() => {
    const positions = new Float32Array(TILE_COUNT * 3);
    for (let i = 0; i < TILE_COUNT; i += 1) {
      const col = i % 20;
      const row = Math.floor(i / 20);
      positions[i * 3 + 0] = -3.4 + col * 0.36 + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 1] = 1.7 - row * 0.34 + (Math.random() - 0.5) * 0.1;
      positions[i * 3 + 2] = -2.2 - Math.random() * 1.4;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'jobs', { padIn: 0.05, padOut: 0.05 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    const local = pres.local;

    // Background template field fades in early.
    if (tilesRef.current) {
      const mat = tilesRef.current.material as THREE.PointsMaterial;
      mat.opacity = pres.value * smoothstep(0.0, 0.3, local) * 0.5;
      tilesRef.current.rotation.y = Math.sin(t * 0.1) * 0.05;
    }

    // Stations reveal in sequence.
    for (let i = 0; i < STATION_X.length; i += 1) {
      const reveal = easeInOutCubic(clamp01((local - i * 0.16) / 0.2));
      const g = stationRefs.current[i];
      if (g) {
        g.scale.setScalar(Math.max(0.0001, reveal));
        g.visible = reveal > 0.02;
      }
      const ring = ringMatRefs.current[i];
      if (ring) ring.opacity = pres.value * reveal * (0.5 + Math.sin(t * 2 + i) * 0.1);
      const plate = plateMatRefs.current[i];
      if (plate) plate.opacity = pres.value * reveal * 0.7;
    }

    // Track line linking the stations.
    if (trackRef.current) {
      (trackRef.current.material as THREE.MeshBasicMaterial).opacity =
        pres.value * smoothstep(0.1, 0.3, local) * 0.3;
    }

    // Payload token travels left→right, transforming at each stage.
    const travel = smoothstep(0.14, 0.86, local);
    const x = THREE.MathUtils.lerp(STATION_X[0], STATION_X[3], travel);
    const segF = clamp01(travel) * 3;
    const seg = Math.min(2, Math.floor(segF));
    const segT = segF - seg;
    colA.copy(stageColors[seg]);
    colB.copy(stageColors[seg + 1]);

    if (payloadRef.current && payloadMatRef.current) {
      const bob = Math.sin(t * 3) * 0.05;
      payloadRef.current.position.set(x, bob, 0);
      payloadRef.current.rotation.set(t * 0.8, t * 1.1, 0);
      const appear = smoothstep(0.12, 0.2, local);
      payloadRef.current.scale.setScalar(0.16 * Math.max(0.0001, appear));
      payloadMatRef.current.color.copy(colA).lerp(colB, segT);
      payloadMatRef.current.emissive.copy(colA).lerp(colB, segT);
      payloadMatRef.current.emissiveIntensity = 0.7;
      payloadMatRef.current.opacity = pres.value * appear;
    }

    // Dispatch burst when the payload reaches the final station.
    if (burstRef.current && burstMatRef.current) {
      const fire = smoothstep(0.84, 0.95, local);
      burstRef.current.position.set(STATION_X[3], 0, 0);
      const s = 0.2 + fire * 1.6;
      burstRef.current.scale.setScalar(s);
      burstMatRef.current.opacity = pres.value * fire * (1 - fire) * 4 * 0.6;
      burstMatRef.current.color.copy(stageColors[3]);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.1, CENTER_Z]} visible={false}>
      {/* Template field — the 600+ seeded jobs */}
      <points ref={tilesRef} geometry={tilesGeom} frustumCulled={false}>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          color={ACCENTS.purple}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Track */}
      <mesh ref={trackRef} position={[0, 0, -0.05]}>
        <boxGeometry args={[5.4, 0.012, 0.012]} />
        <meshBasicMaterial
          color={ACCENTS.purple}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Four stations */}
      {JOBS_STAGES.map((stage, i) => (
        <group
          key={stage.id}
          ref={(el) => {
            stationRefs.current[i] = el;
          }}
          position={[STATION_X[i], 0, 0]}
        >
          <mesh>
            <boxGeometry args={[0.92, 0.62, 0.04]} />
            <meshPhysicalMaterial
              ref={(m) => {
                plateMatRefs.current[i] = m;
              }}
              color="#eaf2ff"
              emissive={ACCENTS[stage.accent]}
              emissiveIntensity={0.16}
              metalness={0.1}
              roughness={0.1}
              transmission={0.8}
              thickness={0.3}
              ior={1.3}
              clearcoat={1}
              transparent
              opacity={0}
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.56, 0.01, 8, 48]} />
            <meshBasicMaterial
              ref={(m) => {
                ringMatRefs.current[i] = m;
              }}
              color={ACCENTS[stage.accent]}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}

      {/* Travelling payload token */}
      <mesh ref={payloadRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          ref={payloadMatRef}
          color={ACCENTS.cyan}
          emissive={ACCENTS.cyan}
          emissiveIntensity={0.7}
          metalness={0.3}
          roughness={0.2}
          transparent
        />
      </mesh>

      {/* Dispatch burst */}
      <mesh ref={burstRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          ref={burstMatRef}
          color={ACCENTS.amber}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
