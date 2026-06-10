/**
 * ACT IV — Agent Intelligence (Pass 4).
 * Morphs from Architecture agent layer; purple/mint bridge into full edge scene.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  AGENT_ACT_CENTER,
  AGENT_ORBIT_RADIUS,
  agentHandoffPosition,
  agentHandoffState,
} from '@/experience/agent-handoff';
import { experiencePerfCaps } from '@/experience/experience-performance';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS } from '@/experience/narrative';
import { clamp01, easeOutCubic } from '@/story/scroll-math';

const TARGET_COUNT = 6;
const OUTBOUND_COUNT = 5;
const CLOUD = new THREE.Vector3(-1.0, 3.6, -3.4);

export function AgentScene({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const caps = useMemo(() => experiencePerfCaps(reduced), [reduced]);
  const outboundCount = reduced ? Math.max(2, Math.floor(OUTBOUND_COUNT * caps.visualDensity)) : OUTBOUND_COUNT;
  const groupRef = useRef<THREE.Group>(null);
  const bridgeRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const bridgeRingRef = useRef<THREE.MeshBasicMaterial>(null);
  const bridgeCoreRef = useRef<THREE.MeshBasicMaterial>(null);
  const targetsRef = useRef<THREE.InstancedMesh>(null);
  const packetRef = useRef<THREE.InstancedMesh>(null);
  const outboundRef = useRef<THREE.InstancedMesh>(null);
  const lineRef = useRef<THREE.LineSegments>(null);
  const cloudLineRef = useRef<THREE.LineSegments>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const v = useMemo(() => new THREE.Vector3(), []);
  const center = useMemo(() => new THREE.Vector3(), []);
  const cloudLineGeom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * 3), 3));
    return geo;
  }, []);

  const targets = useMemo(
    () =>
      Array.from({ length: TARGET_COUNT }, (_, i) => {
        const a = (i / TARGET_COUNT) * Math.PI * 2;
        return new THREE.Vector3(
          AGENT_ACT_CENTER.x + 3.4 + Math.cos(a) * 0.6,
          AGENT_ACT_CENTER.y + Math.sin(a) * 2.1,
          AGENT_ACT_CENTER.z + Math.cos(a * 1.3) * 1.2,
        );
      }),
    [],
  );

  const lineGeom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const arr = new Float32Array(TARGET_COUNT * 2 * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'agent', { padIn: 0.05, padOut: 0.05 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const handoff = agentHandoffState(p);
    agentHandoffPosition(p, center);
    const t = clock.getElapsedTime();
    const reveal = easeOutCubic(clamp01(pres.local * 1.6));
    const settle = clamp01(handoff.morph);

    if (coreRef.current) {
      coreRef.current.position.copy(center);
      coreRef.current.rotation.y = t * 0.12;
      coreRef.current.scale.setScalar(reveal * (0.85 + settle * 0.15));
      (coreRef.current.material as THREE.MeshPhysicalMaterial).opacity = pres.value;
    }

    if (bridgeRef.current) bridgeRef.current.position.copy(center);

    const bridgeOp = pres.value * (1 - settle) * 0.55;
    if (bridgeCoreRef.current) bridgeCoreRef.current.opacity = bridgeOp * 0.5;
    if (bridgeRingRef.current) {
      bridgeRingRef.current.opacity = bridgeOp * (0.32 + Math.sin(t * 2.8) * 0.08);
    }

    const tg = targetsRef.current;
    if (tg) {
      for (let i = 0; i < TARGET_COUNT; i += 1) {
        const r = easeOutCubic(clamp01(pres.local * 1.8 - i * 0.1));
        dummy.position.copy(targets[i]);
        dummy.scale.setScalar(0.22 * r);
        dummy.rotation.set(t * 0.3 + i, t * 0.2, 0);
        dummy.updateMatrix();
        tg.setMatrixAt(i, dummy.matrix);
      }
      tg.instanceMatrix.needsUpdate = true;
      (tg.material as THREE.MeshPhysicalMaterial).opacity = pres.value * settle;
    }

    const line = lineRef.current;
    if (line) {
      const arr = lineGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < TARGET_COUNT; i += 1) {
        arr.setXYZ(i * 2 + 0, center.x, center.y, center.z);
        arr.setXYZ(i * 2 + 1, targets[i].x, targets[i].y, targets[i].z);
      }
      arr.needsUpdate = true;
      (line.material as THREE.LineBasicMaterial).opacity = pres.value * 0.28 * reveal * settle;
    }

    const pk = packetRef.current;
    if (pk) {
      for (let i = 0; i < TARGET_COUNT; i += 1) {
        const outPhase = (t * 0.5 + i / TARGET_COUNT) % 1;
        v.lerpVectors(center, targets[i], easeOutCubic(outPhase));
        dummy.position.copy(v);
        dummy.scale.setScalar(0.07 * pres.value * Math.sin(outPhase * Math.PI) * settle);
        dummy.updateMatrix();
        pk.setMatrixAt(i, dummy.matrix);

        const inPhase = (t * 0.4 + i / TARGET_COUNT + 0.5) % 1;
        v.lerpVectors(targets[i], center, easeOutCubic(inPhase));
        dummy.position.copy(v);
        dummy.scale.setScalar(0.06 * pres.value * Math.sin(inPhase * Math.PI) * settle);
        dummy.updateMatrix();
        pk.setMatrixAt(TARGET_COUNT + i, dummy.matrix);
      }
      pk.instanceMatrix.needsUpdate = true;
      (pk.material as THREE.MeshBasicMaterial).opacity = pres.value * settle;
    }

    const ob = outboundRef.current;
    if (ob) {
      for (let i = 0; i < outboundCount; i += 1) {
        const phase = (t * 0.45 + i / OUTBOUND_COUNT) % 1;
        v.lerpVectors(center, CLOUD, easeOutCubic(phase));
        dummy.position.copy(v);
        const s = 0.08 * pres.value * Math.sin(phase * Math.PI) * reveal * settle;
        dummy.scale.set(s, s * 2.6, s);
        dummy.updateMatrix();
        ob.setMatrixAt(i, dummy.matrix);
      }
      ob.instanceMatrix.needsUpdate = true;
      (ob.material as THREE.MeshBasicMaterial).opacity = pres.value * settle;
    }

    if (cloudLineRef.current) {
      const pos = cloudLineGeom.getAttribute('position') as THREE.BufferAttribute;
      pos.setXYZ(0, center.x, center.y, center.z);
      pos.setXYZ(1, CLOUD.x, CLOUD.y, CLOUD.z);
      pos.needsUpdate = true;
      (cloudLineRef.current.material as THREE.LineBasicMaterial).opacity = pres.value * 0.3 * reveal * settle;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      {/* Pass 4 bridge — architecture pulse residue */}
      <group ref={bridgeRef}>
        <mesh>
          <sphereGeometry args={[0.1, 12, 12]} />
          <meshBasicMaterial
            ref={bridgeCoreRef}
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
            ref={bridgeRingRef}
            color={ACCENTS.mint}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      </group>

      <mesh ref={coreRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.014, 12, 48]} />
        <meshPhysicalMaterial
          color="#b8d4cc"
          metalness={1}
          roughness={0.14}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.5}
          transparent
        />
      </mesh>

      <instancedMesh ref={targetsRef} args={[undefined, undefined, TARGET_COUNT]} frustumCulled={false}>
        <planeGeometry args={[1.1, 0.75]} />
        <meshPhysicalMaterial color="#c5d4e4" metalness={0.9} roughness={0.22} clearcoat={0.8} transparent />
      </instancedMesh>

      <instancedMesh ref={packetRef} args={[undefined, undefined, TARGET_COUNT * 2]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={ACCENTS.mint}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      <instancedMesh ref={outboundRef} args={[undefined, undefined, OUTBOUND_COUNT]} frustumCulled={false}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color={ACCENTS.purple}
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      <lineSegments ref={lineRef} geometry={lineGeom}>
        <lineBasicMaterial color={ACCENTS.mint} transparent opacity={0.28} />
      </lineSegments>
      <lineSegments ref={cloudLineRef} geometry={cloudLineGeom}>
        <lineBasicMaterial color={ACCENTS.purple} transparent opacity={0.3} />
      </lineSegments>
    </group>
  );
}
