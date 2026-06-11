/**
 * Technologies act — scroll-phase timing as fractions of the technologies act span.
 */
import { clamp01, easeInOutCubic, easeOutCubic } from '@/story/scroll-math';

/** Explosion completes; deal phase begins. */
export const TECH_EXPLOSION_END = 0.14;

/** Act headline — visible from act entry, gone before list deal. */
export const TECH_HEADLINE_IN = 0;
export const TECH_HEADLINE_FADE = 0.028;
export const TECH_HEADLINE_HOLD_END = 0.08;
export const TECH_HEADLINE_OUT = 0.11;

/** Stagger each badge out of center during explosion. */
export const TECH_BADGE_START = 0.006;
export const TECH_BADGE_STAGGER = 0.006;
export const TECH_BADGE_BURST = 0.046;
/** Burst progress above this → card holds at scatter position. */
export const TECH_BADGE_SCATTER = 0.9;

/** List / deal phase starts — scatter holds until this point. */
export const TECH_LIST_IN = 0.14;
export const TECH_LIST_FADE = 0.04;

/** Short scroll band: crossing it runs the full scatter → list flight (0→1). */
export const TECH_DEAL_SCROLL = 0.07;

export function techBadgeBurstAt(index: number): number {
  return TECH_BADGE_START + index * TECH_BADGE_STAGGER;
}

/** List phase local progress 0..1 (after explosion). */
export function techListLocal(local: number): number {
  if (local <= TECH_EXPLOSION_END) return 0;
  return (local - TECH_EXPLOSION_END) / (1 - TECH_EXPLOSION_END);
}

/** Eased 0..1 deal — completes within TECH_DEAL_SCROLL of list-local. */
export function techDealLocal(listLocal: number): number {
  if (listLocal <= 0) return 0;
  return easeInOutCubic(clamp01(listLocal / TECH_DEAL_SCROLL));
}

export function techScrollLocal(listLocal: number): number {
  if (listLocal <= TECH_DEAL_SCROLL) return 0;
  return (listLocal - TECH_DEAL_SCROLL) / (1 - TECH_DEAL_SCROLL);
}

export type TechCardPhase = 'burst' | 'scatter' | 'dealing' | 'dealt';

export interface TechCardState {
  phase: TechCardPhase;
  /** 0..1 deal progress when phase === dealing */
  dealT: number;
}

/** Once list phase starts, every card flies from scatter into its row together. */
export function techCardState(local: number, _index: number, burstT: number): TechCardState {
  const listL = techListLocal(local);

  if (listL <= 0) {
    if (burstT < TECH_BADGE_SCATTER) return { phase: 'burst', dealT: burstT };
    return { phase: 'scatter', dealT: 0 };
  }

  const dealT = techDealLocal(listL);
  if (dealT >= 1) return { phase: 'dealt', dealT: 1 };
  return { phase: 'dealing', dealT: dealT };
}

/** Arc lerp — scatter pill → list row slot. Starts and ends aligned with scatter / row. */
export function techDealPosition(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
): { x: number; y: number; rotate: number; scale: number; pillFade: number; nameFade: number } {
  const e = easeOutCubic(clamp01(t));
  const arc = Math.sin(e * Math.PI) * 40;
  return {
    x: from.x + (to.x - from.x) * e,
    y: from.y + (to.y - from.y) * e - arc,
    rotate: Math.sin(e * Math.PI) * 10,
    scale: 1 - e * 0.22,
    pillFade: clamp01((e - 0.3) / 0.45),
    nameFade: clamp01((e - 0.2) / 0.35),
  };
}
