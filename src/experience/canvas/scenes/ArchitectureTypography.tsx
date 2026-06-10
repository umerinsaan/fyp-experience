/**
 * Pass 3 — 3D typography at Agent Channel (Space Grotesk, troika Text).
 * Fly-through toward camera + dissolve into packet field at wide shot.
 */
import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  architectureGlobalLocal,
  architectureTypographyState,
} from '@/experience/architecture-phases';
import { actPresence } from '@/experience/canvas/scene-utils';
import { NODE_POS } from '@/experience/canvas/scenes/architecture-layout';
import { FONT_DISPLAY_3D } from '@/content/asset-manifest';
import { ACCENTS, ARCH_NODES } from '@/experience/narrative';

const CHANNEL_POS = NODE_POS.channel;

type TroikaText = THREE.Object3D & {
  fillOpacity: number;
  outlineOpacity: number;
  sync: () => void;
};

export function ArchitectureTypography({
  progressRef,
  reduced = false,
}: {
  progressRef: React.MutableRefObject<number>;
  reduced?: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<TroikaText>(null);

  const anchor = useMemo(() => new THREE.Vector3(CHANNEL_POS.x + 1.0, CHANNEL_POS.y + 0.48, CHANNEL_POS.z), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    const text = textRef.current;
    if (!group) return;

    const p = progressRef.current;
    const pres = actPresence(p, 'architecture', { padIn: 0.04, padOut: 0.06 });
    if (!pres.visible) {
      group.visible = false;
      return;
    }

    const local = architectureGlobalLocal(p);
    if (local < 0) {
      group.visible = false;
      return;
    }

    const state = architectureTypographyState(local, ARCH_NODES.length);
    if (!state.visible) {
      group.visible = false;
      return;
    }

    group.visible = true;
    const t = clock.getElapsedTime();
    const op = state.power * pres.value * (1 - state.dissolve * 0.92);

    const flyMul = reduced ? 0.35 : 1;
    const flyZ = state.fly * 3.8 * flyMul;
    const spread = state.dissolve * 0.35 * flyMul;
    group.position.set(
      anchor.x + Math.sin(t * 2.2) * spread,
      anchor.y + state.fly * 0.25 * flyMul,
      anchor.z + flyZ,
    );
    group.rotation.y = -0.35 + Math.sin(t * 0.25) * 0.02 + state.fly * 0.08 * flyMul;
    group.scale.setScalar(0.88 + state.fly * 0.55 * flyMul + state.dissolve * 0.2 * flyMul);

    if (text && 'sync' in text && typeof text.sync === 'function') {
      text.fillOpacity = op;
      text.outlineOpacity = op * (0.92 - state.dissolve * 0.5);
      text.sync();
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <Text
        ref={textRef}
        font={FONT_DISPLAY_3D}
        fontSize={0.19}
        letterSpacing={0.05}
        color={ACCENTS.mint}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#f0f9ff"
        fillOpacity={0}
        outlineOpacity={0}
        maxWidth={4.5}
      >
        OUTBOUND ONLY
      </Text>
    </group>
  );
}
