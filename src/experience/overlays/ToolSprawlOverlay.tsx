/**
 * ToolSprawlOverlay — Act I, phase 2. A pentest's toolbox, scattered. Real
 * tool marks drift across the screen as disconnected frosted badges, each
 * floating on its own, none connected to anything. The disconnection is the
 * message: a dozen tools, no shared system.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { ACTS } from '@/experience/narrative';
import {
  SPRAWL_HEADLINE_IN,
  SPRAWL_EXIT_END,
  SPRAWL_EXIT_START,
  SPRAWL_HEADLINE_OUT,
  SPRAWL_HEADLINE_OUT_START,
  SPRAWL_TOOL_FADE,
  sprawlToolInAt,
} from '@/experience/problem-phases';
import { TOOL_SPRAWL_POSITIONS } from '@/experience/sprawl-layout';
import { ToolIcon, toolMeta, TOOL_IDS, type ToolId } from '@/experience/ui/ToolIcon';
import { interp } from '@/story/scroll-math';

const SPRAWL_BEAT = ACTS.find((a) => a.id === 'problem')!.beats[0]!;

const POSITIONS = TOOL_SPRAWL_POSITIONS;

export function ToolSprawlOverlay({ progress }: { progress: MotionValue<number> }) {
  const { start, end } = actWindowById('problem');
  const span = end - start;

  return (
    <div className="exp-sprawl" aria-hidden>
      <SprawlHeadline progress={progress} start={start} span={span} />
      {TOOL_IDS.map((id, i) => (
        <ToolBadge key={id} id={id} index={i} progress={progress} start={start} span={span} />
      ))}
    </div>
  );
}

function renderSprawlText() {
  const { text, accentText } = SPRAWL_BEAT;
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

function SprawlHeadline({
  progress,
  start,
  span,
}: {
  progress: MotionValue<number>;
  start: number;
  span: number;
}) {
  const reduce = useReducedMotion();
  const inAt = start + span * SPRAWL_HEADLINE_IN;
  const outStart = start + span * SPRAWL_HEADLINE_OUT_START;
  const outEnd = start + span * SPRAWL_HEADLINE_OUT;
  const range = [inAt, inAt + span * 0.06, outStart, outEnd];

  const [opacity, setOpacity] = useState(() => interp(progress.get(), range, [0, 1, 1, 0]));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, range, [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  const lift = (1 - opacity) * (reduce ? 0 : 14);
  const scale = 0.97 + opacity * 0.03;

  return (
    <div
      className="exp-sprawl__headline"
      style={{
        opacity,
        transform: `translate(-50%, calc(-50% + ${lift}px)) scale(${scale})`,
        transition: reduce ? 'none' : 'opacity 0.16s ease-out, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {SPRAWL_BEAT.kicker ? <span className="exp-kicker">{SPRAWL_BEAT.kicker}</span> : null}
      <p className="exp-line exp-line--lead">{renderSprawlText()}</p>
    </div>
  );
}

function ToolBadge({
  id,
  index,
  progress,
  start,
  span,
}: {
  id: ToolId;
  index: number;
  progress: MotionValue<number>;
  start: number;
  span: number;
}) {
  const reduce = useReducedMotion();
  const meta = toolMeta(id);
  const pos = POSITIONS[id];

  // Tools fade out in lockstep with the sprawl headline.
  const inAt = start + span * sprawlToolInAt(index);
  const outStart = start + span * SPRAWL_EXIT_START;
  const outEnd = start + span * SPRAWL_EXIT_END;
  const range = [inAt, inAt + span * SPRAWL_TOOL_FADE, outStart, outEnd];

  const [opacity, setOpacity] = useState(() => interp(progress.get(), range, [0, 1, 1, 0]));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, range, [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  // Each badge floats on its own loop — varied duration/delay so the cloud
  // never pulses in unison.
  const dur = 6.5 + (index % 5) * 1.3;
  const delay = -(index * 0.9);

  return (
    <span
      className={reduce ? 'exp-tool' : 'exp-tool exp-tool--float'}
      style={{
        top: pos.top,
        left: pos.left,
        opacity,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        ['--tool-color' as string]: meta.color,
      }}
    >
      <span className="exp-tool__icon">
        <ToolIcon id={id} size={26} />
      </span>
      <span className="exp-tool__name">{meta.label}</span>
    </span>
  );
}
