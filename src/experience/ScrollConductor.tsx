/**
 * ScrollConductor — rAF-smoothed scroll with rest resistance, escape accumulator,
 * conductor-driven jump easing, and optional idle settle toward nearest rest.
 */
import { useEffect, useRef } from 'react';
import { useExperience } from '@/experience/ExperienceContext';
import { progressToScrollTop } from '@/experience/scroll-jump';
import { scrollTopToProgress } from '@/experience/scroll-progress';
import {
  nearestRest,
  restInfluence,
  scrollSpeedFactor,
} from '@/experience/scroll-rest-points';
import type { ScrollConductorBridge, ScrollJumpOpts } from '@/experience/scroll-conductor-bridge';
import { clamp01, easeInOutCubic, JUMP_DURATION_MS, SMOOTH_LAMBDA } from '@/story/scroll-math';

const SETTLE_IDLE_MS = 180;
const SETTLE_DURATION_MS = 400;
const SETTLE_INFLUENCE_MIN = 0.6;
const SETTLE_VELOCITY_MAX = 80;
const WHEEL_LINE_PX = 48;

interface JumpState {
  from: number;
  to: number;
  startMs: number;
  durationMs: number;
}

export function ScrollConductor() {
  const {
    conductorEnabled,
    registerConductor,
    syncProgressFromScrollY,
    targetRef,
  } = useExperience();

  const scrollYRef = useRef(0);
  const targetRef_ = useRef(0);
  const velocityRef = useRef(0);
  const escapeAccumRef = useRef(0);
  const escapeDirRef = useRef(0);
  const jumpRef = useRef<JumpState | null>(null);
  const lastInputMsRef = useRef(0);
  const settleFromRef = useRef(0);
  const settleStartMsRef = useRef(0);
  const settleActiveRef = useRef(false);
  const rafRef = useRef(0);
  const lastFrameMsRef = useRef(0);

  useEffect(() => {
    if (!conductorEnabled) {
      registerConductor(null);
      return undefined;
    }

    const section = targetRef.current;
    if (!section) return undefined;

    const scrollable = () => Math.max(section.offsetHeight - window.innerHeight, 0);
    const minY = () => section.offsetTop;
    const maxY = () => section.offsetTop + scrollable();

    const clampY = (y: number) => {
      const lo = minY();
      const hi = maxY();
      return lo + clamp01((y - lo) / Math.max(hi - lo, 1)) * (hi - lo);
    };

    const applyScrollY = (y: number) => {
      const clamped = clampY(y);
      scrollYRef.current = clamped;
      window.scrollTo({ top: clamped, behavior: 'instant' });
      syncProgressFromScrollY(clamped);
    };

    const currentProgress = () => scrollTopToProgress(section, scrollYRef.current);

    const addDelta = (rawPx: number) => {
      settleActiveRef.current = false;
      jumpRef.current = null;
      lastInputMsRef.current = performance.now();

      const dir = Math.sign(rawPx) || escapeDirRef.current;
      if (dir === escapeDirRef.current) escapeAccumRef.current += 1;
      else {
        escapeDirRef.current = dir;
        escapeAccumRef.current = 1;
      }

      const prog = currentProgress();
      const factor = scrollSpeedFactor(prog, escapeAccumRef.current);
      targetRef_.current = clampY(targetRef_.current + rawPx * factor);
    };

    const jumpTo = (progress: number, opts?: ScrollJumpOpts) => {
      settleActiveRef.current = false;
      escapeAccumRef.current = 0;
      const top = progressToScrollTop(section, progress);
      if (!opts?.smooth) {
        jumpRef.current = null;
        targetRef_.current = top;
        applyScrollY(top);
        return;
      }
      jumpRef.current = {
        from: scrollYRef.current,
        to: top,
        startMs: performance.now(),
        durationMs: opts.duration ?? JUMP_DURATION_MS,
      };
      targetRef_.current = top;
    };

    const syncFromNative = () => {
      const y = window.scrollY;
      scrollYRef.current = y;
      targetRef_.current = y;
      syncProgressFromScrollY(y);
    };

    const bridge: ScrollConductorBridge = {
      addDelta,
      jumpTo,
      syncFromNative,
      getMetrics: () => ({
        scrollY: scrollYRef.current,
        targetScrollTop: targetRef_.current,
        velocity: velocityRef.current,
      }),
    };

    registerConductor(bridge);
    syncFromNative();

    const tick = (now: number) => {
      const last = lastFrameMsRef.current || now;
      const dt = Math.min((now - last) / 1000, 0.05);
      lastFrameMsRef.current = now;

      const prevY = scrollYRef.current;
      let target = targetRef_.current;

      const jump = jumpRef.current;
      if (jump) {
        const t = clamp01((now - jump.startMs) / jump.durationMs);
        const eased = easeInOutCubic(t);
        target = jump.from + (jump.to - jump.from) * eased;
        scrollYRef.current = target;
        if (t >= 1) jumpRef.current = null;
      } else if (settleActiveRef.current) {
        const st = clamp01((now - settleStartMsRef.current) / SETTLE_DURATION_MS);
        const eased = easeInOutCubic(st);
        target = settleFromRef.current + (targetRef_.current - settleFromRef.current) * eased;
        scrollYRef.current = target;
        if (st >= 1) settleActiveRef.current = false;
      } else {
        const damp = 1 - Math.exp(-SMOOTH_LAMBDA * dt);
        const next = prevY + (target - prevY) * damp;
        scrollYRef.current = next;
        velocityRef.current = (next - prevY) / dt;

        const idleMs = now - lastInputMsRef.current;
        if (
          idleMs > SETTLE_IDLE_MS &&
          Math.abs(velocityRef.current) < SETTLE_VELOCITY_MAX &&
          Math.abs(target - prevY) < 2
        ) {
          const prog = scrollTopToProgress(section, next);
          const influence = restInfluence(prog);
          if (influence >= SETTLE_INFLUENCE_MIN) {
            const rest = nearestRest(prog);
            if (rest) {
              const restTop = progressToScrollTop(section, rest.progress);
              if (Math.abs(restTop - next) > 4) {
                settleActiveRef.current = true;
                settleFromRef.current = next;
                settleStartMsRef.current = now;
                targetRef_.current = restTop;
              }
            }
          }
        }
      }

      if (Math.abs(scrollYRef.current - window.scrollY) > 0.5) {
        window.scrollTo({ top: scrollYRef.current, behavior: 'instant' });
      }
      syncProgressFromScrollY(scrollYRef.current);

      const dist = Math.abs(targetRef_.current - scrollYRef.current);
      if (dist < 0.25 && !jumpRef.current && !settleActiveRef.current) {
        escapeAccumRef.current = Math.max(0, escapeAccumRef.current - 0.02);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * WHEEL_LINE_PX : e.deltaY;
      addDelta(delta);
    };

    let touchY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? 0;
      lastInputMsRef.current = performance.now();
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchY;
      const delta = touchY - y;
      touchY = y;
      addDelta(delta * 1.4);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(rafRef.current);
      registerConductor(null);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [conductorEnabled, registerConductor, syncProgressFromScrollY, targetRef]);

  return null;
}
