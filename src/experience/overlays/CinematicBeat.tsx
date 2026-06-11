/**
 * CinematicBeat — opacity-only crossfade tied to scroll. No blur, no Y drift
 * (those caused jank and fought the 3D camera). Clean hold, clean handoff.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import type { Beat } from '@/experience/narrative';
import type { BeatWindow } from '@/experience/act-model';
import { interp } from '@/story/scroll-math';

type Align = 'center' | 'bottom' | 'left' | 'top';

interface CinematicBeatProps {
  progress: MotionValue<number>;
  beat: Beat;
  win: BeatWindow;
  align: Align;
}

function renderAccentLine(text: string, accentText?: string) {
  if (!accentText || !text.includes(accentText)) return text;
  const [before, after] = text.split(accentText);
  return (
    <>
      {before}
      <span className="exp-accent">{accentText}</span>
      {after}
    </>
  );
}

function renderText(beat: Beat) {
  const lines = beat.text.split('\n');
  if (lines.length === 1) return renderAccentLine(beat.text, beat.accentText);
  return lines.map((line, i) => (
    <span key={i} className="exp-line__row">
      {renderAccentLine(line, beat.accentText)}
    </span>
  ));
}

function beatOpacity(p: number, win: BeatWindow): number {
  const range = [win.inStart, win.inEnd, win.outStart, win.outEnd];
  return interp(p, range, [win.startVisible ? 1 : 0, 1, 1, 0]);
}

export function CinematicBeat({ progress, beat, win, align }: CinematicBeatProps) {
  const reduce = useReducedMotion();
  const weight = beat.weight ?? 'lead';
  const [opacity, setOpacity] = useState(() => beatOpacity(progress.get(), win));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(beatOpacity(p, win));
  });

  if (opacity < 0.02) return null;

  const alignClass =
    align === 'center'
      ? 'exp-beat exp-beat--center'
      : align === 'bottom'
        ? 'exp-beat exp-beat--bottom'
        : align === 'top'
          ? 'exp-beat exp-beat--top'
          : 'exp-beat exp-beat--left';

  const lift = (1 - opacity) * (reduce ? 0 : 22);
  const scale = 0.965 + opacity * 0.035;

  return (
    <div
      className={alignClass}
      style={{
        opacity,
        transform: `translateY(${lift}px) scale(${scale})`,
        transition: reduce ? 'none' : 'opacity 0.16s ease-out, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="exp-beat__inner">
        {beat.kicker && !beat.isQuote ? <span className="exp-kicker">{beat.kicker}</span> : null}
        <p
          className={`exp-line exp-line--${weight}${beat.isQuote ? ' exp-line--quote' : ''}${beat.singleLine ? ' exp-line--single' : ''}`}
        >
          {renderText(beat)}
        </p>
        {beat.kicker && beat.isQuote ? (
          <span className="exp-beat__attribution">— {beat.kicker}</span>
        ) : null}
      </div>
    </div>
  );
}
