/**
 * ToolOutputsOverlay — Act I, phase 3 (Format chaos). Two beats:
 * 1) Extension badges scattered (.xml … .csv) — no chain, no arrows
 * 2) Sample output-structure cards (generic snippets, no tool names)
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { SAMPLE_PANELS, type SamplePanel } from '@/experience/sprawl-layout';
import {
  CHAOS_END,
  CHAOS_FORMAT_FADE,
  CHAOS_FORMATS_PHASE_END,
  CHAOS_SAMPLE_FADE,
  chaosFormatInAt,
  chaosSampleInAt,
  formatScatterPosition,
} from '@/experience/problem-phases';
import { FormatIcon, FORMAT_IDS, formatMeta, type FormatId } from '@/experience/ui/FormatIcon';
import { interp } from '@/story/scroll-math';

const SAMPLES = SAMPLE_PANELS;

export function ToolOutputsOverlay({ progress }: { progress: MotionValue<number> }) {
  const { start, end } = actWindowById('problem');
  const span = end - start;

  return (
    <div className="exp-outputs" aria-hidden>
      <FormatScatter progress={progress} start={start} span={span} />
      {SAMPLES.map((panel, i) => (
        <SampleCard key={panel.format} panel={panel} index={i} progress={progress} start={start} span={span} />
      ))}
    </div>
  );
}

function FormatScatter({
  progress,
  start,
  span,
}: {
  progress: MotionValue<number>;
  start: number;
  span: number;
}) {
  return (
    <div className="exp-formats" aria-hidden>
      {FORMAT_IDS.map((id, i) => (
        <FormatBadge key={id} id={id} index={i} progress={progress} start={start} span={span} />
      ))}
    </div>
  );
}

function FormatBadge({
  id,
  index,
  progress,
  start,
  span,
}: {
  id: FormatId;
  index: number;
  progress: MotionValue<number>;
  start: number;
  span: number;
}) {
  const reduce = useReducedMotion();
  const meta = formatMeta(id);
  const pos = formatScatterPosition(index, FORMAT_IDS.length);
  const inAt = start + span * chaosFormatInAt(index);
  const outAt = start + span * CHAOS_FORMATS_PHASE_END;
  const range = [inAt, inAt + span * CHAOS_FORMAT_FADE, outAt - span * 0.04, outAt];

  const [opacity, setOpacity] = useState(() => interp(progress.get(), range, [0, 1, 1, 0]));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, range, [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  const dur = 7 + (index % 4) * 1.2;
  const delay = -(index * 0.75);

  return (
    <span
      className={reduce ? 'exp-formats__badge' : 'exp-formats__badge exp-formats__badge--float'}
      style={{
        top: pos.top,
        left: pos.left,
        opacity,
        animationDuration: `${dur}s`,
        animationDelay: `${delay}s`,
        ['--format-color' as string]: meta.color,
      }}
    >
      <span className="exp-formats__icon">
        <FormatIcon id={id} size={30} />
      </span>
      <span className="exp-formats__label">{meta.label}</span>
    </span>
  );
}

function SampleCard({
  panel,
  index,
  progress,
  start,
  span,
}: {
  panel: SamplePanel;
  index: number;
  progress: MotionValue<number>;
  start: number;
  span: number;
}) {
  const meta = formatMeta(panel.format);
  const inAt = start + span * chaosSampleInAt(index);
  const outAt = start + span * CHAOS_END;
  const range = [inAt, inAt + span * CHAOS_SAMPLE_FADE, outAt - span * 0.08, outAt];

  const [opacity, setOpacity] = useState(() => interp(progress.get(), range, [0, 1, 1, 0]));

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, range, [0, 1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  return (
    <figure className={`exp-output exp-output--${panel.slot}`} style={{ opacity }}>
      <figcaption className="exp-output__head">
        <span className="exp-output__tool">
          <FormatIcon id={panel.format} size={16} />
          {meta.label}
        </span>
        <span className="exp-output__format">sample</span>
      </figcaption>
      <pre className="exp-output__body">
        {panel.lines.map((line, li) => (
          <span key={li} className="exp-output__line">
            {line}
          </span>
        ))}
      </pre>
    </figure>
  );
}
