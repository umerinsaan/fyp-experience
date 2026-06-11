/**
 * KeyboardNavDriver — keyboard scroll for the cinematic experience.
 *
 * Arrow keys and Space drive continuous scroll (rAF loop) so held keys don't
 * stack conflicting smooth-scroll jumps. PageUp/PageDown move one viewport;
 * Home/End and 1–9 jump to act boundaries. Alt+1–9 is handled by VivaDemoDriver.
 */
import { useEffect, useRef } from 'react';
import { useExperience } from '@/experience/ExperienceContext';
import { ACT_WINDOWS } from '@/experience/act-model';

/** Pixels per second while ↑/↓/Space are held — tuned for ~2200vh total height. */
const SCROLL_SPEED_PX = 1050;

/** Act-start jump points (slightly past each act seam). */
const ACT_STARTS: readonly number[] = ACT_WINDOWS.map((w) => w.start + (w.end - w.start) * 0.06);

const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', ' ', 'Spacebar']);

function isEditableTarget(target: EventTarget | null): boolean {
  const tag = (target as HTMLElement | null)?.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

export function KeyboardNavDriver() {
  const { scrollToProgress, scrollByDelta } = useExperience();
  const activeKeysRef = useRef(new Set<string>());
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);

  useEffect(() => {
    const tick = (now: number) => {
      const keys = activeKeysRef.current;
      if (keys.size > 0) {
        const last = lastFrameRef.current || now;
        const dt = Math.min((now - last) / 1000, 0.05);
        lastFrameRef.current = now;

        let delta = 0;
        if (keys.has('ArrowDown') || keys.has(' ') || keys.has('Spacebar')) delta += SCROLL_SPEED_PX * dt;
        if (keys.has('ArrowUp')) delta -= SCROLL_SPEED_PX * dt;

        if (delta !== 0) {
          scrollByDelta(delta);
        }
      } else {
        lastFrameRef.current = 0;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      if (SCROLL_KEYS.has(e.key)) {
        e.preventDefault();
        activeKeysRef.current.add(e.key);
        return;
      }

      switch (e.key) {
        case 'PageDown': {
          e.preventDefault();
          scrollByDelta(window.innerHeight * 0.88);
          break;
        }
        case 'PageUp': {
          e.preventDefault();
          scrollByDelta(-window.innerHeight * 0.88);
          break;
        }
        case 'Home': {
          e.preventDefault();
          scrollToProgress(0, { smooth: true });
          break;
        }
        case 'End': {
          e.preventDefault();
          scrollToProgress(1, { smooth: true });
          break;
        }
        default: {
          if (e.key >= '1' && e.key <= '9') {
            const idx = Number(e.key) - 1;
            if (idx < ACT_STARTS.length) {
              e.preventDefault();
              scrollToProgress(ACT_STARTS[idx], { smooth: true });
            }
          }
          break;
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      activeKeysRef.current.delete(e.key);
      if (e.key === ' ') activeKeysRef.current.delete('Spacebar');
    };

    const onBlur = () => {
      activeKeysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      activeKeysRef.current.clear();
    };
  }, [scrollToProgress, scrollByDelta]);

  return null;
}
