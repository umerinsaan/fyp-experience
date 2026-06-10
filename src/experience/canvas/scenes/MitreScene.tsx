/**
 * ACT IV·03 — MITRE & Remediation. An ATT&CK matrix rises tile by tile. A raw
 * finding drops in and fires rays to the techniques it maps to (CWE → T1190,
 * port 445 → T1021, hydra → T1110). Ranked remediation panels then slide in,
 * sized by match score. Accent: magenta.
 */
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { actPresence } from '@/experience/canvas/scene-utils';
import { ACCENTS, MITRE_MAP, REMEDIATION_RANKS } from '@/experience/narrative';
import { clamp01, easeInOutCubic, smoothstep } from '@/story/scroll-math';

const CENTER_Z = -4.2;
const COLS = 10;
const ROWS = 4;
const TILE = COLS * ROWS;
const DX = 0.4;
const DY = 0.42;
const X0 = -((COLS - 1) / 2) * DX;
const Y0 = ((ROWS - 1) / 2) * DY + 0.15;

function tilePos(index: number, target: THREE.Vector3): THREE.Vector3 {
  const c = index % COLS;
  const r = Math.floor(index / COLS);
  return target.set(X0 + c * DX, Y0 - r * DY, 0);
}

/** Which matrix cells light up as mapped techniques. */
const HIGHLIGHT_CELLS = [12, 25, 7];

