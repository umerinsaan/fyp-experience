/**

 * Architecture act sub-phases — depth-first node traversal conductor.

 *

 * Phases (local 0..1 within the architecture act window):

 *   handoff   → insight freeze bleeds in; camera holds

 *   pullback  → diagram skeleton emerges; ecosystem particles boot

 *   traverse  → depth-first node tour with dock + edge travel

 *   wide      → full ecosystem alive; all streams active

 *   finale    → headline bridge into workflow

 */

import { actWindowById } from '@/experience/act-model';

import { traverseEdgeIndex } from '@/experience/canvas/scenes/architecture-layout';

import { ARCH_NODES } from '@/experience/narrative';

import { clamp01 } from '@/story/scroll-math';



export type ArchPhase = 'handoff' | 'pullback' | 'traverse' | 'wide' | 'finale';



/** @deprecated Use traverse */

export type LegacyArchPhase = ArchPhase | 'construct';



export const ARCH_PHASE_LOCAL = {

  handoff: { start: 0, end: 0.05 },

  pullback: { start: 0.05, end: 0.14 },

  traverse: { start: 0.14, end: 0.48 },

  wide: { start: 0.48, end: 0.92 },

  finale: { start: 0.92, end: 1 },

} as const;



/** @deprecated Use traverse */

export const LEGACY_CONSTRUCT = ARCH_PHASE_LOCAL.traverse;



export const ECOSYSTEM_MAX = 2048;

export const ECOSYSTEM_BOOT = 420;



const CHANNEL_NODE_INDEX = ARCH_NODES.findIndex((n) => n.id === 'channel');

const NODE_COUNT = ARCH_NODES.length;



/** Per-node slot fractions within traverse: approach / dock / handoff. */

/** Longer dock = extra scroll hold while node rests centered on screen. */
export const NODE_SLOT = { approach: 0.06, dock: 0.82, handoff: 0.12 } as const;



export function architectureEcosystemDrawCount(local: number, phase: ArchPhase): number {

  const pullT = architecturePhaseProgress(local, 'pullback');

  const traverseT = architecturePhaseProgress(local, 'traverse');



  if (phase === 'pullback') return Math.floor(ECOSYSTEM_BOOT + pullT * 380);

  if (phase === 'traverse') return Math.floor(780 + traverseT * 620);

  if (phase === 'wide' || phase === 'finale') return ECOSYSTEM_MAX;

  return ECOSYSTEM_BOOT;

}



export interface ArchitectureTypographyState {

  visible: boolean;

  power: number;

  fly: number;

  dissolve: number;

}



export function architectureTypographyState(local: number, nodeCount = NODE_COUNT): ArchitectureTypographyState {

  const phase = architecturePhase(local);

  const off = { visible: false, power: 0, fly: 0, dissolve: 0 };



  if (phase === 'handoff' || phase === 'pullback' || phase === 'finale') return off;



  const step = architectureNodeStep(local, nodeCount);

  const channelPower =

    phase === 'wide'

      ? clamp01(1 - architecturePhaseProgress(local, 'wide') * 0.4)

      : step >= CHANNEL_NODE_INDEX

        ? architectureNodePower(local, CHANNEL_NODE_INDEX, nodeCount)

        : 0;



  if (channelPower < 0.04) return off;



  let fly = 0;

  let dissolve = 0;



  if (phase === 'traverse' && step >= CHANNEL_NODE_INDEX) {

    const nodeProg = architectureNodeProgress(local, CHANNEL_NODE_INDEX, nodeCount);

    fly = clamp01((nodeProg - NODE_SLOT.approach) / NODE_SLOT.dock);

    dissolve = fly * 0.85;

  }



  if (phase === 'wide') {

    const wideT = architecturePhaseProgress(local, 'wide');

    fly = 0.55 + wideT * 0.45;

    dissolve = clamp01(0.3 + wideT * 0.7);

  }



  return { visible: true, power: channelPower, fly, dissolve };

}



export function architectureGlobalLocal(p: number): number {

  const w = actWindowById('architecture');

  if (p < w.start || p >= w.end) return -1;

  return clamp01((p - w.start) / (w.end - w.start));

}



export function architecturePhase(local: number): ArchPhase {

  const l = clamp01(local);

  if (l < ARCH_PHASE_LOCAL.pullback.start) return 'handoff';

  if (l < ARCH_PHASE_LOCAL.traverse.start) return 'pullback';

  if (l < ARCH_PHASE_LOCAL.wide.start) return 'traverse';

  if (l < ARCH_PHASE_LOCAL.finale.start) return 'wide';

  return 'finale';

}



export function architecturePhaseProgress(local: number, phase: ArchPhase): number {

  const win = ARCH_PHASE_LOCAL[phase];

  return clamp01((clamp01(local) - win.start) / Math.max(win.end - win.start, 1e-6));

}



