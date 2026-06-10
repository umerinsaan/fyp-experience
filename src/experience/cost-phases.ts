/**
 * Act I (cost) — scroll-phase timing as fractions of the cost act span.
 * Four beats need explicit windows; the default conductor slots are too tight
 * for the finale line ("Same chain…") to land.
 */

/** Beat 0 — "So the work repeats." */
export const COST_REPEAT_IN = 0.04;
export const COST_REPEAT_FADE = 0.06;
export const COST_REPEAT_OUT_START = 0.2;
export const COST_REPEAT_OUT = 0.26;

/** Beat 1 — "Every step in between takes manual effort." */
export const COST_MANUAL_IN = 0.24;
export const COST_MANUAL_FADE = 0.06;
export const COST_MANUAL_OUT_START = 0.44;
export const COST_MANUAL_OUT = 0.5;

/** Beat 2 — "Hours go to stitching tools together…" */
export const COST_STITCH_IN = 0.46;
export const COST_STITCH_FADE = 0.06;
export const COST_STITCH_OUT_START = 0.64;
export const COST_STITCH_OUT = 0.7;

/** Beat 3 — "Same chain. Every subnet…" */
export const COST_CHAIN_IN = 0.66;
export const COST_CHAIN_FADE = 0.08;
export const COST_CHAIN_OUT_START = 0.94;
