/**
 * ScrollConductor — rAF-smoothed scroll with rest resistance, escape accumulator,
 * and conductor-driven jump easing.
 */
import { useEffect, useRef } from 'react';
import { useExperience } from '@/experience/ExperienceContext';
import { progressToScrollTop } from '@/experience/scroll-jump';
import { scrollTopToProgress } from '@/experience/scroll-progress';
import { ESCAPE_IDLE_DECAY_MS, scrollSpeedFactor } from '@/experience/scroll-rest-points';
import type { ScrollConductorBridge, ScrollInputSource, ScrollJumpOpts } from '@/experience/scroll-conductor-bridge';
import { clamp01, easeInOutCubic, JUMP_DURATION_MS, SMOOTH_LAMBDA } from '@/story/scroll-math';

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
  const lastInputSourceRef = useRef<ScrollInputSource>('wheel');
  const keyboardFramesRef = useRef(0);
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

    const addDelta = (rawPx: number, source: ScrollInputSource = 'wheel') => {
      if (rawPx === 0) return;

      jumpRef.current = null;
      lastInputMsRef.current = performance.now();
      lastInputSourceRef.current = source;

      const dir = Math.sign(rawPx) || escapeDirRef.current;

      // Reverse direction: snap target to current scroll so we don't fight lag/inertia.
      if (dir !== 0 && escapeDirRef.current !== 0 && dir !== escapeDirRef.current) {
        targetRef_.current = scrollYRef.current;
        escapeAccumRef.current = 0;
        keyboardFramesRef.current = 0;
      }

      if (dir === escapeDirRef.current) escapeAccumRef.current += 1;
      else {
        escapeDirRef.current = dir;
        escapeAccumRef.current = 1;
      }

      if (source === 'keyboard') {
        keyboardFramesRef.current += 1;
        // Sustained arrow keys = deliberate pass-through at architecture rests.
        if (keyboardFramesRef.current >= 3) {
          escapeAccumRef.current = Math.max(escapeAccumRef.current, 4);
        }
      } else {
        keyboardFramesRef.current = 0;
      }

      const prog = currentProgress();
      const factor = scrollSpeedFactor(prog, escapeAccumRef.current, {
        keyboard: source === 'keyboard',
      });
      targetRef_.current = clampY(targetRef_.current + rawPx * factor);

      // Keyboard: apply immediately — no lerp lag or post-key-up coast.
      if (source === 'keyboard') {
        applyScrollY(targetRef_.current);
      }
    };

    const endKeyboardScroll = () => {
      jumpRef.current = null;
      targetRef_.current = scrollYRef.current;
      velocityRef.current = 0;
      keyboardFramesRef.current = 0;
      escapeAccumRef.current = 0;
      escapeDirRef.current = 0;
    };

    const jumpTo = (progress: number, opts?: ScrollJumpOpts) => {
      escapeAccumRef.current = 0;
      keyboardFramesRef.current = 0;
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
      endKeyboardScroll,
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
      const target = targetRef_.current;

      const jump = jumpRef.current;
      if (jump) {
        const t = clamp01((now - jump.startMs) / jump.durationMs);
        const eased = easeInOutCubic(t);
        scrollYRef.current = jump.from + (jump.to - jump.from) * eased;
        if (t >= 1) jumpRef.current = null;
      } else if (lastInputSourceRef.current === 'keyboard' && keyboardFramesRef.current > 0) {
        // Keyboard uses direct apply in addDelta; keep in sync if tick runs alone.
        scrollYRef.current = target;
        velocityRef.current = 0;
      } else {
        const damp = 1 - Math.exp(-SMOOTH_LAMBDA * dt);
        const next = prevY + (target - prevY) * damp;
        scrollYRef.current = next;
        velocityRef.current = dt > 0 ? (next - prevY) / dt : 0;
      }

      if (Math.abs(scrollYRef.current - window.scrollY) > 0.5) {
        window.scrollTo({ top: scrollYRef.current, behavior: 'instant' });
      }
      syncProgressFromScrollY(scrollYRef.current);

      const idleMs = now - lastInputMsRef.current;
      const dist = Math.abs(targetRef_.current - scrollYRef.current);

      // Only decay escape after input fully stops — prevents slow/fast oscillation at arch docks.
      if (
        idleMs > ESCAPE_IDLE_DECAY_MS &&
        dist < 0.5 &&
        !jumpRef.current &&
        keyboardFramesRef.current === 0
      ) {
        escapeAccumRef.current = Math.max(0, escapeAccumRef.current - 0.04);
        if (escapeAccumRef.current <= 0) escapeDirRef.current = 0;
      }

      if (idleMs > ESCAPE_IDLE_DECAY_MS) {
        keyboardFramesRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * WHEEL_LINE_PX : e.deltaY;
      addDelta(delta, 'wheel');
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
      addDelta(delta * 1.4, 'touch');
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