export function insightFreezeT(p: number): number {

  const w = actWindowById('objective');

  if (p < w.start) return 0;

  const archStart = actWindowById('architecture').start;

  if (p >= archStart) return 1;

  const local = clamp01((p - w.start) / (w.end - w.start));

  return clamp01((local - 0.82) / 0.18);

}



export interface ArchitectureAtmosphereState {

  fogNear: number;

  fogFar: number;

  dustOpacity: number;

  ecosystemReveal: number;

  cloudGlow: number;

  edgeGlow: number;

}



export function architectureAtmosphereState(p: number): ArchitectureAtmosphereState {

  const defaults = { fogNear: 5.5, fogFar: 24, dustOpacity: 0.22, ecosystemReveal: 0, cloudGlow: 0, edgeGlow: 0 };



  const local = architectureGlobalLocal(p);

  if (local < 0) {

    const freeze = insightFreezeT(p);

    return {

      ...defaults,

      dustOpacity: 0.22 * (1 - freeze * 0.65),

      fogFar: 24 + freeze * 6,

    };

  }



  const phase = architecturePhase(local);



  if (phase === 'handoff') {

    const handoffT = architecturePhaseProgress(local, 'handoff');

    return {

      ...defaults,

      dustOpacity: 0.08 * (1 - handoffT),

      fogNear: 10,

      fogFar: 32,

    };

  }



  if (phase === 'pullback') {

    const pullT = architecturePhaseProgress(local, 'pullback');

    return {

      fogNear: 8 + pullT * 2,

      fogFar: 28 + pullT * 4,

      dustOpacity: 0.12 + pullT * 0.14,

      ecosystemReveal: pullT * 0.25,

      cloudGlow: pullT * 0.3,

      edgeGlow: 0,

    };

  }



  if (phase === 'traverse') {

    const traverseT = architecturePhaseProgress(local, 'traverse');

    const step = architectureNodeStep(local);

    const node = ARCH_NODES[step];

    const isEdge = node?.plane === 'edge';

    return {

      fogNear: 10,

      fogFar: 32,

      dustOpacity: 0.22 + traverseT * 0.1,

      ecosystemReveal: 0.25 + traverseT * 0.25,

      cloudGlow: isEdge ? 0.15 : 0.35,

      edgeGlow: isEdge ? 0.4 : 0.12,

    };

  }



  if (phase === 'wide') {

    const wideT = architectureWideProgress(local);

    return {

      fogNear: 18,

      fogFar: 80,

      dustOpacity: 0.14,

      ecosystemReveal: 0.5 + wideT * 0.5,

      cloudGlow: 0.55,

      edgeGlow: 0.72,

    };

  }



  const finaleT = architecturePhaseProgress(local, 'finale');

  return {

    fogNear: 10,

    fogFar: 34,

    dustOpacity: 0.24 * (1 - finaleT * 0.15),

    ecosystemReveal: 1.0 - finaleT * 0.12,

    cloudGlow: 0.4 + finaleT * 0.15,

    edgeGlow: 0.35,

  };

}



/** Fraction of the wide phase used for pan/zoom; remainder is a centered hold. */
export const ARCH_WIDE_ZOOM_FRAC = 0.3;

/** 0..1 progress through the wide phase (1 during finale hold). */
export function architectureWideProgress(local: number): number {
  const phase = architecturePhase(local);
  if (phase === 'finale') return 1;
  if (phase !== 'wide') return 0;
  return architecturePhaseProgress(local, 'wide');
}

/** Camera follow strength — higher = snappier dock hold, lower = soft wide zoom. */
export function architectureCameraDampStrength(p: number): number {
  const local = architectureGlobalLocal(p);
  if (local < 0) return 5.2;

  const phase = architecturePhase(local);
  if (phase === 'traverse') {
    const step = architectureNodeStep(local);
    const sub = architectureNodeSubPhase(local, step);
    if (sub === 'dock') return 24;
    if (sub === 'approach') return 16;
    if (sub === 'handoff') return 7;
  }
  if (phase === 'wide') {
    const wideT = architectureWideProgress(local);
    return wideT < ARCH_WIDE_ZOOM_FRAC ? 7.5 : 18;
  }

  if (phase === 'finale') return 18;
  if (phase === 'handoff' || phase === 'pullback') return 14;
  return 5.2;
}

/** Active node index 0..N-1 during traverse; all lit during wide/finale. */

export function architectureNodeStep(local: number, nodeCount = NODE_COUNT): number {

  const phase = architecturePhase(local);

  if (phase === 'wide' || phase === 'finale') return nodeCount - 1;

  if (phase !== 'traverse') return -1;

  const t = architecturePhaseProgress(local, 'traverse');

  return Math.min(nodeCount - 1, Math.floor(t * nodeCount));

}



