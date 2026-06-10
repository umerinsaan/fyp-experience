/**
 * Active edge flow label — midpoint Html during traverse handoff.
 */
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';
import {
  architectureGlobalLocal,
  architectureNodeStep,
  architectureNodeSubPhase,
  architecturePhase,
} from '@/experience/architecture-phases';
import { actPresence } from '@/experience/canvas/scene-utils';
import { connectionMidpoint, traverseEdgeIndex } from '@/experience/canvas/scenes/architecture-layout';
import { ACCENTS, ARCH_CONNECTIONS } from '@/experience/narrative';

const FLOW_ARROW: Record<string, string> = {
  down: '↓',
  up: '↑',
  bidirectional: '↔',
};

interface FlowState {
  opacity: number;
  label: string;
  dir: string;
  accent: string;
  x: number;
  y: number;
  z: number;
}

const OFF: FlowState = { opacity: 0, label: '', dir: '↓', accent: '#06b6d4', x: 0, y: 0, z: 0 };

export function ArchitectureFlowLabel({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const [state, setState] = useState<FlowState>(OFF);
  const lastRef = useRef(OFF);

  useFrame(() => {
    const p = progressRef.current;
    const pres = actPresence(p, 'architecture', { padIn: 0.04, padOut: 0.06 });
    if (!pres.visible) {
      if (lastRef.current.opacity !== 0) {
        lastRef.current = OFF;
        setState(OFF);
      }
      return;
    }

    const local = architectureGlobalLocal(p);
    if (local < 0) return;

    const phase = architecturePhase(local);
    if (phase !== 'traverse') {
      if (lastRef.current.opacity !== 0) {
        lastRef.current = OFF;
        setState(OFF);
      }
      return;
    }

    const step = architectureNodeStep(local);
    const sub = architectureNodeSubPhase(local, step);
    const edgeIdx = traverseEdgeIndex(step);
    if (sub !== 'handoff' || edgeIdx < 0) {
      if (lastRef.current.opacity !== 0) {
        lastRef.current = OFF;
        setState(OFF);
      }
      return;
    }

    const conn = ARCH_CONNECTIONS[edgeIdx];
    const mid = connectionMidpoint(edgeIdx, 0.5);
    const next: FlowState = {
      opacity: pres.value * 0.92,
      label: conn.label,
      dir: FLOW_ARROW[conn.direction] ?? '→',
      accent: ACCENTS[conn.accent],
      x: mid.x,
      y: mid.y + 0.18,
      z: mid.z,
    };

    if (lastRef.current.opacity === next.opacity && lastRef.current.label === next.label) return;
    lastRef.current = next;
    setState(next);
  });

  if (state.opacity < 0.03) return null;

  return (
    <Html
      position={[state.x, state.y, state.z]}
      center
      distanceFactor={9}
      style={{ opacity: state.opacity, pointerEvents: 'none' }}
    >
      <div className="exp-arch-flow" style={{ color: state.accent }}>
        <span className="exp-arch-flow__dir">{state.dir}</span>
        <span className="exp-arch-flow__label">{state.label}</span>
      </div>
    </Html>
  );
}
