/**
 * Act model — maps the single global scroll progress (0..1) onto acts,
 * local progress, accent color, camera keyframes, and per-beat reveal windows.
 *
 * This is the conductor. Every visual system (camera, 3D sets, overlays,
 * chrome) reads from here so the whole experience stays in lockstep.
 */
import * as THREE from 'three';
import { sampleArchitectureCameraPose } from '@/experience/architecture-camera';
import { architectureGlobalLocal } from '@/experience/architecture-phases';
import { ACTS, ACCENTS, type AccentKey, type ActId } from '@/experience/narrative';
import {
  COST_CHAIN_FADE,
  COST_CHAIN_IN,
  COST_CHAIN_OUT_START,
  COST_MANUAL_FADE,
  COST_MANUAL_IN,
  COST_MANUAL_OUT,
  COST_MANUAL_OUT_START,
  COST_REPEAT_FADE,
  COST_REPEAT_IN,
  COST_REPEAT_OUT,
  COST_REPEAT_OUT_START,
  COST_STITCH_FADE,
  COST_STITCH_IN,
  COST_STITCH_OUT,
  COST_STITCH_OUT_START,
} from '@/experience/cost-phases';
import {
  OBJ_APPROACH_FADE,
  OBJ_APPROACH_IN,
  OBJ_APPROACH_OUT_START,
  OBJ_HUMAN_FADE,
  OBJ_HUMAN_IN,
  OBJ_HUMAN_OUT,
  OBJ_HUMAN_OUT_START,
  OBJ_JOBS_FADE,
  OBJ_JOBS_IN,
  OBJ_JOBS_OUT,
  OBJ_JOBS_OUT_START,
  OBJ_REDUNDANT_FADE,
  OBJ_REDUNDANT_IN,
  OBJ_REDUNDANT_OUT,
  OBJ_REDUNDANT_OUT_START,
  OBJ_STAY_HUMAN_FADE,
  OBJ_STAY_HUMAN_IN,
  OBJ_STAY_HUMAN_OUT,
  OBJ_STAY_HUMAN_OUT_START,
  OBJ_UNIFY_FADE,
  OBJ_UNIFY_IN,
  OBJ_UNIFY_OUT,
  OBJ_UNIFY_OUT_START,
} from '@/experience/objective-phases';
import {
  FUTURE_BRIDGE_FADE,
  FUTURE_BRIDGE_IN,
  FUTURE_BRIDGE_OUT,
  FUTURE_BRIDGE_OUT_START,
  FUTURE_QUOTE_FADE,
  FUTURE_QUOTE_IN,
  FUTURE_QUOTE_OUT,
  FUTURE_QUOTE_OUT_START,
} from '@/experience/future-work-phases';
import {
  CHAOS_COPY_FADE,
  CHAOS_COPY_IN,
  CHAOS_COPY_OUT,
  CHAOS_STRUCTURE_COPY_IN,
  CHAOS_STRUCTURE_COPY_OUT,
  REPORT_START,
  SPRAWL_HEADLINE_IN,
  SPRAWL_HEADLINE_OUT,
  SPRAWL_HEADLINE_OUT_START,
} from '@/experience/problem-phases';
import { clamp01, lerp } from '@/story/scroll-math';

export interface ActWindow {
  id: ActId;
  index: number;
  start: number;
  end: number;
  accent: AccentKey;
}

/** Precomputed [start,end] windows for each act from their weights. */
export const ACT_WINDOWS: readonly ActWindow[] = (() => {
  const total = ACTS.reduce((s, a) => s + a.weight, 0);
  let cursor = 0;
  return ACTS.map((act, index) => {
    const start = cursor / total;
    cursor += act.weight;
    const end = cursor / total;
    return { id: act.id, index, start, end, accent: act.accent };
  });
})();

export function actWindowById(id: ActId): ActWindow {
  const w = ACT_WINDOWS.find((a) => a.id === id);
  if (!w) throw new Error(`Unknown act: ${id}`);
  return w;
}

