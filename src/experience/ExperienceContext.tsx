/**
 * Experience context — scroll conductor (when motion allowed) or native scroll
 * drives a single global progress value for the whole film.
 */
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
import { useMotionValue, type MotionValue } from 'framer-motion';
import { getActState } from '@/experience/act-model';
import { readScrollProgress, scrollTopToProgress } from '@/experience/scroll-progress';
import { progressToScrollTop } from '@/experience/scroll-jump';
import { setScrollMapLinear } from '@/experience/scroll-map';
import type { ScrollConductorBridge, ScrollJumpOpts } from '@/experience/scroll-conductor-bridge';
import type { ActId } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

interface ExperienceContextValue {
  progress: MotionValue<number>;
  progressRef: React.MutableRefObject<number>;
  actIndex: number;
  actId: ActId;
  conductorEnabled: boolean;
  scrollToProgress: (p: number, opts?: ScrollJumpOpts) => void;
  scrollByDelta: (px: number) => void;
  registerConductor: (bridge: ScrollConductorBridge | null) => void;
  /** Publish progress from a physical scrollY (conductor rAF). */
  syncProgressFromScrollY: (scrollY: number) => void;
  targetRef: React.RefObject<HTMLElement | null>;
}

const Ctx = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({
  targetRef,
  conductorEnabled,
  children,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  conductorEnabled: boolean;
  children: ReactNode;
}) {
  const progress = useMotionValue(0);
  const progressRef = useRef(0);
  const [actIndex, setActIndex] = useState(0);
  const [actId, setActId] = useState<ActId>('hero');
  const conductorRef = useRef<ScrollConductorBridge | null>(null);

  const applyProgress = useCallback(
    (p: number) => {
      const prog = clamp01(p);
      progressRef.current = prog;
      progress.set(prog);
      const state = getActState(prog);
      setActIndex(state.index);
      setActId(state.id);
    },
    [progress],
  );

  const registerConductor = useCallback((bridge: ScrollConductorBridge | null) => {
    conductorRef.current = bridge;
  }, []);

  const syncFromScroll = useCallback(() => {
    const section = targetRef.current;
    if (!section) return;
    applyProgress(readScrollProgress(section));
  }, [targetRef, applyProgress]);

  const syncProgressFromScrollY = useCallback(
    (scrollY: number) => {
      const section = targetRef.current;
      if (!section) return;
      applyProgress(scrollTopToProgress(section, scrollY));
    },
    [targetRef, applyProgress],
  );

  const scrollByDelta = useCallback(
    (px: number) => {
      if (conductorEnabled && conductorRef.current) {
        conductorRef.current.addDelta(px);
        return;
      }
      window.scrollBy({ top: px, behavior: 'instant' });
      syncFromScroll();
    },
    [conductorEnabled, syncFromScroll],
  );

  const scrollToProgress = useCallback(
    (p: number, opts?: ScrollJumpOpts) => {
      const prog = clamp01(p);
      if (conductorEnabled && conductorRef.current) {
        conductorRef.current.jumpTo(prog, opts);
        return;
      }
      const section = targetRef.current;
      if (!section) return;
      const top = progressToScrollTop(section, prog);
      window.scrollTo({ top, behavior: opts?.smooth ? 'smooth' : 'instant' });
      applyProgress(prog);
    },
    [targetRef, applyProgress, conductorEnabled],
  );

  useEffect(() => {
    setScrollMapLinear(!conductorEnabled);
  }, [conductorEnabled]);

  useEffect(() => {
    const section = targetRef.current;
    if (!section) return;

    if (conductorEnabled) {
      syncFromScroll();
      return undefined;
    }

    const sync = () => syncFromScroll();
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [targetRef, conductorEnabled, syncFromScroll]);

  useEffect(() => {
    if (!conductorEnabled) return undefined;
    const onResize = () => conductorRef.current?.syncFromNative();
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [conductorEnabled]);

  const value = useMemo<ExperienceContextValue>(
    () => ({
      progress,
      progressRef,
      actIndex,
      actId,
      conductorEnabled,
      scrollToProgress,
      scrollByDelta,
      registerConductor,
      syncProgressFromScrollY,
      targetRef,
    }),
    [
      progress,
      actIndex,
      actId,
      conductorEnabled,
      scrollToProgress,
      scrollByDelta,
      registerConductor,
      syncProgressFromScrollY,
      targetRef,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useExperience must be used within ExperienceProvider');
  return ctx;
}
