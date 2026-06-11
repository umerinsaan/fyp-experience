import type { ActId } from '@/experience/narrative';

export const SCREENSHOTS_DIR = '/screenshots' as const;

export type ScreenshotFit = 'contain' | 'cover';

export interface FeatureScreenshotSpec {
  filename: string;
  alt: string;
  caption: string;
  /** How the image fills the fixed frame — contain preserves full UI. */
  fit?: ScreenshotFit;
}

export interface KeyFeatureSpec {
  actId: ActId;
  primary: FeatureScreenshotSpec;
  secondary?: FeatureScreenshotSpec;
}

export function screenshotSrc(filename: string): string {
  return `${SCREENSHOTS_DIR}/${filename}`;
}

export const KEY_FEATURES: readonly KeyFeatureSpec[] = [
  {
    actId: 'jobs',
    primary: {
      filename: 'job-wizard.webp',
      alt: 'Execution wizard with JSON Schema form and command preview',
      caption: 'Execution wizard — schema form and command preview',
      fit: 'cover',
    },
  },
  {
    actId: 'pipeline',
    primary: {
      filename: 'pipeline.webp',
      alt: 'Pipeline designer canvas with linked job nodes',
      caption: 'Pipeline designer — fork/join graph',
      fit: 'cover',
    },
  },
  {
    actId: 'suggestions',
    primary: {
      filename: 'rule-based-hints.webp',
      alt: 'Suggested next steps panel on asset command centre',
      caption: 'Rule-based hints with scores and reasons',
      fit: 'cover',
    },
  },
  {
    actId: 'rbac',
    primary: {
      filename: 'rbac.webp',
      alt: 'Live RBAC overlay with highlighted control and inspector',
      caption: 'Live RBAC overlay with inspector open',
      fit: 'cover',
    },
  },
  {
    actId: 'reports',
    primary: {
      filename: 'reports-library.webp',
      alt: 'Report Library with completed report instances',
      caption: 'Report library with completed instances',
      fit: 'contain',
    },
  },
  {
    actId: 'dashboard',
    primary: {
      filename: 'asset-dashboard.webp',
      alt: 'Dashboard in Assets mode showing reachability and OS charts',
      caption: 'Assets mode — reachability and OS distribution',
      fit: 'contain',
    },
    secondary: {
      filename: 'vulnerability-dashboard.webp',
      alt: 'Dashboard in Vulnerabilities mode showing severity backlog',
      caption: 'Vulnerabilities mode — severity backlog and risk',
      fit: 'contain',
    },
  },
] as const;

export function keyFeatureByActId(actId: ActId): KeyFeatureSpec | undefined {
  return KEY_FEATURES.find((f) => f.actId === actId);
}