export function MitreScene({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null);
  const gridRef = useRef<THREE.InstancedMesh>(null);
  const highlightRefs = useRef<(THREE.Mesh | null)[]>([]);
  const highlightMatRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const findingRef = useRef<THREE.Mesh>(null);
  const findingMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const rayRef = useRef<THREE.LineSegments>(null);
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  const cardMatRefs = useRef<(THREE.MeshPhysicalMaterial | null)[]>([]);
  const cardBarRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const mapColors = useMemo(() => MITRE_MAP.map((m) => new THREE.Color(ACCENTS[m.accent])), []);
  const findingPos = useMemo(() => new THREE.Vector3(0, 1.9, 0.2), []);
  const rankColors = useMemo(
    () => REMEDIATION_RANKS.map((r) => new THREE.Color(ACCENTS[r.accent])),
    [],
  );

  const highlightPositions = useMemo(
    () => HIGHLIGHT_CELLS.map((c) => tilePos(c, new THREE.Vector3()).clone()),
    [],
  );

  const rayGeom = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(HIGHLIGHT_CELLS.length * 2 * 3), 3));
    return geo;
  }, []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const p = progressRef.current;
    const pres = actPresence(p, 'mitre', { padIn: 0.05, padOut: 0.05 });
    group.visible = pres.visible;
    if (!pres.visible) return;

    const t = clock.getElapsedTime();
    const local = pres.local;

    // Matrix rises tile by tile.
    const grid = gridRef.current;
    if (grid) {
      for (let i = 0; i < TILE; i += 1) {
        tilePos(i, tmp);
        const stagger = (i % COLS) * 0.02 + Math.floor(i / COLS) * 0.04;
        const reveal = easeInOutCubic(clamp01((local - stagger) / 0.28));
        const drop = (1 - reveal) * 0.7;
        dummy.position.set(tmp.x, tmp.y - drop, tmp.z);
        dummy.scale.setScalar(Math.max(0.0001, reveal) * 0.34);
        dummy.updateMatrix();
        grid.setMatrixAt(i, dummy.matrix);
      }
      grid.instanceMatrix.needsUpdate = true;
      (grid.material as THREE.MeshStandardMaterial).opacity = pres.value * 0.5;
    }

    // Finding drops in.
    const findingIn = smoothstep(0.18, 0.34, local);
    if (findingRef.current && findingMatRef.current) {
      findingRef.current.position.set(findingPos.x, THREE.MathUtils.lerp(2.4, findingPos.y, findingIn), findingPos.z);
      findingRef.current.rotation.set(t * 0.6, t * 0.8, 0);
      findingRef.current.scale.setScalar(0.2 * Math.max(0.0001, findingIn));
      findingMatRef.current.opacity = pres.value * findingIn;
      findingMatRef.current.emissiveIntensity = 0.6 + Math.sin(t * 3) * 0.15;
    }

    // Rays map finding → technique cells.
    const rayT = smoothstep(0.34, 0.56, local);
    if (rayRef.current) {
      const attr = rayGeom.getAttribute('position') as THREE.BufferAttribute;
      for (let k = 0; k < HIGHLIGHT_CELLS.length; k += 1) {
        const end = highlightPositions[k];
        tmp.lerpVectors(findingPos, end, rayT);
        attr.setXYZ(k * 2 + 0, findingPos.x, findingPos.y, findingPos.z);
        attr.setXYZ(k * 2 + 1, tmp.x, tmp.y, tmp.z);
      }
      attr.needsUpdate = true;
      (rayRef.current.material as THREE.LineBasicMaterial).opacity = pres.value * rayT * 0.7;
    }

    // Highlighted technique cells light up as rays land.
    for (let k = 0; k < HIGHLIGHT_CELLS.length; k += 1) {
      const land = smoothstep(0.5 + k * 0.03, 0.62 + k * 0.03, local);
      const mesh = highlightRefs.current[k];
      const mat = highlightMatRefs.current[k];
      if (mesh) {
        mesh.position.copy(highlightPositions[k]);
        mesh.scale.setScalar(0.34 * (1 + land * 0.4));
        mesh.visible = land > 0.02;
      }
      if (mat) {
        mat.opacity = pres.value * land;
        mat.emissiveIntensity = 0.5 + land * 0.6 + Math.sin(t * 4 + k) * 0.1;
      }
    }

    // Remediation cards rank in from the right.
    for (let r = 0; r < REMEDIATION_RANKS.length; r += 1) {
      const appear = easeInOutCubic(clamp01((local - (0.62 + r * 0.08)) / 0.14));
      const g = cardRefs.current[r];
      if (g) {
        const y = 0.95 - r * 0.78;
        g.position.set(3.05 + (1 - appear) * 0.6, y, 0.1);
        g.scale.setScalar(Math.max(0.0001, appear));
        g.visible = appear > 0.02;
      }
      const mat = cardMatRefs.current[r];
      if (mat) mat.opacity = pres.value * appear * 0.82;
      const bar = cardBarRefs.current[r];
      if (bar) bar.opacity = pres.value * appear;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, CENTER_Z]} visible={false}>
      {/* Matrix grid */}
      <instancedMesh ref={gridRef} args={[undefined, undefined, TILE]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#c8d6ea"
          emissive="#7c8db0"
          emissiveIntensity={0.15}
          metalness={0.2}
          roughness={0.5}
          transparent
          opacity={0}
        />
      </instancedMesh>

      {/* Highlighted technique cells */}
      {MITRE_MAP.map((m, k) => (
        <mesh
          key={m.technique}
          ref={(el) => {
            highlightRefs.current[k] = el;
          }}
          visible={false}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            ref={(mm) => {
              highlightMatRefs.current[k] = mm;
            }}
            color="#ffffff"
            emissive={mapColors[k]}
            emissiveIntensity={0.6}
            metalness={0.2}
            roughness={0.3}
            transparent
            opacity={0}
          />
        </mesh>
      ))}

      {/* Finding */}
      <mesh ref={findingRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          ref={findingMatRef}
          color="#ffffff"
          emissive={ACCENTS.magenta}
          emissiveIntensity={0.6}
          metalness={0.3}
          roughness={0.2}
          transparent
        />
      </mesh>

      {/* Mapping rays */}
      <lineSegments ref={rayRef} geometry={rayGeom}>
        <lineBasicMaterial color={ACCENTS.magenta} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>

      {/* Ranked remediation cards */}
      {REMEDIATION_RANKS.map((rk, r) => (
        <group
          key={rk.rank}
          ref={(el) => {
            cardRefs.current[r] = el;
          }}
          visible={false}
        >
          <mesh>
            <boxGeometry args={[1.5, 0.56, 0.04]} />
            <meshPhysicalMaterial
              ref={(m) => {
                cardMatRefs.current[r] = m;
              }}
              color="#eaf2ff"
              emissive={rankColors[r]}
              emissiveIntensity={0.18}
              metalness={0.1}
              roughness={0.1}
              transmission={0.78}
              thickness={0.3}
              ior={1.3}
              clearcoat={1}
              transparent
              opacity={0}
            />
          </mesh>
          {/* rank bar on the left edge of the card */}
          <mesh position={[-0.78, 0, 0.03]}>
            <boxGeometry args={[0.06, 0.5, 0.02]} />
            <meshBasicMaterial
              ref={(m) => {
                cardBarRefs.current[r] = m;
              }}
              color={rankColors[r]}
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