export interface ActState {
  index: number;
  id: ActId;
  /** Progress within the current act, 0..1. */
  local: number;
  start: number;
  end: number;
}

export function getActState(p: number): ActState {
  const prog = clamp01(p);
  for (let i = 0; i < ACT_WINDOWS.length; i += 1) {
    const w = ACT_WINDOWS[i];
    if (prog < w.end || i === ACT_WINDOWS.length - 1) {
      const span = Math.max(w.end - w.start, 1e-6);
      return { index: i, id: w.id, local: clamp01((prog - w.start) / span), start: w.start, end: w.end };
    }
  }
  const last = ACT_WINDOWS[ACT_WINDOWS.length - 1];
  return { index: last.index, id: last.id, local: 1, start: last.start, end: last.end };
}

/* ----------------------------------------------------------------------------
 * Accent interpolation — smoothly cross-fades the dominant accent color across
 * act boundaries so lighting/tint never snaps.
 * ------------------------------------------------------------------------- */
const _accentColor = new THREE.Color();
const _accentA = new THREE.Color();
const _accentB = new THREE.Color();

/** Returns the blended accent THREE.Color for a given global progress. */
export function accentColorAt(p: number, target = _accentColor): THREE.Color {
  const prog = clamp01(p);
  for (let i = 0; i < ACT_WINDOWS.length; i += 1) {
    const w = ACT_WINDOWS[i];
    if (prog < w.end || i === ACT_WINDOWS.length - 1) {
      _accentA.set(ACCENTS[w.accent]);
      // Blend toward the next act's accent in the final 18% of this act.
      const next = ACT_WINDOWS[Math.min(i + 1, ACT_WINDOWS.length - 1)];
      _accentB.set(ACCENTS[next.accent]);
      const span = Math.max(w.end - w.start, 1e-6);
      const local = clamp01((prog - w.start) / span);
      const blend = clamp01((local - 0.82) / 0.18);
      return target.copy(_accentA).lerp(_accentB, blend);
    }
  }
  return target.set(ACCENTS[ACT_WINDOWS[0].accent]);
}

export function accentHexAt(p: number): string {
  return `#${accentColorAt(p).getHexString()}`;
}

/* ----------------------------------------------------------------------------
 * Beat timing — distributes an act's beats across its local progress and
 * returns reveal windows in GLOBAL progress for overlay components.
 * ------------------------------------------------------------------------- */
export interface BeatWindow {
  /** Global progress where the line starts fading in. */
  inStart: number;
  inEnd: number;
  outStart: number;
  outEnd: number;
  /** When true the line is already at full opacity at its inStart (no fade-in). */
  startVisible?: boolean;
}

/**
 * For an act with `count` beats, returns the global-progress reveal window for
 * beat `index`. Beats hold on screen, then hand off to the next. The last beat
 * of an act holds until the act's end.
 */
