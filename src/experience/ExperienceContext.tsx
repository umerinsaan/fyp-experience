/**
 * Experience context — one native scroll listener drives progress for the
 * whole film. No Lenis inertia, no Framer useScroll — direct 1:1 mapping.
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
import { readScrollProgress } from '@/experience/scroll-progress';
import { progressToScrollTop } from '@/experience/scroll-jump';
import type { ActId } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

interface ExperienceContextValue {
  /** Global progress 0..1 — updated on every scroll event. */
  progress: MotionValue<number>;
  /** Same value for the WebGL frame loop (no React re-render). */
  progressRef: React.MutableRefObject<number>;
  actIndex: number;
  actId: ActId;
  /** Pass 6 — jump to a global progress point (viva demo). */
  scrollToProgress: (p: number, opts?: { smooth?: boolean }) => void;
}

const Ctx = createContext<ExperienceContextValue | null>(null);

export function ExperienceProvider({
  targetRef,
  children,
}: {
  targetRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
}) {
  const progress = useMotionValue(0);
  const progressRef = useRef(0);
  const [actIndex, setActIndex] = useState(0);
  const [actId, setActId] = useState<ActId>('hero');

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

  const scrollToProgress = useCallback(
    (p: number, opts?: { smooth?: boolean }) => {
      const section = targetRef.current;
      if (!section) return;
      const prog = clamp01(p);
      const top = progressToScrollTop(section, prog);
      window.scrollTo({ top, behavior: opts?.smooth ? 'smooth' : 'instant' });
      applyProgress(prog);
    },
    [targetRef, applyProgress],
  );

  useEffect(() => {
    const section = targetRef.current;
    if (!section) return;

    const sync = () => {
      applyProgress(readScrollProgress(section));
    };

    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [targetRef, applyProgress]);

  const value = useMemo<ExperienceContextValue>(
    () => ({ progress, progressRef, actIndex, actId, scrollToProgress }),
    [progress, actIndex, actId, scrollToProgress],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useExperience must be used within ExperienceProvider');
  return ctx;
}
