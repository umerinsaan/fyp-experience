/**
 * Flat 2D architecture diagram layout — nodes on one plane, execution-flow positions.
 * Spaced for per-node camera dock (neighbours off-screen); wide shot fits full bounds.
 */
import * as THREE from 'three';
import { ACCENTS, ARCH_CONNECTIONS, ARCH_NODES } from '@/experience/narrative';
import type { AccentKey } from '@/experience/narrative';

export const DIAGRAM_Z = -4.5;
/** Edges sit slightly behind the node plane so fills and labels occlude them. */
export const EDGE_Z = DIAGRAM_Z - 0.04;
export const NODE_RADIUS = 0.64;

/** ~4.5 units between traverse neighbours — keeps other nodes off-screen when docked. */
export const NODE_POS: Record<string, THREE.Vector3> = {
  console: new THREE.Vector3(-14.5, 3.2, DIAGRAM_Z),
  api: new THREE.Vector3(-10.0, 3.2, DIAGRAM_Z),
  queue: new THREE.Vector3(-5.5, 3.2, DIAGRAM_Z),
  dispatcher: new THREE.Vector3(-1.0, 3.2, DIAGRAM_Z),
  channel: new THREE.Vector3(4.5, 0.0, DIAGRAM_Z),
  agent: new THREE.Vector3(-1.0, -3.5, DIAGRAM_Z),
  storage: new THREE.Vector3(-5.5, -3.5, DIAGRAM_Z),
  ingestion: new THREE.Vector3(-10.0, -3.5, DIAGRAM_Z),
  livefeed: new THREE.Vector3(-14.5, -3.5, DIAGRAM_Z),
  targets: new THREE.Vector3(-5.0, -6.8, DIAGRAM_Z),
};

export const LAYER_POS = NODE_POS;

export interface DiagramExtents {
  center: THREE.Vector3;
  width: number;
  height: number;
}

/** Bounding box of the architecture node diagram (traverse nodes only). */
export function diagramExtents(targetCenter = new THREE.Vector3()): DiagramExtents {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of ARCH_NODES) {
    const p = NODE_POS[node.id];
    if (!p) continue;
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const pad = NODE_RADIUS * 2.2;
  return {
    center: targetCenter.set((minX + maxX) / 2, (minY + maxY) / 2, DIAGRAM_Z),
    width: maxX - minX + pad,
    height: maxY - minY + pad,
  };
}

/** Wide-shot bounds — main nodes plus the targets satellite anchor. */
export function wideDiagramExtents(targetCenter = new THREE.Vector3()): DiagramExtents {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of ARCH_NODES) {
    const p = NODE_POS[node.id];
    if (!p) continue;
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const targets = NODE_POS.targets;
  if (targets) {
    minX = Math.min(minX, targets.x);
    maxX = Math.max(maxX, targets.x);
    minY = Math.min(minY, targets.y);
    maxY = Math.max(maxY, targets.y);
  }

  const pad = NODE_RADIUS * 2.2;
  return {
    center: targetCenter.set((minX + maxX) / 2, (minY + maxY) / 2, DIAGRAM_Z),
    width: maxX - minX + pad,
    height: maxY - minY + pad,
  };
}

export const SCENE_CENTER = diagramExtents().center.clone();

export const nodeIndex = (id: string) => ARCH_NODES.findIndex((n) => n.id === id);
export const layerIndex = nodeIndex;

export function posOf(id: string, target = new THREE.Vector3()): THREE.Vector3 {
  const p = NODE_POS[id];
  return p ? target.copy(p) : target.set(0, 0, DIAGRAM_Z);
}

/** Straight-ish connector trimmed to node rims on the edge plane. */
export function connectionCurve(fromId: string, toId: string, lift = 0): THREE.CatmullRomCurve3 {
  const a = posOf(fromId).clone().setZ(EDGE_Z);
  const b = posOf(toId).clone().setZ(EDGE_Z);
  const delta = b.clone().sub(a);
  const len = delta.length();
  if (len < NODE_RADIUS * 2.2) {
    return new THREE.CatmullRomCurve3([a, b], false, 'centripetal');
  }
  delta.normalize();
  const inset = NODE_RADIUS * 0.72;
  const start = a.clone().add(delta.clone().multiplyScalar(inset));
  const end = b.clone().sub(delta.clone().multiplyScalar(inset));
  const midLift = lift || Math.min(len * 0.12, 1.8);
  const mid = new THREE.Vector3((start.x + end.x) / 2, (start.y + end.y) / 2 + midLift, EDGE_Z);
  return new THREE.CatmullRomCurve3([start, mid, end], false, 'centripetal');
}

export const ALL_CONNECTIONS = ARCH_CONNECTIONS.map((c) => ({
  ...c,
  curve: connectionCurve(c.from, c.to, 0),
}));

/** One outgoing edge per traverse step (node i → next, last step loops to frontend). */
export const TRAVERSE_STEP_EDGES = ARCH_NODES.map((node, step) => {
  if (step >= ARCH_NODES.length - 1) {
    return { from: 'livefeed' as const, to: 'console' as const, curve: connectionCurve('livefeed', 'console') };
  }
  const next = ARCH_NODES[step + 1];
  return { from: node.id, to: next.id, curve: connectionCurve(node.id, next.id) };
});

export function curveToLinePoints(curve: THREE.CatmullRomCurve3, segments = 20, zLift = 0.04): THREE.Vector3[] {
  return curve.getPoints(segments).map((p) => new THREE.Vector3(p.x, p.y, p.z + zLift));
}

export function accentColor(key: AccentKey, target = new THREE.Color()) {
  return target.set(ACCENTS[key]);
}

export function nodeFocus(index: number, target = new THREE.Vector3()): THREE.Vector3 {
  const node = ARCH_NODES[Math.max(0, Math.min(index, ARCH_NODES.length - 1))];
  return posOf(node.id, target);
}

export function layerFocus(index: number, target = new THREE.Vector3()): THREE.Vector3 {
  return nodeFocus(index, target);
}

export function connectionMidpoint(connIndex: number, t = 0.5, target = new THREE.Vector3()): THREE.Vector3 {
  return ALL_CONNECTIONS[connIndex].curve.getPoint(t, target);
}

export function traverseEdgeIndex(step: number): number {
  if (step < 0 || step >= TRAVERSE_STEP_EDGES.length) return -1;
  const { from, to } = TRAVERSE_STEP_EDGES[step];
  return ARCH_CONNECTIONS.findIndex((c) => c.from === from && c.to === to);
}

/** Rounded-rectangle shape for flat diagram nodes. */
export function buildFlatNodeShape(width: number, height: number, radius: number): THREE.Shape {
  const w = width;
  const h = height;
  const r = radius;
  const x = -w / 2;
  const y = -h / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + h - r);
  shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  shape.lineTo(x + r, y + h);
  shape.quadraticCurveTo(x, y + h, x, y + h - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  return shape;
}
