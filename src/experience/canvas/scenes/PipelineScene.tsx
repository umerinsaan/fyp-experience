/**
 * ACT IV·02 — Pipeline Designer. A DAG assembles node by node: Start → Recon,
 * then a fork into two parallel branches (Web + Host), joining at Verify. Edges
 * draw as glowing tubes; an execution wave pulses down them — the fork runs in
 * parallel, the join waits for both. Accent: cyan.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS, PIPELINE_NODES } from '@/experience/narrative';
import { clamp01, easeInOutCubic, smoothstep } from '@/story/scroll-math';

const CENTER_Z = -4.2;

/** Node layout (local space). Indices map to PIPELINE_NODES. */
const NODE_POS: readonly [number, number, number][] = [
  [-2.7, 0.0, 0], // start
  [-1.2, 0.0, 0], // recon
  [0.4, 0.95, 0], // web (fork top)
  [0.4, -0.95, 0], // host (fork bottom)
  [2.4, 0.0, 0], // verify (join)
];

/** Directed edges (source → target). */
const EDGES: readonly [number, number][] = [
  [0, 1],
  [1, 2],
  [1, 3],
  [2, 4],
  [3, 4],
];

export function PipelineScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Group | null)[]>([]);
  const nodeRingMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const nodeCoreMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const edgeTubeMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const nodeColors = useMemo(
    () => PIPELINE_NODES.map((n) => new THREE.Color(ACCENTS[n.accent])),
    [],
  );
  const vecs = useMemo(() => NODE_POS.map((pp) => new THREE.Vector3(...pp)), []);

  const edgeCurves = useMemo(
    () =>
      EDGES.map(([a, b]) => {
        const va = vecs[a];
        const vb = vecs[b];
        const mid = new THREE.Vector3().lerpVectors(va, vb, 0.5);
        mid.z += 0.0;
        return new THREE.CatmullRomCurve3([va.clone(), mid, vb.clone()]);
      }),
    [vecs],
  );

  const edgeGeoms = useMemo(
    () => edgeCurves.map((c) => new THREE.TubeGeometry(c, 32, 0.012, 6, false)),
    [edgeCurves],
  );

  // Reveal order: nodes appear at these local thresholds.
  const NODE_REVEAL = [0.06, 0.2, 0.36, 0.36, 0.62];
  const EDGE_REVEAL = [0.14, 0.3, 0.3, 0.56, 0.56];

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'pipeline', { padIn: 0.05, padOut: 0.05 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    const local = pres.local;

    for (let i = 0; i < PIPELINE_NODES.length; i += 1) {
      const reveal = easeInOutCubic(clamp01((local - NODE_REVEAL[i]) / 0.12));
      const g = nodeRefs.current[i];
      if (g) {
        const drop = (1 - reveal) * 0.4;
        g.position.set(vecs[i].x, vecs[i].y + drop, vecs[i].z);
        g.scale.setScalar(Math.max(0.0001, reveal));
        g.visible = reveal > 0.02;
      }
      const ring = nodeRingMatRefs.current[i];
      if (ring) ring.opacity = pres.value * reveal * (0.55 + Math.sin(t * 2.2 + i) * 0.12);
      const core = nodeCoreMatRefs.current[i];
      if (core) {
        core.opacity = pres.value * reveal;
        core.emissiveIntensity = 0.4 + reveal * 0.4;
      }
    }

    for (let e = 0; e < EDGES.length; e += 1) {
      const reveal = smoothstep(EDGE_REVEAL[e], EDGE_REVEAL[e] + 0.1, local);
      const tube = edgeTubeMatRefs.current[e];
      if (tube) tube.opacity = pres.value * reveal * 0.5;

      // Execution wave: fork edges (1,2) fire together; join edges (3,4) fire together.
      const pulse = pulseRefs.current[e];
      const pulseMat = pulseMatRefs.current[e];
      if (pulse && pulseMat) {
        const active = reveal > 0.6;
        if (!active) {
          pulse.visible = false;
        } else {
          pulse.visible = true;
          const phase = (t * 0.5 + e * 0.13) % 1;
          const pt = edgeCurves[e].getPoint(phase);
          pulse.position.copy(pt);
          pulse.scale.setScalar(0.07);
          pulseMat.opacity = pres.value * Math.sin(phase * Math.PI) * 0.9;
          pulseMat.color.copy(nodeColors[EDGES[e][1]]);
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0.05, CENTER_Z]} visible={false}>
      {/* Edges */}
      {edgeGeoms.map((geo, e) => (
        <mesh key={`edge-${e}`} geometry={geo}>
          <meshBasicMaterial
            ref={(m) => {
              edgeTubeMatRefs.current[e] = m;
            }}
            color={ACCENTS.cyan}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Execution-wave pulses */}
      {EDGES.map((_, e) => (
        <mesh
          key={`pulse-${e}`}
          ref={(el) => {
            pulseRefs.current[e] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 10, 10]} />
          <meshBasicMaterial
            ref={(m) => {
              pulseMatRefs.current[e] = m;
            }}
            color={ACCENTS.cyan}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Nodes */}
      {PIPELINE_NODES.map((node, i) => (
        <group
          key={node.id}
          ref={(el) => {
            nodeRefs.current[i] = el;
          }}
        >
          <mesh>
            <icosahedronGeometry args={[0.28, 1]} />
            <meshStandardMaterial
              ref={(m) => {
                nodeCoreMatRefs.current[i] = m;
              }}
              color="#eaf2ff"
              emissive={nodeColors[i]}
              emissiveIntensity={0.4}
              metalness={0.4}
              roughness={0.2}
              transparent
            />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.42, 0.009, 8, 40]} />
            <meshBasicMaterial
              ref={(m) => {
                nodeRingMatRefs.current[i] = m;
              }}
              color={nodeColors[i]}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
