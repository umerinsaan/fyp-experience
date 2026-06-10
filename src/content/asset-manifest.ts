/**
 * Asset manifest — extend `prefetch` as new chapters and 3D models ship.
 */
export const BOOT_STORAGE_KEY = 'fyp-exp-boot-v1';

/** Space Grotesk Bold — local copy for troika/drei Text (offline viva). */
export const FONT_DISPLAY_3D = '/fonts/space-grotesk-latin-700-normal.woff' as const;

export const PRELOAD_CRITICAL = ['/fyp-icon.svg', FONT_DISPLAY_3D] as const;

/** Warmed after first paint — route chunks, models */
export const PRELOAD_PREFETCH = [FONT_DISPLAY_3D] as const;

export const BOOT_TIMING = {
  minMs: 1400,
  maxMs: 3500,
  sessionSkip: true,
} as const;

export const VIEWPORT = {
  /** Primary design target */
  desktopMin: 1280,
  /** Tablets tolerated; layout may stack */
  tabletMin: 768,
  /** Below this — show desktop-only notice */
  mobileMax: 767,
} as const;
