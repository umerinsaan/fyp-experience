/**

 * ACT III — Architecture: accent diagram, semantic streams, cinematic layers.

 */

import { Text } from '@react-three/drei';

import { useFrame } from '@react-three/fiber';

import { useMemo, useRef } from 'react';

import * as THREE from 'three';

import { FONT_DISPLAY_3D } from '@/content/asset-manifest';

import {
  architectureGlobalLocal,
  architectureNodeStep,
  architecturePhase,
  architecturePhaseProgress,
  architectureWideProgress,
} from '@/experience/architecture-phases';

import { actPresence } from '@/experience/canvas/scene-utils';

import { ArchitectureFlowLabel } from '@/experience/canvas/scenes/ArchitectureFlowLabel';

import { ArchitectureStreams } from '@/experience/canvas/scenes/ArchitectureStreams';

import {

  ALL_CONNECTIONS,

  NODE_POS,

  NODE_RADIUS,

  traverseEdgeIndex,

} from '@/experience/canvas/scenes/architecture-layout';

import { ACCENTS, ARCH_CONNECTIONS, ARCH_NODES, ARCH_TARGET_SATELLITE } from '@/experience/narrative';

import { clamp01 } from '@/story/scroll-math';



const FILL_RADIUS = NODE_RADIUS * 0.9;

const RING_INNER = NODE_RADIUS * 0.935;

const RING_OUTER = NODE_RADIUS * 0.975;

const MUTED_STROKE = '#94a3b8';

const EDGE_BASE = '#1e293b';

const LABEL = '#1e293b';

const TUBE_R = 0.028;

const DOCK_FONT = 0.105;

const WIDE_FONT = 0.28;

const SAT_RADIUS = NODE_RADIUS * 0.42;

const SAT_FONT = 0.082;



type TroikaText = THREE.Object3D & {
  fillOpacity: number;
  outlineOpacity: number;
  fontSize: number;
  maxWidth: number;
  sync: () => void;
};



/** Fade the full diagram in early during pullback; stays drawn for traverse + wide. */
function diagramRevealAlpha(
  phase: ReturnType<typeof architecturePhase>,
  archLocal: number,
  pullT: number,
): number {
  if (archLocal < 0) return 0;
  if (phase === 'handoff') {
    const handoffT = architecturePhaseProgress(archLocal, 'handoff');
    return clamp01(handoffT / 0.5) * 0.25;
  }
  if (phase === 'pullback') return clamp01(0.25 + (pullT / 0.42) * 0.75);
  return 1;
}

function nodeIsFocused(
  i: number,
  phase: ReturnType<typeof architecturePhase>,
  step: number,
  allWide: boolean,
): boolean {
  if (allWide) return true;
  if (phase === 'traverse' && step === i) return true;
  return false;
}

