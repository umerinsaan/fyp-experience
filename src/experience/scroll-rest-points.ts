/**
 * Scroll rest registry — auto-derived hold centers for beat rests, scene moments,
 * feature showcases, architecture docks, and viva bookmarks.
 */
import { beatWindow, actWindowById } from '@/experience/act-model';
import {
  ARCH_PHASE_LOCAL,
  NODE_SLOT,
} from '@/experience/architecture-phases';
import { KEY_FEATURES } from '@/content/key-features';
import {
  FUTURE_FINALE_FADE,
  FUTURE_FINALE_IN,
  FUTURE_LIST_FADE,
  FUTURE_LIST_IN,
  FUTURE_LIST_OUT_START,
} from '@/experience/future-work-phases';
import { ACTS, ARCH_NODES, type ActId } from '@/experience/narrative';
import {
  TECH_EXPLOSION_END,
  TECH_HEADLINE_HOLD_END,
  TECH_HEADLINE_IN,
  TECH_LIST_IN,
} from '@/experience/technologies-phases';
import { getVivaBookmarks } from '@/experience/viva-demo';
import { clamp01, lerp, smoothstep } from '@/story/scroll-math';

/* ----------------------------------------------------------------------------
 * Tuning — single place for scroll-rest feel
 * ------------------------------------------------------------------------- */
export const BEAT_BUDGET = 2.0;
export const BEAT_RESIST = 0.32;
export const SHOWCASE_BUDGET = 2.3;
export const SHOWCASE_RESIST = 0.3;
export const TECH_STACK_BUDGET = 2.2;
export const TECH_SCENE_BUDGET = 1.8;
export const ARCH_DOCK_BUDGET = 1.4;
export const ARCH_DOCK_RESIST = 0.34;
export const BOOKMARK_BUDGET = 2.5;
export const BOOKMARK_RESIST = 0.28;
export const SCENE_BUDGET = 2.0;
export const ESCAPE_THRESHOLD = 3.5;
/** Lower threshold for held keyboard — intentional traverse through rests. */
export const ESCAPE_THRESHOLD_KEYBOARD = 1.75;
export const ESCAPE_IDLE_DECAY_MS = 800;
export const REST_CAMERA_DAMP = 20;
export const REST_CAMERA_DAMP_THRESHOLD = 0.5;

export type RestTier = 'beat' | 'scene' | 'showcase' | 'bookmark';

export interface RestPoint {
  progress: number;
  radius: number;
  budget: number;
  resist: number;
  tier: RestTier;
  label?: string;
}

function actGlobalPoint(actId: ActId, local: number): number {
  const w = actWindowById(actId);
  const span = w.end - w.start;
  return w.start + span * clamp01(local);
}

function beatHolds(): RestPoint[] {
  const points: RestPoint[] = [];
  for (const act of ACTS) {
    const count = act.beats.length;
    for (let i = 0; i < count; i += 1) {
      const win = beatWindow(act.id, i, count);
      const holdStart = win.inEnd;
      const holdEnd = win.outStart;
      if (holdEnd <= holdStart + 1e-6) continue;
      points.push({
        progress: (holdStart + holdEnd) / 2,
        radius: Math.max((holdEnd - holdStart) / 2, 0.001),
        budget: BEAT_BUDGET,
        resist: BEAT_RESIST,
        tier: 'beat',
        label: `${act.id} beat ${i}`,
      });
    }
  }
  return points;
}

function architectureDockHolds(): RestPoint[] {
  const w = actWindowById('architecture');
  const span = w.end - w.start;
  const nodeCount = ARCH_NODES.length;
  const slot = 1 / nodeCount;
  const traverseSpan = ARCH_PHASE_LOCAL.traverse.end - ARCH_PHASE_LOCAL.traverse.start;
  const dockFrac = NODE_SLOT.approach + NODE_SLOT.dock / 2;

  return ARCH_NODES.map((node, i) => {
    const traverseT = i * slot + slot * dockFrac;
    const archLocal = ARCH_PHASE_LOCAL.traverse.start + traverseT * traverseSpan;
    return {
      progress: w.start + span * archLocal,
      radius: span * slot * NODE_SLOT.dock * 0.32,
      budget: ARCH_DOCK_BUDGET,
      resist: ARCH_DOCK_RESIST,
      tier: 'scene',
      label: `arch dock ${node.id}`,
    };
  });
}

function technologiesHolds(): RestPoint[] {
  const w = actWindowById('technologies');
  const span = w.end - w.start;

  const headlineCenter = (TECH_HEADLINE_IN + TECH_HEADLINE_HOLD_END) / 2;
  const scatterCenter = (TECH_EXPLOSION_END + TECH_LIST_IN) / 2;

  return [
    {
      progress: actGlobalPoint('technologies', headlineCenter),
      radius: span * (TECH_HEADLINE_HOLD_END - TECH_HEADLINE_IN) * 0.5,
      budget: TECH_SCENE_BUDGET,
      resist: 0.33,
      tier: 'scene',
      label: 'tech headline',
    },
    {
      progress: actGlobalPoint('technologies', scatterCenter),
      radius: span * 0.03,
      budget: TECH_SCENE_BUDGET,
      resist: 0.33,
      tier: 'scene',
      label: 'tech scatter',
    },
    {
      progress: actGlobalPoint('technologies', 0.99),
      radius: span * 0.015,
      budget: TECH_STACK_BUDGET,
      resist: 0.3,
      tier: 'scene',
      label: 'tech stack lock',
    },
  ];
}

