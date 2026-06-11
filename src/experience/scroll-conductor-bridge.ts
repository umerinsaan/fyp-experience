/**
 * Imperative bridge between ExperienceContext and ScrollConductor rAF loop.
 */
export interface ScrollJumpOpts {
  smooth?: boolean;
  duration?: number;
}

export interface ScrollConductorBridge {
  addDelta: (px: number) => void;
  jumpTo: (progress: number, opts?: ScrollJumpOpts) => void;
  syncFromNative: () => void;
  getMetrics: () => {
    scrollY: number;
    targetScrollTop: number;
    velocity: number;
  };
}