export function ArchitectureScene({

  progressRef,

  reduced = false,

}: {

  progressRef: React.MutableRefObject<number>;

  reduced?: boolean;

}) {

  const groupRef = useRef<THREE.Group>(null);

  const nodeRefs = useRef<(THREE.Group | null)[]>([]);

  const fillMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const washMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const ringMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const labelRefs = useRef<(TroikaText | null)[]>([]);

  const edgeMeshRefs = useRef<(THREE.Mesh | null)[]>([]);

  const edgeMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const accentColors = useMemo(() => ARCH_NODES.map((n) => new THREE.Color(ACCENTS[n.accent])), []);

  const edgeAccentColors = useMemo(

    () => ARCH_CONNECTIONS.map((c) => new THREE.Color(ACCENTS[c.accent])),

    [],

  );



  const nodeGeos = useMemo(

    () =>

      ARCH_NODES.map(() => ({

        fill: new THREE.CircleGeometry(FILL_RADIUS, 48),

        wash: new THREE.CircleGeometry(FILL_RADIUS * 1.02, 48),

        ring: new THREE.RingGeometry(RING_INNER, RING_OUTER, 48),

      })),

    [],

  );



  const edgeGeoms = useMemo(

    () => ALL_CONNECTIONS.map((conn) => new THREE.TubeGeometry(conn.curve, 40, TUBE_R, 6, false)),

    [],

  );

  const satelliteGeos = useMemo(

    () => ({

      fill: new THREE.CircleGeometry(SAT_RADIUS * 0.9, 32),

      ring: new THREE.RingGeometry(SAT_RADIUS * 0.94, SAT_RADIUS * 1.04, 32),

    }),

    [],

  );

  const satelliteGroupRef = useRef<THREE.Group>(null);

  const satFillMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const satRingMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const satLabelRef = useRef<TroikaText | null>(null);

  useFrame(() => {

    const group = groupRef.current;

    if (!group) return;



    const p = progressRef.current;

    const pres = actPresence(p, 'architecture', { padIn: 0.04, padOut: 0.06, fade: 0.05 });

    if (!pres.visible) {

      group.visible = false;

      return;

    }

    group.visible = true;



    const archLocal = architectureGlobalLocal(p);

    const phase = archLocal >= 0 ? architecturePhase(archLocal) : 'handoff';

    const allActive = phase === 'wide' || phase === 'finale';

    const step = archLocal >= 0 ? architectureNodeStep(archLocal, ARCH_NODES.length) : -1;

    const pullT = archLocal >= 0 ? architecturePhaseProgress(archLocal, 'pullback') : 0;

    const wideT = archLocal >= 0 && allActive ? architectureWideProgress(archLocal) : 0;

    const diagramAlpha = diagramRevealAlpha(phase, archLocal, pullT);

    const outgoingEdge = phase === 'traverse' && step >= 0 ? traverseEdgeIndex(step) : -1;

    for (let i = 0; i < ARCH_NODES.length; i += 1) {

      const g = nodeRefs.current[i];

      if (!g) continue;



      if (diagramAlpha < 0.03) {

        g.visible = false;

        continue;

      }



      g.visible = true;

      g.position.copy(NODE_POS[ARCH_NODES[i].id]);

      g.rotation.set(0, 0, 0);

      g.scale.setScalar(1);



      const focused = nodeIsFocused(i, phase, step, allActive);

      const alpha = pres.value * diagramAlpha;

      const accent = accentColors[i];



      const fill = fillMatRefs.current[i];

      if (fill) {

        fill.opacity = alpha * (allActive ? 1 : focused ? 0.98 : 0.92);

        fill.transparent = !allActive && alpha < 0.995;

      }



      const wash = washMatRefs.current[i];

      if (wash) {

        wash.color.copy(accent);

        wash.opacity = alpha * (allActive ? 0.24 : focused ? 0.16 : 0.09);

        wash.transparent = true;

      }



      const ring = ringMatRefs.current[i];

      if (ring) {

        if (focused) {

          ring.color.copy(accent);

          ring.opacity = alpha * (allActive ? 0.96 : 0.88);

        } else {

          ring.color.set(allActive ? '#64748b' : MUTED_STROKE);

          ring.opacity = alpha * (allActive ? 0.82 : 0.74);

        }

      }



      const label = labelRefs.current[i];

      if (label && 'sync' in label) {

        const labelFill = alpha * (allActive ? 1 : focused ? 0.98 : 0.88);

        label.fontSize = allActive ? WIDE_FONT * (0.92 + wideT * 0.12) : DOCK_FONT;

        label.maxWidth = allActive ? NODE_RADIUS * 2.15 : NODE_RADIUS * 1.45;

        label.fillOpacity = labelFill;

        label.outlineOpacity = labelFill * (allActive ? 0.55 : 0.92);

        label.sync();

      }

    }



    for (let ei = 0; ei < ALL_CONNECTIONS.length; ei += 1) {

      const mesh = edgeMeshRefs.current[ei];

      const mat = edgeMatRefs.current[ei];

      if (!mesh || !mat) continue;



      const edgeAccent = edgeAccentColors[ei];

      const isOutgoing = ei === outgoingEdge && phase === 'traverse';

      const edgeAlpha = pres.value * diagramAlpha;



      mesh.visible = edgeAlpha > 0.02;

      mat.color.copy(edgeAccent);

      mat.opacity = edgeAlpha * (isOutgoing ? 0.78 : allActive ? 0.82 : 0.58);

    }



    const satGroup = satelliteGroupRef.current;

    if (satGroup) {

      const targetsPos = NODE_POS.targets;

      if (diagramAlpha < 0.03 || !targetsPos) {

        satGroup.visible = false;

      } else {

        satGroup.visible = true;

        satGroup.position.copy(targetsPos);

        const satAlpha = pres.value * diagramAlpha;

        const satAccent = ACCENTS[ARCH_TARGET_SATELLITE.accent];

        if (satFillMatRef.current) {

          satFillMatRef.current.opacity = satAlpha * 0.94;

          satFillMatRef.current.transparent = satAlpha < 0.995;

        }

        if (satRingMatRef.current) {

          satRingMatRef.current.color.set(satAccent);

          satRingMatRef.current.opacity = satAlpha * (allActive ? 0.82 : 0.68);

        }

        if (satLabelRef.current && 'sync' in satLabelRef.current) {

          satLabelRef.current.fontSize = allActive ? SAT_FONT * 1.4 : SAT_FONT;

          const satFill = satAlpha * (allActive ? 1 : 0.72);

          satLabelRef.current.fillOpacity = satFill;

          satLabelRef.current.outlineOpacity = satFill * (allActive ? 0.95 : 0);

          satLabelRef.current.sync();

        }

      }

    }

  });



  return (

    <group ref={groupRef} visible={false}>

      <ArchitectureStreams progressRef={progressRef} reduced={reduced} />



      {edgeGeoms.map((geo, i) => (

        <mesh

          key={`edge-${ALL_CONNECTIONS[i].from}-${ALL_CONNECTIONS[i].to}`}

          ref={(el) => {

            edgeMeshRefs.current[i] = el;

          }}

          geometry={geo}

          renderOrder={0}

          visible={false}

        >

          <meshBasicMaterial

            ref={(m) => {

              edgeMatRefs.current[i] = m;

            }}

            color={EDGE_BASE}

            transparent

            opacity={0}

            fog={false}

            depthWrite={false}

            depthTest

          />

        </mesh>

      ))}



      {ARCH_NODES.map((node, i) => (

        <group

          key={node.id}

          ref={(el) => {

            nodeRefs.current[i] = el;

          }}

          visible={false}

          renderOrder={10}

        >

          <mesh geometry={nodeGeos[i].wash} renderOrder={10}>

            <meshBasicMaterial

              ref={(m) => {

                washMatRefs.current[i] = m;

              }}

              color={ACCENTS[node.accent]}

              transparent

              opacity={0}

              fog={false}

              depthWrite={false}

              blending={THREE.AdditiveBlending}

            />

          </mesh>



          <mesh geometry={nodeGeos[i].fill} renderOrder={11}>

            <meshBasicMaterial

              ref={(m) => {

                fillMatRefs.current[i] = m;

              }}

              color="#ffffff"

              transparent

              opacity={0}

              fog={false}

              depthWrite

              depthTest

              alphaTest={0.08}

            />

          </mesh>



          <mesh geometry={nodeGeos[i].ring} renderOrder={12}>

            <meshBasicMaterial

              ref={(m) => {

                ringMatRefs.current[i] = m;

              }}

              color={MUTED_STROKE}

              transparent

              opacity={0}

              fog={false}

              side={THREE.DoubleSide}

              depthWrite

              depthTest

              alphaTest={0.08}

            />

          </mesh>



          <Text

            ref={(el) => {

              labelRefs.current[i] = el as TroikaText | null;

            }}

            font={FONT_DISPLAY_3D}

            fontSize={DOCK_FONT}

            color={LABEL}

            anchorX="center"

            anchorY="middle"

            maxWidth={NODE_RADIUS * 1.45}

            textAlign="center"

            fillOpacity={0}

            outlineWidth={0.014}

            outlineColor="#ffffff"

            outlineOpacity={0}

            lineHeight={1.05}

            renderOrder={20}

          >

            {node.label}

          </Text>

        </group>

      ))}



      <group ref={satelliteGroupRef} visible={false} renderOrder={9}>

        <mesh geometry={satelliteGeos.fill} renderOrder={9}>

          <meshBasicMaterial

            ref={satFillMatRef}

            color="#ffffff"

            transparent

            opacity={0}

            fog={false}

            depthWrite

            depthTest

            alphaTest={0.08}

          />

        </mesh>

        <mesh geometry={satelliteGeos.ring} renderOrder={10}>

          <meshBasicMaterial

            ref={satRingMatRef}

            color={ACCENTS.amber}

            transparent

            opacity={0}

            fog={false}

            side={THREE.DoubleSide}

            depthWrite

            depthTest

            alphaTest={0.08}

          />

        </mesh>

        <Text

          ref={(el) => {

            satLabelRef.current = el as TroikaText | null;

          }}

          font={FONT_DISPLAY_3D}

          fontSize={SAT_FONT}

          color={LABEL}

          anchorX="center"

          anchorY="middle"

          maxWidth={SAT_RADIUS * 2.4}

          textAlign="center"

          fillOpacity={0}

          outlineWidth={0.014}

          outlineColor="#f8fafc"

          outlineOpacity={0}

          lineHeight={1.05}

          renderOrder={19}

        >

          Targets

        </Text>

      </group>



      <ArchitectureFlowLabel progressRef={progressRef} />

    </group>

  );

}


