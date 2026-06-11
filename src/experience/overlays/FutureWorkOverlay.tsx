/**
 * FutureWorkOverlay — Act V roadmap panel. Scroll-timed frosted card with
 * staggered item reveals; minimal motion (opacity + slight translate).
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useExperience } from '@/experience/ExperienceContext';
import { actWindowById } from '@/experience/act-model';
import {
  FUTURE_LIST_FADE,
  FUTURE_LIST_IN,
  FUTURE_LIST_OUT,
  FUTURE_LIST_OUT_START,
} from '@/experience/future-work-phases';
import { FUTURE_WORK_ITEMS } from '@/experience/narrative';
import { clamp01, interp, overlayMotionTransition } from '@/story/scroll-math';

function panelOpacity(local: number): number {
  const range = [FUTURE_LIST_IN, FUTURE_LIST_IN + FUTURE_LIST_FADE, FUTURE_LIST_OUT_START, FUTURE_LIST_OUT];
  return interp(local, range, [0, 1, 1, 0]);
}

function itemOpacity(local: number, index: number): number {
  const panel = panelOpacity(local);
  if (panel < 0.02) return 0;
  const stagger = 0.045;
  const itemIn = FUTURE_LIST_IN + FUTURE_LIST_FADE * 0.5 + stagger * index;
  const itemFade = 0.06;
  const raw = interp(local, [itemIn, itemIn + itemFade], [0, 1]);
  const cap = 1 - index * 0.02;
  return panel * clamp01(raw) * cap;
}

export function FutureWorkOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const { conductorEnabled } = useExperience();
  const { start, end } = actWindowById('future-work');
  const span = end - start;

  const [opacity, setOpacity] = useState(0);
  const [local, setLocal] = useState(-1);

  const apply = useCallback(
    (p: number) => {
      if (p < start || p > end) {
        setLocal(-1);
        setOpacity(0);
        return;
      }
      const l = clamp01((p - start) / span);
      setLocal(l);
      setOpacity(panelOpacity(l));
    },
    [start, end, span],
  );

  useMotionValueEvent(progress, 'change', apply);

  if (opacity < 0.02 || local < 0) return null;

  const lift = reduce ? 0 : (1 - opacity) * 12;

  return (
    <div
      className="exp-future-work"
      style={{
        opacity,
        transform: `translateY(${lift}px)`,
        transition: overlayMotionTransition(!!reduce, conductorEnabled),
      }}
      aria-hidden
    >
      <div className="exp-future-work__panel">
        <p className="exp-future-work__kicker">Act V — Future Work</p>
        <h2 className="exp-future-work__title">Next horizons</h2>
        <ul className="exp-future-work__list">
          {FUTURE_WORK_ITEMS.map((item, i) => {
            const itemOp = itemOpacity(local, i);
            const itemLift = reduce ? 0 : (1 - itemOp) * 5;
            if (itemOp < 0.02) return null;
            return (
              <li
                key={item.id}
                className="exp-future-work__item"
                style={{
                  opacity: itemOp,
                  transform: `translateY(${itemLift}px)`,
                }}
              >
                <span className="exp-future-work__item-label">{item.label}</span>
                <span className="exp-future-work__item-detail">{item.detail}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
