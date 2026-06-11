/**
 * Imperative bridge between ExperienceContext and ScrollConductor rAF loop.
 */
export type ScrollInputSource = 'keyboard' | 'wheel' | 'touch';

export interface ScrollJumpOpts {
  smooth?: boolean;
  duration?: number;
}

export interface ScrollConductorBridge {
  addDelta: (px: number, source?: ScrollInputSource) => void;
  jumpTo: (progress: number, opts?: ScrollJumpOpts) => void;
  /** Stop keyboard inertia — snap target to current scroll (call on key up). */
  endKeyboardScroll: () => void;
  syncFromNative: () => void;
  getMetrics: () => {
    scrollY: number;
    targetScrollTop: number;
    velocity: number;
  };
}
