/**
 * Pass 4 — shared agent visual language + morph from Architecture → Agent act.
 * Purple correlation core, mint orbit ring — continuous across the handoff.
 */
import * as THREE from 'three';
import { actWindowById } from '@/experience/act-model';
import { LAYER_POS } from '@/experience/canvas/scenes/architecture-layout';
import { clamp01, easeOutCubic } from '@/story/scroll-math';

/** Agent act scene anchor (AgentScene). */
export const AGENT_ACT_CENTER = new THREE.Vector3(-1.4, 0.1, -3.8);

/** Architecture layer anchor for the Agent block. */
export const ARCH_AGENT_ANCHOR = LAYER_POS.agent;

export const AGENT_ORBIT_RADIUS = 0.38;
export const AGENT_ORBIT_COUNT = 18;

export interface AgentHandoffState {
  /** 0 at architecture wide → 1 once Agent act has settled. */
  morph: number;
  /** Pulse envelope: architecture finale through early Agent act. */
  pulse: number;
}

const _pos = new THREE.Vector3();

/** World position lerping architecture agent layer → Agent act core. */
export function agentHandoffPosition(p: number, target = _pos): THREE.Vector3 {
  const morph = agentHandoffState(p).morph;
  return target.copy(ARCH_AGENT_ANCHOR).lerp(AGENT_ACT_CENTER, morph);
}

/** Scroll-driven handoff — architecture climax into Agent act opening. */
export function agentHandoffState(p: number): AgentHandoffState {
  const arch = actWindowById('architecture');
  const agent = actWindowById('agent');
  const archSpan = arch.end - arch.start;
  const agentSpan = agent.end - agent.start;

  const wideLocal = arch.start + archSpan * 0.72;
  const morphStart = arch.start + archSpan * 0.88;
  const morphEnd = agent.start + agentSpan * 0.45;

  const morph = easeOutCubic(clamp01((p - morphStart) / Math.max(morphEnd - morphStart, 1e-6)));

  let pulse = 0;
  if (p >= wideLocal && p <= agent.start + agentSpan * 0.5) {
    if (p < arch.end) {
      pulse = clamp01((p - wideLocal) / Math.max(arch.end - wideLocal, 1e-6));
    } else if (p < actWindowById('workflow').end) {
      const wf = actWindowById('workflow');
      const fade = clamp01((p - arch.end) / Math.max(wf.end - arch.end, 1e-6));
      pulse = 1 - fade * 0.85;
    } else {
      pulse = clamp01(1 - morph * 0.7);
    }
  }

  return { morph, pulse };
}
