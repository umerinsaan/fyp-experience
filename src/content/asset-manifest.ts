/**
 * Asset manifest — extend `prefetch` as new chapters and 3D models ship.
 */
import { KEY_FEATURES, screenshotSrc } from '@/content/key-features';

export const BOOT_STORAGE_KEY = 'fyp-exp-boot-v1';

/** Space Grotesk Bold — local copy for troika/drei Text (offline viva). */
export const FONT_DISPLAY_3D = '/fonts/space-grotesk-latin-700-normal.woff' as const;

export const PRELOAD_CRITICAL = ['/fyp-icon.svg', FONT_DISPLAY_3D] as const;

/** Key-feature screenshots — add files to public/screenshots/ to warm after first paint. */
export const FEATURE_SCREENSHOT_PATHS = KEY_FEATURES.flatMap((f) => {
  const paths = [screenshotSrc(f.primary.filename)];
  if (f.secondary) paths.push(screenshotSrc(f.secondary.filename));
  return paths;
});

/** Warmed after first paint — route chunks, models, feature screenshots */
export const PRELOAD_PREFETCH = [FONT_DISPLAY_3D, ...FEATURE_SCREENSHOT_PATHS] as const;

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
