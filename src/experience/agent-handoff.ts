/**
 * Architecture agent-layer pulse — visual emphasis on the agent block during
 * architecture wide/finale and early Technologies act (no separate Agent act).
 */
import * as THREE from 'three';
import { actWindowById } from '@/experience/act-model';
import { LAYER_POS } from '@/experience/canvas/scenes/architecture-layout';
import { clamp01 } from '@/story/scroll-math';

/** Architecture layer anchor for the Agent block. */
export const ARCH_AGENT_ANCHOR = LAYER_POS.agent;

export const AGENT_ORBIT_RADIUS = 0.38;
export const AGENT_ORBIT_COUNT = 18;

export interface AgentHandoffState {
  /** Reserved — kept at 0 without a dedicated Agent act. */
  morph: number;
  /** Pulse envelope: architecture finale through early Technologies. */
  pulse: number;
}

const _pos = new THREE.Vector3();

export function agentHandoffPosition(_p: number, target = _pos): THREE.Vector3 {
  return target.copy(ARCH_AGENT_ANCHOR);
}

export function agentHandoffState(p: number): AgentHandoffState {
  const arch = actWindowById('architecture');
  const tech = actWindowById('technologies');
  const archSpan = arch.end - arch.start;
  const techSpan = tech.end - tech.start;

  const wideLocal = arch.start + archSpan * 0.72;
  const pulseEnd = tech.start + techSpan * 0.22;

  let pulse = 0;
  if (p >= wideLocal && p <= pulseEnd) {
    if (p < arch.end) {
      pulse = clamp01((p - wideLocal) / Math.max(arch.end - wideLocal, 1e-6));
    } else {
      pulse = 1 - clamp01((p - arch.end) / Math.max(pulseEnd - arch.end, 1e-6));
    }
  }

  return { morph: 0, pulse };
}
