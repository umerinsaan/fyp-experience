/**
 * ACT IV·03 — Suggested Next Steps. A rule graph, not a black box. Each rule's
 * condition node glows when matched, a pulse travels its edge, and the action
 * blooms: a recommendation card, or — for the assurance rule — a BLOCK wall
 * that gates a risky run. Accent: mint.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS, SUGGESTIONS_RULES } from '@/experience/narrative';
import { clamp01, easeInOutCubic, smoothstep } from '@/story/scroll-math';

const CENTER_Z = -4.0;
const COND_X = -2.5;
const ACT_X = 1.7;
const ROW_Y = [1.05, 0, -1.05];
const FIRE_AT = [0.12, 0.42, 0.66];

/** The middle rule is the assurance gate → its action is a blocking wall. */
const GATE_INDEX = 1;

export function SuggestionsScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const condRefs = useRef<(THREE.Mesh | null)[]>([]);
  const condMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const edgeMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
  const pulseMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const actionRefs = useRef<(THREE.Group | null)[]>([]);
  const actionMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  const ruleColors = useMemo(() => SUGGESTIONS_RULES.map((r) => new THREE.Color(ACCENTS[r.accent])), []);
  const matchGreen = useMemo(() => new THREE.Color(ACCENTS.mint), []);

  const edgeGeoms = useMemo(
    () =>
      ROW_Y.map((y) => {
        const a = new THREE.Vector3(COND_X + 0.3, y, 0);
        const b = new THREE.Vector3(ACT_X - 0.5, y, 0);
        const curve = new THREE.CatmullRomCurve3([a, new THREE.Vector3((a.x + b.x) / 2, y, 0), b]);
        return { geo: new THREE.TubeGeometry(curve, 24, 0.01, 6, false), curve };
      }),
    [],
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'suggestions', { padIn: 0.05, padOut: 0.05 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    const local = pres.local;

    for (let i = 0; i < SUGGESTIONS_RULES.length; i += 1) {
      const fire = easeInOutCubic(clamp01((local - FIRE_AT[i]) / 0.16));
      const matched = smoothstep(FIRE_AT[i] + 0.02, FIRE_AT[i] + 0.1, local);

      const cond = condRefs.current[i];
      const condMat = condMatRefs.current[i];
      if (cond) {
        cond.position.set(COND_X, ROW_Y[i], 0);
        cond.rotation.y = t * 0.5;
        cond.scale.setScalar(0.34 * Math.max(0.0001, smoothstep(FIRE_AT[i] - 0.08, FIRE_AT[i] + 0.02, local)));
        cond.visible = local > FIRE_AT[i] - 0.08;
      }
      if (condMat) {
        condMat.color.copy(ruleColors[i]).lerp(matchGreen, matched * 0.6);
        condMat.emissive.copy(ruleColors[i]).lerp(matchGreen, matched * 0.6);
        condMat.emissiveIntensity = 0.35 + matched * 0.7;
        condMat.opacity = pres.value * smoothstep(FIRE_AT[i] - 0.08, FIRE_AT[i] + 0.02, local);
      }

      const edgeMat = edgeMatRefs.current[i];
      if (edgeMat) edgeMat.opacity = pres.value * fire * 0.55;

      const pulse = pulseRefs.current[i];
      const pulseMat = pulseMatRefs.current[i];
      if (pulse && pulseMat) {
        if (fire > 0.2) {
          pulse.visible = true;
          const phase = (t * 0.6 + i * 0.2) % 1;
          const pt = edgeGeoms[i].curve.getPoint(phase);
          pulse.position.copy(pt);
          pulse.scale.setScalar(0.06);
          pulseMat.opacity = pres.value * Math.sin(phase * Math.PI) * fire * 0.9;
        } else {
          pulse.visible = false;
        }
      }

      const action = actionRefs.current[i];
      const actionMat = actionMatRefs.current[i];
      if (action) {
        action.position.set(ACT_X, ROW_Y[i], 0);
        action.scale.setScalar(Math.max(0.0001, fire));
        action.visible = fire > 0.02;
      }
      if (actionMat) {
        const isGate = i === GATE_INDEX;
        actionMat.opacity = pres.value * fire;
        actionMat.emissiveIntensity = (isGate ? 0.5 : 0.35) + fire * 0.5 + (isGate ? Math.sin(t * 5) * 0.15 : 0);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, CENTER_Z]} visible={false}>
      {edgeGeoms.map(({ geo }, i) => (
        <mesh key={`edge-${i}`} geometry={geo}>
          <meshBasicMaterial
            ref={(m) => {
              edgeMatRefs.current[i] = m;
            }}
            color={ruleColors[i]}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {SUGGESTIONS_RULES.map((_, i) => (
        <mesh
          key={`pulse-${i}`}
          ref={(el) => {
            pulseRefs.current[i] = el;
          }}
          visible={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial
            ref={(m) => {
              pulseMatRefs.current[i] = m;
            }}
            color={ACCENTS.mint}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {SUGGESTIONS_RULES.map((rule, i) => (
        <mesh
          key={`cond-${rule.id}`}
          ref={(el) => {
            condRefs.current[i] = el;
          }}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <cylinderGeometry args={[0.46, 0.46, 0.16, 6]} />
          <meshStandardMaterial
            ref={(m) => {
              condMatRefs.current[i] = m;
            }}
            color={ruleColors[i]}
            emissive={ruleColors[i]}
            emissiveIntensity={0.35}
            metalness={0.4}
            roughness={0.25}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      {SUGGESTIONS_RULES.map((rule, i) => (
        <group
          key={`action-${rule.id}`}
          ref={(el) => {
            actionRefs.current[i] = el;
          }}
          visible={false}
        >
          <mesh>
            {i === GATE_INDEX ? (
              <boxGeometry args={[0.22, 1.0, 0.5]} />
            ) : (
              <boxGeometry args={[1.4, 0.5, 0.05]} />
            )}
            <meshStandardMaterial
              ref={(m) => {
                actionMatRefs.current[i] = m;
              }}
              color={i === GATE_INDEX ? '#ffffff' : '#eaf2ff'}
              emissive={ruleColors[i]}
              emissiveIntensity={0.4}
              metalness={0.2}
              roughness={0.25}
              transparent
              opacity={0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