function showcaseHolds(): RestPoint[] {
  return KEY_FEATURES.map((f) => {
    const w = actWindowById(f.actId);
    const span = w.end - w.start;
    return {
      progress: w.start + span * 0.56,
      radius: span * 0.36,
      budget: SHOWCASE_BUDGET,
      resist: SHOWCASE_RESIST,
      tier: 'showcase' as const,
      label: `${f.actId} showcase`,
    };
  });
}

function futureWorkHolds(): RestPoint[] {
  const listInEnd = FUTURE_LIST_IN + FUTURE_LIST_FADE;
  const listCenter = (listInEnd + FUTURE_LIST_OUT_START) / 2;
  const listRadius = (FUTURE_LIST_OUT_START - listInEnd) / 2;
  const finaleCenter = FUTURE_FINALE_IN + FUTURE_FINALE_FADE / 2;

  return [
    {
      progress: actGlobalPoint('future-work', listCenter),
      radius: Math.max(listRadius, 0.01),
      budget: SCENE_BUDGET,
      resist: 0.32,
      tier: 'scene',
      label: 'future list',
    },
    {
      progress: actGlobalPoint('future-work', finaleCenter),
      radius: FUTURE_FINALE_FADE * 0.55,
      budget: SCENE_BUDGET,
      resist: 0.32,
      tier: 'scene',
      label: 'future finale',
    },
  ];
}

function bookmarkHolds(): RestPoint[] {
  return getVivaBookmarks().map((b) => ({
    progress: b.progress,
    radius: 0.008,
    budget: BOOKMARK_BUDGET,
    resist: BOOKMARK_RESIST,
    tier: 'bookmark' as const,
    label: b.id,
  }));
}

function mergeRestPoints(raw: RestPoint[]): RestPoint[] {
  const sorted = [...raw].sort((a, b) => a.progress - b.progress);
  const merged: RestPoint[] = [];

  for (const pt of sorted) {
    const last = merged[merged.length - 1];
    if (last && Math.abs(pt.progress - last.progress) < 0.005) {
      last.radius = Math.max(last.radius, pt.radius);
      last.budget = Math.max(last.budget, pt.budget);
      last.resist = Math.min(last.resist, pt.resist);
      if (pt.label) last.label = last.label ? `${last.label}+${pt.label}` : pt.label;
      continue;
    }
    merged.push({ ...pt });
  }
  return merged;
}

let cached: readonly RestPoint[] | null = null;

export function getRestPoints(): readonly RestPoint[] {
  if (!cached) {
    cached = mergeRestPoints([
      ...beatHolds(),
      ...architectureDockHolds(),
      ...technologiesHolds(),
      ...showcaseHolds(),
      ...futureWorkHolds(),
      ...bookmarkHolds(),
    ]);
  }
  return cached;
}

/** 0..1 combined rest influence at global progress p. */
export function restInfluence(p: number): number {
  let sum = 0;
  for (const rest of getRestPoints()) {
    const dist = Math.abs(p - rest.progress);
    if (dist >= rest.radius) continue;
    const t = 1 - dist / rest.radius;
    sum = Math.max(sum, smoothstep(0, 1, t));
  }
  return clamp01(sum);
}

/** Wheel speed factor — never zero; escapeAccum breaks resistance. */
export function scrollSpeedFactor(
  progress: number,
  escapeAccum: number,
  opts?: { keyboard?: boolean },
): number {
  const threshold = opts?.keyboard ? ESCAPE_THRESHOLD_KEYBOARD : ESCAPE_THRESHOLD;
  const escape = clamp01(escapeAccum / threshold);
  let minFactor = 1;
  for (const rest of getRestPoints()) {
    const dist = Math.abs(progress - rest.progress);
    if (dist >= rest.radius) continue;
    const t = 1 - dist / rest.radius;
    const influence = smoothstep(0, 1, t);
    const factor = lerp(rest.resist, 1, escape);
    minFactor = Math.min(minFactor, lerp(1, factor, influence));
  }
  return Math.max(minFactor, 0.12);
}

export function nearestRest(p: number): RestPoint | null {
  let best: RestPoint | null = null;
  let bestDist = Infinity;
  for (const rest of getRestPoints()) {
    const dist = Math.abs(p - rest.progress);
    if (dist < bestDist) {
      bestDist = dist;
      best = rest;
    }
  }
  return best;
}

/** Extra camera damp strength when resting (merged with architecture damp). */
export function globalCameraDampBoost(p: number): number {
  const influence = restInfluence(p);
  if (influence < REST_CAMERA_DAMP_THRESHOLD) return 0;
  const t = (influence - REST_CAMERA_DAMP_THRESHOLD) / (1 - REST_CAMERA_DAMP_THRESHOLD);
  return REST_CAMERA_DAMP * smoothstep(0, 1, t);
}

/** Segment weight for scroll-map at progress p (1 = normal speed). */
export function scrollMapWeightAt(p: number): number {
  let weight = 1;
  for (const rest of getRestPoints()) {
    const dist = Math.abs(p - rest.progress);
    if (dist >= rest.radius) continue;
    const t = 1 - dist / rest.radius;
    const bump = smoothstep(0, 1, t);
    weight = Math.max(weight, 1 + (rest.budget - 1) * bump);
  }
  return weight;
}
