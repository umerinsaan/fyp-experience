/**
 * ProblemQuestionBeat — the opening line of Act I. The act's question lands
 * dead-center as a keynote headline, holds, then lifts away as the tools
 * begin to scatter. The same question persists small in the top-right HUD
 * (Chrome), so it reads as if the line "moved" up there.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { ACTS } from '@/experience/narrative';
import { interp } from '@/story/scroll-math';

const PROBLEM = ACTS.find((a) => a.id === 'problem')!;
const QUESTION = PROBLEM.question;
const ACCENT_WORD = 'painful?';

function renderQuestion() {
  if (!QUESTION.includes(ACCENT_WORD)) return QUESTION;
  const [before] = QUESTION.split(ACCENT_WORD);
  return (
    <>
      {before}
      <span className="exp-accent">{ACCENT_WORD}</span>
    </>
  );
}

export function ProblemQuestionBeat({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const { start, end } = actWindowById('problem');
  const span = end - start;

  const inStart = start + span * 0.02;
  const inEnd = start + span * 0.07;
  const outStart = start + span * 0.12;
  const outEnd = start + span * 0.18;

  const [opacity, setOpacity] = useState(() =>
    interp(progress.get(), [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0]),
  );

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, [inStart, inEnd, outStart, outEnd], [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  const lift = (1 - opacity) * (reduce ? 0 : -26);
  const scale = 0.97 + opacity * 0.03;

  return (
    <div className="exp-overlay" aria-hidden>
      <div className="exp-overlay-inner">
        <div
          className="exp-beat exp-beat--center"
          style={{
            opacity,
            transform: `translateY(${lift}px) scale(${scale})`,
            transition: reduce ? 'none' : 'opacity 0.16s ease-out, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <div className="exp-beat__inner">
            <span className="exp-kicker">Act I — The Problem</span>
            <p className="exp-line exp-line--hero">{renderQuestion()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
