import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useReducedMotion } from 'framer-motion';
import {
  BOOT_STORAGE_KEY,
  BOOT_TIMING,
  PRELOAD_PREFETCH,
} from '@/content/asset-manifest';
import {
  getBootLabel,
  prefetchInBackground,
  runBootSequence,
  type BootPhase,
} from '@/preload/boot-sequence';

interface PreloadContextValue {
  progress: number;
  phase: BootPhase;
  phaseLabel: string;
  /** Boot UI dismissed — experience may still wait on canvasReady. */
  ready: boolean;
  /** WebGL has painted at least one frame with the scene background. */
  canvasReady: boolean;
  revealed: boolean;
  skipped: boolean;
  skip: () => void;
  signalWebGLReady: () => void;
}

const PreloadContext = createContext<PreloadContextValue | null>(null);

function readSessionBootComplete(): boolean {
  try {
    return sessionStorage.getItem(BOOT_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSessionBootComplete(): void {
  try {
    sessionStorage.setItem(BOOT_STORAGE_KEY, '1');
  } catch {
    /* private browsing */
  }
}

export function PreloadProvider({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const sessionComplete = BOOT_TIMING.sessionSkip && readSessionBootComplete();

  const [progress, setProgress] = useState(sessionComplete ? 1 : 0);
  const [phase, setPhase] = useState<BootPhase>(sessionComplete ? 'ready' : 'idle');
  const [ready, setReady] = useState(sessionComplete);
  const [canvasReady, setCanvasReady] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const webGlResolver = useRef<(() => void) | null>(null);
  const webGlPromise = useRef<Promise<void> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bootStartRef = useRef(0);
  const finishedRef = useRef(sessionComplete);
  const canvasReadyRef = useRef(false);
  const skippedRef = useRef(false);
  const revealTimerRef = useRef<number | null>(null);

  const tryReveal = useCallback(() => {
    if (!finishedRef.current || !canvasReadyRef.current) return;
    if (revealTimerRef.current !== null) return;
    revealTimerRef.current = window.setTimeout(
      () => setRevealed(true),
      skippedRef.current || reduceMotion ? 0 : 120,
    );
  }, [reduceMotion]);

  const signalWebGLReady = useCallback(() => {
    webGlResolver.current?.();
    webGlResolver.current = null;
    canvasReadyRef.current = true;
    setCanvasReady(true);
    tryReveal();
  }, [tryReveal]);

  const finishBoot = useCallback(
    (didSkip: boolean) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      skippedRef.current = didSkip;
      setSkipped(didSkip);
      setProgress(1);
      setPhase('ready');
      setReady(true);
      writeSessionBootComplete();
      prefetchInBackground(PRELOAD_PREFETCH);
      tryReveal();
    },
    [tryReveal],
  );

  const skip = useCallback(() => {
    abortRef.current?.abort();
    finishBoot(true);
  }, [finishBoot]);

  useEffect(() => {
    if (sessionComplete) {
      prefetchInBackground(PRELOAD_PREFETCH);
      return;
    }

    if (reduceMotion) {
      finishBoot(true);
      return;
    }

    webGlPromise.current = new Promise<void>((resolve) => {
      webGlResolver.current = resolve;
    });

    const controller = new AbortController();
    abortRef.current = controller;
    bootStartRef.current = performance.now();

    const maxTimer = window.setTimeout(() => finishBoot(false), BOOT_TIMING.maxMs);

    void runBootSequence({
      signal: controller.signal,
      onProgress: (value, nextPhase) => {
        setProgress(value);
        setPhase(nextPhase);
      },
      onWebGLWait: () => webGlPromise.current ?? Promise.resolve(),
    }).then(async () => {
      if (controller.signal.aborted) return;
      const elapsed = performance.now() - bootStartRef.current;
      const remaining = Math.max(0, BOOT_TIMING.minMs - elapsed);
      if (remaining > 0) {
        await new Promise((r) => window.setTimeout(r, remaining));
      }
      if (!controller.signal.aborted) finishBoot(false);
    });

    return () => {
      controller.abort();
      window.clearTimeout(maxTimer);
    };
  }, [sessionComplete, reduceMotion, finishBoot]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !ready) skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ready, skip]);

  const value = useMemo<PreloadContextValue>(
    () => ({
      progress,
      phase,
      phaseLabel: getBootLabel(phase),
      ready,
      canvasReady,
      revealed,
      skipped,
      skip,
      signalWebGLReady,
    }),
    [progress, phase, ready, canvasReady, revealed, skipped, skip, signalWebGLReady],
  );

  return <PreloadContext.Provider value={value}>{children}</PreloadContext.Provider>;
}

export function usePreload(): PreloadContextValue {
  const ctx = useContext(PreloadContext);
  if (!ctx) throw new Error('usePreload must be used within PreloadProvider');
  return ctx;
}
