/**
 * Non-linear monotonic map between physical scrollTop and cinematic progress.
 * Rest points expand scroll budget so holds last longer without locking input.
 */
import { scrollMapWeightAt } from '@/experience/scroll-rest-points';
import { clamp01, lerp } from '@/story/scroll-math';

const MAP_STEPS = 512;

export interface ScrollMap {
  /** progress samples 0..1 at each step */
  progressSamples: Float64Array;
  /** cumulative physical fraction 0..1 at each step */
  physicalSamples: Float64Array;
  scrollable: number;
  offsetTop: number;
}

function buildProgressSamples(): { progress: Float64Array; physical: Float64Array } {
  const progress = new Float64Array(MAP_STEPS + 1);
  const physical = new Float64Array(MAP_STEPS + 1);
  let cumPhysical = 0;

  for (let i = 0; i <= MAP_STEPS; i += 1) {
    progress[i] = i / MAP_STEPS;
    if (i === 0) {
      physical[i] = 0;
      continue;
    }
    const pPrev = (i - 1) / MAP_STEPS;
    const pCurr = i / MAP_STEPS;
    const mid = (pPrev + pCurr) / 2;
    const deltaP = pCurr - pPrev;
    const w = scrollMapWeightAt(mid);
    cumPhysical += deltaP * w;
    physical[i] = cumPhysical;
  }

  const total = physical[MAP_STEPS];
  if (total > 0) {
    for (let i = 0; i <= MAP_STEPS; i += 1) {
      physical[i] /= total;
    }
  }

  return { progress, physical };
}

const { progress: PROGRESS_SAMPLES, physical: PHYSICAL_SAMPLES } = buildProgressSamples();

function getScrollable(section: HTMLElement): number {
  return Math.max(section.offsetHeight - window.innerHeight, 0);
}

function progressFromPhysicalFraction(frac: number): number {
  const f = clamp01(frac);
  let lo = 0;
  let hi = MAP_STEPS;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (PHYSICAL_SAMPLES[mid] < f) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.min(lo, MAP_STEPS);
  if (i === 0) return 0;
  const p0 = PHYSICAL_SAMPLES[i - 1];
  const p1 = PHYSICAL_SAMPLES[i];
  const g0 = PROGRESS_SAMPLES[i - 1];
  const g1 = PROGRESS_SAMPLES[i];
  const span = p1 - p0 || 1e-9;
  const t = (f - p0) / span;
  return lerp(g0, g1, t);
}

function physicalFractionFromProgress(p: number): number {
  const prog = clamp01(p);
  let lo = 0;
  let hi = MAP_STEPS;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (PROGRESS_SAMPLES[mid] < prog) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.min(lo, MAP_STEPS);
  if (i === 0) return 0;
  const g0 = PROGRESS_SAMPLES[i - 1];
  const g1 = PROGRESS_SAMPLES[i];
  const p0 = PHYSICAL_SAMPLES[i - 1];
  const p1 = PHYSICAL_SAMPLES[i];
  const span = g1 - g0 || 1e-9;
  const t = (prog - g0) / span;
  return lerp(p0, p1, t);
}

/** When true, use identity linear map (reduced motion / conductor off). */
let linearMode = false;

export function setScrollMapLinear(enabled: boolean): void {
  linearMode = enabled;
}

export function scrollTopToProgress(section: HTMLElement, scrollY: number): number {
  const scrollable = getScrollable(section);
  if (scrollable <= 0) return 0;
  const frac = clamp01((scrollY - section.offsetTop) / scrollable);
  if (linearMode) return frac;
  return progressFromPhysicalFraction(frac);
}

export function progressToScrollTop(section: HTMLElement, progress: number): number {
  const scrollable = getScrollable(section);
  const frac = linearMode ? clamp01(progress) : physicalFractionFromProgress(progress);
  return section.offsetTop + scrollable * frac;
}

export function readScrollProgress(section: HTMLElement): number {
  return scrollTopToProgress(section, window.scrollY);
}