export function beatWindow(actId: ActId, index: number, count: number): BeatWindow {
  const w = actWindowById(actId);
  const span = w.end - w.start;
  // The very first line of the film must be readable the instant the page
  // loads (progress 0). Scroll-linked WAAPI offsets must stay within [0,1],
  // so we keep the window non-negative and flag it as already-visible.
  if (actId === 'hero' && index === 0) {
    return { inStart: 0, inEnd: 0.001, outStart: w.end - span * 0.32, outEnd: w.end, startVisible: true };
  }
  // Cost act — four beats need room; default slots bury the finale line (see cost-phases.ts).
  if (actId === 'cost') {
    if (index === 0) {
      return {
        inStart: w.start + span * COST_REPEAT_IN,
        inEnd: w.start + span * (COST_REPEAT_IN + COST_REPEAT_FADE),
        outStart: w.start + span * COST_REPEAT_OUT_START,
        outEnd: w.start + span * COST_REPEAT_OUT,
      };
    }
    if (index === 1) {
      const inStart = w.start + span * COST_MANUAL_IN;
      return {
        inStart,
        inEnd: inStart + span * COST_MANUAL_FADE,
        outStart: w.start + span * COST_MANUAL_OUT_START,
        outEnd: w.start + span * COST_MANUAL_OUT,
      };
    }
    if (index === 2) {
      const inStart = w.start + span * COST_STITCH_IN;
      return {
        inStart,
        inEnd: inStart + span * COST_STITCH_FADE,
        outStart: w.start + span * COST_STITCH_OUT_START,
        outEnd: w.start + span * COST_STITCH_OUT,
      };
    }
    if (index === 3) {
      const inStart = w.start + span * COST_CHAIN_IN;
      return {
        inStart,
        inEnd: inStart + span * COST_CHAIN_FADE,
        outStart: w.start + span * COST_CHAIN_OUT_START,
        outEnd: w.end + 0.0001,
      };
    }
  }
  // Problem act — sprawl must complete before format-chaos copy (see problem-phases.ts).
  if (actId === 'problem') {
    if (index === 0) {
      return {
        inStart: w.start + span * SPRAWL_HEADLINE_IN,
        inEnd: w.start + span * (SPRAWL_HEADLINE_IN + 0.06),
        outStart: w.start + span * SPRAWL_HEADLINE_OUT_START,
        outEnd: w.start + span * SPRAWL_HEADLINE_OUT,
      };
    }
    if (index === 1) {
      const inStart = w.start + span * CHAOS_COPY_IN;
      return {
        inStart,
        inEnd: inStart + span * CHAOS_COPY_FADE,
        outStart: w.start + span * (CHAOS_COPY_OUT - 0.04),
        outEnd: w.start + span * CHAOS_COPY_OUT,
      };
    }
    if (index === 2) {
      return {
        inStart: w.start + span * CHAOS_STRUCTURE_COPY_IN,
        inEnd: w.start + span * (CHAOS_STRUCTURE_COPY_IN + 0.05),
        outStart: w.start + span * (CHAOS_STRUCTURE_COPY_OUT - 0.04),
        outEnd: w.start + span * CHAOS_STRUCTURE_COPY_OUT,
      };
    }
    if (index === 3) {
      const inStart = w.start + span * REPORT_START;
      return {
        inStart,
        inEnd: inStart + span * 0.06,
        outStart: w.end - span * 0.04,
        outEnd: w.end + 0.0001,
      };
    }
  }
  // Objective act — six beats + overlay choreography (see objective-phases.ts).
  if (actId === 'objective') {
    if (index === 0) {
      return {
        inStart: w.start + span * OBJ_HUMAN_IN,
        inEnd: w.start + span * (OBJ_HUMAN_IN + OBJ_HUMAN_FADE),
        outStart: w.start + span * OBJ_HUMAN_OUT_START,
        outEnd: w.start + span * OBJ_HUMAN_OUT,
      };
    }
    if (index === 1) {
      const inStart = w.start + span * OBJ_STAY_HUMAN_IN;
      return {
        inStart,
        inEnd: inStart + span * OBJ_STAY_HUMAN_FADE,
        outStart: w.start + span * OBJ_STAY_HUMAN_OUT_START,
        outEnd: w.start + span * OBJ_STAY_HUMAN_OUT,
      };
    }
    if (index === 2) {
      const inStart = w.start + span * OBJ_REDUNDANT_IN;
      return {
        inStart,
        inEnd: inStart + span * OBJ_REDUNDANT_FADE,
        outStart: w.start + span * OBJ_REDUNDANT_OUT_START,
        outEnd: w.start + span * OBJ_REDUNDANT_OUT,
      };
    }
    if (index === 3) {
      const inStart = w.start + span * OBJ_UNIFY_IN;
      return {
        inStart,
        inEnd: inStart + span * OBJ_UNIFY_FADE,
        outStart: w.start + span * OBJ_UNIFY_OUT_START,
        outEnd: w.start + span * OBJ_UNIFY_OUT,
      };
    }
    if (index === 4) {
      const inStart = w.start + span * OBJ_JOBS_IN;
      return {
        inStart,
        inEnd: inStart + span * OBJ_JOBS_FADE,
        outStart: w.start + span * OBJ_JOBS_OUT_START,
        outEnd: w.start + span * OBJ_JOBS_OUT,
      };
    }
    if (index === 5) {
      const inStart = w.start + span * OBJ_APPROACH_IN;
      return {
        inStart,
        inEnd: inStart + span * OBJ_APPROACH_FADE,
        outStart: w.start + span * OBJ_APPROACH_OUT_START,
        outEnd: w.end + 0.0001,
      };
    }
  }
  // Future work — quote, bridge line, then panel + credits (see future-work-phases.ts).
  if (actId === 'future-work') {
    if (index === 0) {
      const inStart = w.start + span * FUTURE_QUOTE_IN;
      return {
        inStart,
        inEnd: inStart + span * FUTURE_QUOTE_FADE,
        outStart: w.start + span * FUTURE_QUOTE_OUT_START,
        outEnd: w.start + span * FUTURE_QUOTE_OUT,
      };
    }
    if (index === 1) {
      const inStart = w.start + span * FUTURE_BRIDGE_IN;
      return {
        inStart,
        inEnd: inStart + span * FUTURE_BRIDGE_FADE,
        outStart: w.start + span * FUTURE_BRIDGE_OUT_START,
        outEnd: w.start + span * FUTURE_BRIDGE_OUT,
      };
    }
  }
  // Architecture finale lines — synced to wide/finale sub-phases (see architecture-phases.ts).
  if (actId === 'architecture' && count >= 3) {
    if (index === count - 2) {
      return {
        inStart: w.start + span * 0.9,
        inEnd: w.start + span * 0.93,
        outStart: w.start + span * 0.95,
        outEnd: w.start + span * 0.97,
      };
    }
    if (index === count - 1) {
      return {
        inStart: w.start + span * 0.94,
        inEnd: w.start + span * 0.96,
        outStart: w.end - span * 0.012,
        outEnd: w.end + 0.0001,
      };
    }
  }
  // Reserve a small lead-in so the first line doesn't appear at the exact seam.
  const usable = span * 0.92;
  const lead = span * 0.04;
  const slot = usable / count;
  const inStart = w.start + lead + slot * index;
  const inEnd = inStart + slot * 0.32;
  const isLast = index === count - 1;
  const outStart = isLast ? w.end - span * 0.05 : inStart + slot * 0.78;
  const outEnd = isLast ? w.end + 0.0001 : inStart + slot * 1.02;
  return { inStart, inEnd, outStart, outEnd };
}

