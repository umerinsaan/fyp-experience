/**
 * Floating 3D HTML labels at node anchors during dock sub-phase.
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
import { NODE_POS } from '@/experience/canvas/scenes/architecture-layout';
import { ARCH_NODES } from '@/experience/narrative';

export function ArchitectureNodeLabels({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const [opacities, setOpacities] = useState<number[]>(() => ARCH_NODES.map(() => 0));
  const lastUpdate = useRef(0);

  useFrame(({ clock }) => {
    const p = progressRef.current;
    const pres = actPresence(p, 'architecture', { padIn: 0.04, padOut: 0.06 });
    if (!pres.visible) return;

    const local = architectureGlobalLocal(p);
    if (local < 0) return;

    const phase = architecturePhase(local);
    const step = architectureNodeStep(local);
    const allLit = phase === 'wide' || phase === 'finale';
    const next = ARCH_NODES.map((_, i) => {
      if (phase !== 'traverse' && !allLit) return 0;
      const sub = architectureNodeSubPhase(local, i);
      if (allLit) return 0.55 * pres.value;
      if (i === step && sub === 'dock') return pres.value * 0.72;
      return 0;
    });

    if (clock.elapsedTime - lastUpdate.current > 0.05) {
      lastUpdate.current = clock.elapsedTime;
      setOpacities(next);
    }
  });

  return (
    <>
      {ARCH_NODES.map((node, i) => {
        const pos = NODE_POS[node.id];
        const opacity = opacities[i] ?? 0;
        if (opacity < 0.02) return null;
        return (
          <Html
            key={node.id}
            position={[pos.x, pos.y + 0.38, pos.z]}
            center
            distanceFactor={8}
            style={{ opacity, pointerEvents: 'none' }}
          >
            <div className="exp-arch-float">
              <span className="exp-arch-float__index">{String(i + 1).padStart(2, '0')}</span>
              <span className="exp-arch-float__name">{node.label}</span>
            </div>
          </Html>
        );
      })}
    </>
  );
}
