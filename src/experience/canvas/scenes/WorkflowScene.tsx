/**
 * ACT III — Workflow (Pass 5).
 * Metal links assemble into one ring; mint command streams rhyme with Architecture act.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { experiencePerfCaps } from '@/experience/experience-performance';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS, WORKFLOW_STEPS } from '@/experience/narrative';
import { createLinkGeometry } from '@/experience/canvas/primitives/MetalLink';
import { clamp01, easeInOutCubic } from '@/story/scroll-math';

const COUNT = WORKFLOW_STEPS.length;
const RADIUS = 2.5;
const CENTER_Z = -3.8;
const FOCUS = new THREE.Vector3(0, -0.05, -2.4);

function ringSlot(i: number, rotation: number, target: THREE.Vector3): THREE.Vector3 {
  const a = (i / COUNT) * Math.PI * 2 - Math.PI / 2 + rotation;
  return target.set(Math.cos(a) * RADIUS, Math.sin(a) * RADIUS * 0.66, CENTER_Z);
}

export function WorkflowScene({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const caps = useMemo(() => experiencePerfCaps(reduced), [reduced]);
  const packetCount = caps.workflowPacketCount;

  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const connectorRef = useRef<THREE.LineSegments>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const streamRef = useRef<THREE.InstancedMesh>(null);
  const corrRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createLinkGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const slot = useMemo(() => new THREE.Vector3(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const slots = useMemo(() => Array.from({ length: COUNT }, () => new THREE.Vector3()), []);
  const placedAmt = useMemo(() => new Array<number>(COUNT).fill(0), []);
  const pulseVec = useMemo(() => new THREE.Vector3(), []);
  const connectorGeom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(COUNT * 2 * 3), 3));
    return geo;
  }, []);

  const corrCount = Math.max(2, Math.floor(packetCount / 5));

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const mesh = meshRef.current;
    if (!group || !mesh) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'workflow', { padIn: 0.05, padOut: 0.08 });
    if (!pres.visible) {
      group.visible = false;
      return;
    }
    group.visible = true;

    const t = clock.getElapsedTime();
    const local = pres.local;
    const assemble = local * COUNT;
    const activeStep = Math.min(COUNT - 1, Math.floor(assemble));
    const allPlaced = local >= 0.985;
    const lockIn = allPlaced ? clamp01((local - 0.985) / 0.015) : 0;
    const ringSpin = allPlaced ? (local - 0.985) * 4 + t * 0.03 : 0;
    const flowSpeed = 0.32 + lockIn * 0.22;

    const mat = mesh.material as THREE.MeshPhysicalMaterial;
    mat.opacity = pres.value;
    mat.transparent = true;

    for (let i = 0; i < COUNT; i += 1) {
      let placed: number;
      let focusBump = 0;
      if (i < activeStep) placed = 1;
      else if (i === activeStep) {
        const stepLocal = clamp01(assemble - activeStep);
        placed = easeInOutCubic(stepLocal);
        focusBump = Math.sin(stepLocal * Math.PI) * 0.5;
      } else placed = -1;

      ringSlot(i, ringSpin, slot);
      slots[i].copy(slot);
      placedAmt[i] = placed;

      if (placed < 0) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const isActive = i === activeStep;
      pos.lerpVectors(FOCUS, slot, placed);
      dummy.position.copy(pos);
      const scale = (0.88 + focusBump * 0.35 + (isActive ? 0.08 : 0)) * (1 + lockIn * 0.06) * pres.value;
      dummy.scale.setScalar(Math.max(0.001, scale));
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    const connector = connectorRef.current;
    if (connector) {
      const arr = connectorGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < COUNT; i += 1) {
        const j = (i + 1) % COUNT;
        const a = slots[i];
        const b = slots[j];
        const live = placedAmt[i] >= 0.85 && placedAmt[j] >= 0.85;
        if (live) {
          arr.setXYZ(i * 2 + 0, a.x, a.y, a.z);
          arr.setXYZ(i * 2 + 1, b.x, b.y, b.z);
        } else {
          arr.setXYZ(i * 2 + 0, a.x, a.y, a.z);
          arr.setXYZ(i * 2 + 1, a.x, a.y, a.z);
        }
      }
      arr.needsUpdate = true;
      const lm = connector.material as THREE.LineBasicMaterial;
      lm.opacity = pres.value * (0.28 + lockIn * 0.42);
      lm.transparent = true;
    }

    const streams = streamRef.current;
    if (streams) {
      for (let pi = 0; pi < packetCount; pi += 1) {
        const seg = pi % COUNT;
        const j = (seg + 1) % COUNT;
        const live = placedAmt[seg] >= 0.55 && placedAmt[j] >= 0.55;
        if (!live) {
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          streams.setMatrixAt(pi, dummy.matrix);
          continue;
        }
        const phase = (t * flowSpeed + pi / packetCount) % 1;
        pos.lerpVectors(slots[seg], slots[j], phase);
        tangent.subVectors(slots[j], slots[seg]).normalize();
        dummy.position.copy(pos);
        const streak = 0.038 + Math.sin(phase * Math.PI) * 0.02;
        dummy.scale.set(streak * 0.55, streak * 0.45, streak * 2.2);
        dummy.lookAt(pos.x + tangent.x, pos.y + tangent.y, pos.z + tangent.z);
        dummy.updateMatrix();
        streams.setMatrixAt(pi, dummy.matrix);
      }
      streams.instanceMatrix.needsUpdate = true;
      (streams.material as THREE.MeshBasicMaterial).opacity = pres.value * (0.55 + lockIn * 0.35);
    }

    const corr = corrRef.current;
    if (corr) {
      for (let ci = 0; ci < corrCount; ci += 1) {
        const seg = (ci * 2 + 1) % COUNT;
        const j = (seg + 1) % COUNT;
        const live = placedAmt[seg] >= 0.85 && placedAmt[j] >= 0.85;
        if (!live || lockIn < 0.2) {
          dummy.scale.setScalar(0);
          dummy.updateMatrix();
          corr.setMatrixAt(ci, dummy.matrix);
          continue;
        }
        const phase = (t * (flowSpeed * 0.85) + ci / corrCount + 0.25) % 1;
        pos.lerpVectors(slots[seg], slots[j], phase);
        dummy.position.copy(pos);
        const s = 0.028 * Math.sin(phase * Math.PI);
        dummy.scale.set(s, s, s * 1.8);
        dummy.updateMatrix();
        corr.setMatrixAt(ci, dummy.matrix);
      }
      corr.instanceMatrix.needsUpdate = true;
      (corr.material as THREE.MeshBasicMaterial).opacity = pres.value * lockIn * 0.72;
    }

    const pulse = pulseRef.current;
    if (pulse) {
      if (allPlaced) {
        const fpos = (t * 0.14) % 1;
        const seg = fpos * COUNT;
        const i0 = Math.floor(seg) % COUNT;
        const i1 = (i0 + 1) % COUNT;
        pulseVec.lerpVectors(slots[i0], slots[i1], seg - Math.floor(seg));
        pulse.position.copy(pulseVec);
        pulse.scale.setScalar(0.06 * pres.value);
        (pulse.material as THREE.MeshBasicMaterial).opacity = pres.value * 0.75;
      } else {
        pulse.scale.setScalar(0.0001);
        (pulse.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <instancedMesh ref={meshRef} args={[geometry, undefined, COUNT]} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#b8d0c8"
          metalness={1}
          roughness={0.14}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
          transparent
        />
      </instancedMesh>

      <lineSegments ref={connectorRef} geometry={connectorGeom}>
        <lineBasicMaterial
          color={ACCENTS.mint}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      <instancedMesh ref={streamRef} args={[undefined, undefined, packetCount]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={ACCENTS.mint}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      <instancedMesh ref={corrRef} args={[undefined, undefined, corrCount]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={ACCENTS.purple}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial
          color={ACCENTS.mint}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
