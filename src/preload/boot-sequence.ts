import { PRELOAD_CRITICAL } from '@/content/asset-manifest';

export type BootPhase =
  | 'idle'
  | 'fonts'
  | 'assets'
  | 'engine'
  | 'scene'
  | 'ready';

const PHASE_LABELS: Record<BootPhase, string> = {
  idle: 'Starting…',
  fonts: 'Loading typography…',
  assets: 'Loading assets…',
  engine: 'Preparing 3D engine…',
  scene: 'Syncing scene…',
  ready: 'Ready',
};

export function getBootLabel(phase: BootPhase): string {
  return PHASE_LABELS[phase];
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function loadImage(src: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

async function fetchAsset(src: string): Promise<void> {
  const res = await fetch(src, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${src}`);
  await res.blob();
}

export interface BootCallbacks {
  onProgress: (value: number, phase: BootPhase) => void;
  onWebGLWait: () => Promise<void>;
  signal?: AbortSignal;
}

export async function runBootSequence({
  onProgress,
  onWebGLWait,
  signal,
}: BootCallbacks): Promise<void> {
  const aborted = () => signal?.aborted ?? false;

  onProgress(0.05, 'fonts');
  await withTimeout(document.fonts.ready, 2000, undefined);
  if (aborted()) return;
  onProgress(0.2, 'fonts');

  onProgress(0.25, 'assets');
  const assetResults = await Promise.allSettled(
    PRELOAD_CRITICAL.map((src) =>
      src.endsWith('.svg') ? fetchAsset(src) : loadImage(src),
    ),
  );
  if (aborted()) return;
  const assetsOk = assetResults.filter((r) => r.status === 'fulfilled').length;
  onProgress(0.2 + (assetsOk / PRELOAD_CRITICAL.length) * 0.25, 'assets');

  onProgress(0.5, 'engine');
  await Promise.allSettled([
    import('three'),
    import('@react-three/fiber'),
    import('@react-three/drei'),
    import('@react-three/postprocessing'),
    import('@/experience/canvas/ExperienceCanvas'),
  ]);
  if (aborted()) return;
  onProgress(0.72, 'engine');

  onProgress(0.78, 'scene');
  await withTimeout(onWebGLWait(), 2200, undefined);
  if (aborted()) return;
  onProgress(0.95, 'scene');

  onProgress(1, 'ready');
}

/** Background prefetch — does not block boot */
export function prefetchInBackground(urls: readonly string[]): void {
  for (const url of urls) {
    fetch(url, { cache: 'force-cache' }).catch(() => undefined);
  }
}