/** Triangular 0..1 opacity envelope for a beat at global progress p. */
export function beatOpacity(p: number, win: BeatWindow): number {
  if (p <= win.inStart || p >= win.outEnd) return 0;
  if (p < win.inEnd) return clamp01((p - win.inStart) / (win.inEnd - win.inStart));
  if (p <= win.outStart) return 1;
  return clamp01(1 - (p - win.outStart) / (win.outEnd - win.outStart));
}

/* ----------------------------------------------------------------------------
 * Camera choreography — keyframes sampled by the CameraRig each frame.
 * Positions are in world space; the rig damps toward these for film-like moves.
 * ------------------------------------------------------------------------- */
export interface CameraPose {
  pos: THREE.Vector3;
  look: THREE.Vector3;
  fov: number;
}

interface CameraKey {
  /** Global progress at which this pose is the target. */
  at: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
}

const W = (id: ActId) => actWindowById(id);

/**
 * Hand-authored camera path. The rig samples + smooths these, so they read as
 * deliberate dolly / pull-back / focus moves rather than per-act snaps.
 */
const CAMERA_KEYS: readonly CameraKey[] = [
  // Hero — wide, gentle, looking into a forming chain.
  { at: W('hero').start, pos: [0, 0.4, 9.2], look: [0, -0.2, -3.8], fov: 46 },
  { at: W('hero').end, pos: [0.6, 0.2, 8.2], look: [0, -0.3, -3.8], fov: 44 },
  // Problem — drift sideways as nodes scatter; tension via off-center framing.
  { at: W('problem').start + 0.01, pos: [1.4, 0.1, 7.6], look: [-0.4, -0.1, -3.8], fov: 48 },
  { at: W('problem').end, pos: [-1.6, 0.3, 7.2], look: [0.5, 0.0, -3.8], fov: 50 },
  // Cost — pull in tight, claustrophobic duplication.
  { at: W('cost').start + 0.01, pos: [0, -0.2, 6.0], look: [0, -0.2, -3.8], fov: 40 },
  { at: W('cost').end, pos: [0, 0.1, 6.6], look: [0, -0.1, -3.8], fov: 42 },
  // Objective — the pull-back. Stillness. Chaos converges into one calm orbit.
  { at: W('objective').start + 0.02, pos: [0, 0.6, 11.5], look: [0, 0, -3.8], fov: 38 },
  { at: W('objective').end - 0.008, pos: [0, 0.4, 10.5], look: [0, 0, -3.8], fov: 36 },
  // Architecture — delegated to architecture-camera.ts (depth-first node tour).
  { at: W('architecture').end, pos: [0, 0.4, 11.0], look: [0, -0.05, -3.8], fov: 38 },
  // Technologies — calm wide frame for stack explosion + two-column list.
  { at: W('technologies').start + 0.02, pos: [0, 0.3, 9.4], look: [0, -0.05, -3.8], fov: 42 },
  { at: W('technologies').end, pos: [0, 0.35, 9.0], look: [0, -0.08, -3.8], fov: 40 },
  // Key features — static calm frame; HTML screenshots + cards are the hero.
  { at: W('jobs').start + 0.01, pos: [0, 0.35, 9.0], look: [0, 0.0, -3.8], fov: 42 },
  { at: W('dashboard').end, pos: [0, 0.35, 9.0], look: [0, 0.0, -3.8], fov: 42 },
  // Future work — calm static frame for roadmap panel and credits.
  { at: W('future-work').start + 0.01, pos: [0, 0.35, 9.0], look: [0, 0.0, -3.8], fov: 42 },
  { at: 1, pos: [0, 0.35, 9.0], look: [0, 0, -3.8], fov: 42 },
];

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();
const _poseOut: CameraPose = { pos: _pos, look: _look, fov: 45 };

export function sampleCameraPose(p: number): CameraPose {
  const archLocal = architectureGlobalLocal(p);
  if (archLocal >= 0) {
    return sampleArchitectureCameraPose(archLocal);
  }

  const prog = clamp01(p);
  const keys = CAMERA_KEYS;
  if (prog <= keys[0].at) {
    _pos.set(...keys[0].pos);
    _look.set(...keys[0].look);
    _poseOut.fov = keys[0].fov;
    return _poseOut;
  }
  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (prog >= a.at && prog <= b.at) {
      const span = Math.max(b.at - a.at, 1e-6);
      const t = smoothstep((prog - a.at) / span);
      _pos.set(lerp(a.pos[0], b.pos[0], t), lerp(a.pos[1], b.pos[1], t), lerp(a.pos[2], b.pos[2], t));
      _look.set(lerp(a.look[0], b.look[0], t), lerp(a.look[1], b.look[1], t), lerp(a.look[2], b.look[2], t));
      _poseOut.fov = lerp(a.fov, b.fov, t);
      return _poseOut;
    }
  }
  const last = keys[keys.length - 1];
  _pos.set(...last.pos);
  _look.set(...last.look);
  _poseOut.fov = last.fov;
  return _poseOut;
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}