/** @deprecated Use architectureNodeStep */

export function architectureLayerStep(local: number, layerCount: number): number {

  return architectureNodeStep(local, layerCount);

}



/** 0..1 progress within a single node slot during traverse. */

export function architectureNodeProgress(local: number, index: number, nodeCount = NODE_COUNT): number {

  const phase = architecturePhase(local);

  if (phase === 'wide' || phase === 'finale') return 1;

  if (phase !== 'traverse') return 0;



  const t = architecturePhaseProgress(local, 'traverse');

  const slot = 1 / nodeCount;

  const nodeStart = index * slot;

  const nodeEnd = nodeStart + slot;

  return clamp01((t - nodeStart) / Math.max(nodeEnd - nodeStart, 1e-6));

}



/** Sub-phase within a node slot: approach | dock | handoff */

export function architectureNodeSubPhase(

  local: number,

  index: number,

  nodeCount = NODE_COUNT,

): 'approach' | 'dock' | 'handoff' | 'idle' {

  const prog = architectureNodeProgress(local, index, nodeCount);

  if (prog <= 0) return 'idle';

  if (prog < NODE_SLOT.approach) return 'approach';

  if (prog < NODE_SLOT.approach + NODE_SLOT.dock) return 'dock';

  return 'handoff';

}



/** Power-on envelope 0..1 for node `index` during traverse. */

export function architectureNodePower(local: number, index: number, nodeCount = NODE_COUNT): number {

  const phase = architecturePhase(local);

  if (phase === 'wide' || phase === 'finale') return 1;

  if (phase !== 'traverse') return 0;



  const prog = architectureNodeProgress(local, index, nodeCount);

  const dockStart = NODE_SLOT.approach;

  const dockEnd = NODE_SLOT.approach + NODE_SLOT.dock;

  return easeOutBack(clamp01((prog - dockStart) / Math.max(dockEnd - dockStart, 1e-6)));

}



/** @deprecated Use architectureNodePower */

export function architectureLayerPower(local: number, index: number, layerCount: number): number {

  return architectureNodePower(local, index, layerCount);

}



/** 0..1 emphasis on the outgoing edge from active node during handoff. */

export function architectureEdgeProgress(local: number, edgeIndex: number, nodeCount = NODE_COUNT): number {

  const phase = architecturePhase(local);

  if (phase === 'wide' || phase === 'finale') return 1;

  if (phase !== 'traverse' || edgeIndex < 0) return 0;



  const step = architectureNodeStep(local, nodeCount);

  const outgoing = traverseEdgeIndex(step);

  if (edgeIndex !== outgoing) {

    const fromIdx = step;

    const conn = ARCH_NODES[fromIdx];

    if (!conn) return 0;

    return edgeIndex < outgoing ? 0.35 : 0;

  }



  const prog = architectureNodeProgress(local, step, nodeCount);

  const handoffStart = NODE_SLOT.approach + NODE_SLOT.dock;

  return clamp01((prog - handoffStart) / NODE_SLOT.handoff);

}



function easeOutBack(t: number): number {

  const c1 = 1.70158;

  const c3 = c1 + 1;

  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;

}



export interface PostFxState {

  dofStrength: number;

  bloomIntensity: number;

  worldFocusDistance: number;

  focusRange: number;

  bokehScale: number;

}



export function postFxState(p: number): PostFxState {

  const base: PostFxState = {

    dofStrength: 0,

    bloomIntensity: 0.36,

    worldFocusDistance: 14,

    focusRange: 10,

    bokehScale: 0.85,

  };



  const local = architectureGlobalLocal(p);

  if (local < 0) return base;



  const phase = architecturePhase(local);



  if (phase === 'traverse') {

    return { ...base, dofStrength: 0, bloomIntensity: 0.18, worldFocusDistance: 14, focusRange: 12, bokehScale: 0.5 };

  }



  if (phase === 'wide') {

    return {

      ...base,

      dofStrength: 0,

      bloomIntensity: 0.34,

      worldFocusDistance: 16,

      focusRange: 14,

      bokehScale: 0.65,

    };

  }



  if (phase === 'finale') {

    const finaleT = architecturePhaseProgress(local, 'finale');

    return {

      ...base,

      dofStrength: 0.08 * (1 - finaleT),

      bloomIntensity: 0.38 - finaleT * 0.08,

      worldFocusDistance: 15,

      focusRange: 13,

      bokehScale: 0.6,

    };

  }



  return { ...base, dofStrength: 0, bloomIntensity: 0.14, worldFocusDistance: 14, focusRange: 12, bokehScale: 0.5 };

}


