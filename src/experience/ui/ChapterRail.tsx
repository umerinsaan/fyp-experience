/**
 * Pass 7–8 — chapter rail: click = act open, double-click = highlight beat.
 */
import { useRef } from 'react';
import { actJumpProgressByIndex } from '@/experience/act-navigation';
import { useExperience } from '@/experience/ExperienceContext';
import { ACTS } from '@/experience/narrative';
import { actHighlightLabel, actHighlightProgress } from '@/experience/viva-demo';
import { showVivaToast } from '@/experience/viva/viva-toast';

const CLICK_DELAY_MS = 260;

export function ChapterRail() {
  const { actIndex, scrollToProgress } = useExperience();
  const clickTimerRef = useRef<number | null>(null);

  const clearClickTimer = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  };

  return (
    <nav className="exp-rail" aria-label="Chapters">
      {ACTS.map((act, i) => (
        <button
          key={act.id}
          type="button"
          className="exp-rail-item"
          data-active={i === actIndex}
          aria-current={i === actIndex ? 'step' : undefined}
          aria-label={`${act.name}. Click to open act; double-click for highlight.`}
          onClick={() => {
            clearClickTimer();
            clickTimerRef.current = window.setTimeout(() => {
              scrollToProgress(actJumpProgressByIndex(i));
              showVivaToast(act.name);
              clickTimerRef.current = null;
            }, CLICK_DELAY_MS);
          }}
          onDoubleClick={(e) => {
            e.preventDefault();
            clearClickTimer();
            scrollToProgress(actHighlightProgress(act.id), { smooth: true });
            showVivaToast(actHighlightLabel(act.id));
          }}
        >
          <span className="exp-rail-dot" aria-hidden />
          <span className="exp-rail-label">{act.name}</span>
        </button>
      ))}
    </nav>
  );
}
