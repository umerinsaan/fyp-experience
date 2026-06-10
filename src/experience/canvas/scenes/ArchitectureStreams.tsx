/**
 * Semantic data streams — traveling packets along architecture edge curves.
 * Full diagram stays drawn; streams run on all edges once revealed.
 */
import { useFrame } from '@react-three/fiber';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  architectureGlobalLocal,
  architectureNodeStep,
  architecturePhase,
  architecturePhaseProgress,
} from '@/experience/architecture-phases';
import {
  streamActivePerConnection,
  streamColor,
  streamSpeedMultiplier,
  STREAM_VISUALS,
  streamMaxPerConnection,
} from '@/experience/architecture-streams';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ALL_CONNECTIONS, traverseEdgeIndex } from '@/experience/canvas/scenes/architecture-layout';
import { experiencePerfCaps } from '@/experience/experience-performance';
import { ARCH_CONNECTIONS } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

interface StreamSlot {
  connIndex: number;
  instanceIndex: number;
}

function buildStreamSlots(): StreamSlot[] {
  const slots: StreamSlot[] = [];
  ARCH_CONNECTIONS.forEach((conn, connIndex) => {
    const max = streamMaxPerConnection(conn.stream);
    for (let i = 0; i < max; i += 1) {
      slots.push({ connIndex, instanceIndex: i });
    }
  });
  return slots;
}

const ALL_SLOTS = buildStreamSlots();

function diagramRevealAlpha(
  phase: ReturnType<typeof architecturePhase>,
  archLocal: number,
): number {
  if (archLocal < 0) return 0;
  if (phase === 'handoff') {
    const handoffT = architecturePhaseProgress(archLocal, 'handoff');
    return clamp01(handoffT / 0.5) * 0.25;
  }
  if (phase === 'pullback') {
    const pullT = architecturePhaseProgress(archLocal, 'pullback');
    return clamp01(0.25 + (pullT / 0.42) * 0.75);
  }
  return 1;
}

function streamEmphasis(
  connIndex: number,
  phase: ReturnType<typeof architecturePhase>,
  step: number,
): number {
  if (phase === 'wide' || phase === 'finale') return 1;
  if (phase === 'traverse' && step >= 0) {
    const outgoing = traverseEdgeIndex(step);
    return connIndex === outgoing ? 0.88 : 0.38;
  }
  return 0.32;
}

export function ArchitectureStreams({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const caps = useMemo(() => experiencePerfCaps(reduced), [reduced]);
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const colorScratch = useMemo(() => ({ r: 1, g: 1, b: 1 }), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(ALL_SLOTS.length * 3), 3);
  }, []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const p = progressRef.current;
    const pres = actPresence(p, 'architecture', { padIn: 0.04, padOut: 0.1 });
    if (!pres.visible) {
      mesh.visible = false;
      return;
    }

    const archLocal = architectureGlobalLocal(p);
    if (archLocal < 0) {
      mesh.visible = false;
      return;
    }

    const phase = architecturePhase(archLocal);
    const diagramAlpha = diagramRevealAlpha(phase, archLocal);
    if (diagramAlpha < 0.2) {
      mesh.visible = false;
      return;
    }

    const step = architectureNodeStep(archLocal);
    const speedMul = streamSpeedMultiplier(phase, archLocal);
    const t = clock.getElapsedTime();
    const density = caps.streamDensity;
    const reducedCap = reduced ? 2 : Infinity;

    for (let si = 0; si < ALL_SLOTS.length; si += 1) {
      const slot = ALL_SLOTS[si];
      const ci = slot.connIndex;
      const conn = ALL_CONNECTIONS[ci];
      const kind = ARCH_CONNECTIONS[ci].stream;
      const visual = STREAM_VISUALS[kind];
      const maxPerConn = Math.min(streamMaxPerConnection(kind), reduced ? reducedCap : streamMaxPerConnection(kind));
      const activeCount = Math.min(
        maxPerConn,
        Math.ceil(streamActivePerConnection(kind, phase, archLocal) * density),
      );
      const emphasis = streamEmphasis(ci, phase, step);
      const curve = conn.curve;
      const rgb = streamColor(kind, colorScratch);

      if (slot.instanceIndex >= activeCount) {
        dummy.scale.setScalar(0);
        dummy.updateMatrix();
        mesh.setMatrixAt(si, dummy.matrix);
        continue;
      }

      const phaseOffset = (slot.instanceIndex / Math.max(activeCount, 1) + ci * 0.07) % 1;
      const travel = (t * visual.speed * speedMul + phaseOffset) % 1;
      curve.getPoint(travel, pos);
      curve.getTangent(travel, tangent).normalize();

      const pulse = Math.sin(travel * Math.PI) * 0.5 + 0.5;
      const scale = visual.scale * (0.7 + pulse * 0.3) * emphasis;
      const stretch = visual.stretch;

      dummy.position.copy(pos);
      dummy.scale.set(scale * 0.04, scale * 0.035, scale * 0.04 * stretch);
      dummy.lookAt(pos.x + tangent.x, pos.y + tangent.y, pos.z + tangent.z);
      dummy.updateMatrix();
      mesh.setMatrixAt(si, dummy.matrix);
      mesh.setColorAt(si, new THREE.Color(rgb.r, rgb.g, rgb.b));
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.visible = true;

    if (matRef.current) {
      matRef.current.opacity = pres.value * diagramAlpha * (phase === 'wide' || phase === 'finale' ? 0.88 : 0.62);
    }
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, ALL_SLOTS.length]}
      frustumCulled={false}
      renderOrder={5}
      visible={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial
        ref={matRef}
        color="#ffffff"
        transparent
        opacity={0}
        fog={false}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
