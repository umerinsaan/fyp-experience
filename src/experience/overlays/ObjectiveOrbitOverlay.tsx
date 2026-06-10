/**
 * ObjectiveOrbitOverlay — multi-ring system behind Act II copy.
 * Center: Platform · inner: Jobs/Pipelines/MITRE/Reports · middle: tools · outer: formats + PDF/DOCX.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById, beatWindow } from '@/experience/act-model';
import {
  ORBIT_CENTER,
  ORBIT_CHIPS,
  ORBIT_FORMAT_FILE_IDS,
  ORBIT_TOOLS,
  orbitChipPosition,
  orbitChipSlot,
  orbitFormatPosition,
  orbitFormatSlot,
  orbitToolPosition,
  orbitToolSlot,
} from '@/experience/objective-orbit-layout';
import { ACCENTS, type AccentKey } from '@/experience/narrative';
import { FormatIcon, formatMeta } from '@/experience/ui/FormatIcon';
import { ToolIcon, toolMeta } from '@/experience/ui/ToolIcon';
import { BsFillFilePdfFill, BsFillFileWordFill } from 'react-icons/bs';
import { ObjectiveOrbitLinks } from '@/experience/overlays/ObjectiveOrbitLinks';
import { clamp01, interp } from '@/story/scroll-math';

const REPORT_FORMATS = [
  { id: 'pdf', label: 'PDF', color: '#E84242', Icon: BsFillFilePdfFill },
  { id: 'docx', label: 'DOCX', color: '#2B579A', Icon: BsFillFileWordFill },
] as const;

const FORMAT_RING_COUNT = REPORT_FORMATS.length + ORBIT_FORMAT_FILE_IDS.length;

/** Fade in on beat window, hold through act, fade at act exit. */
function ringHoldOpacity(
  p: number,
  win: ReturnType<typeof beatWindow>,
  actEnd: number,
  actSpan: number,
): number {
  const fadeOutStart = actEnd - actSpan * 0.04;
  return interp(p, [win.inStart, win.inEnd, fadeOutStart, actEnd], [0, 1, 1, 0]);
}

export function ObjectiveOrbitOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const act = actWindowById('objective');
  const span = act.end - act.start;
  const unifyWin = beatWindow('objective', 3, 6);
  const jobsWin = beatWindow('objective', 4, 6);
  const approachWin = beatWindow('objective', 5, 6);
  const mountStart = Math.max(0, unifyWin.inStart - span * 0.02);
  const endAt = act.end;

  const p0 = progress.get();
  const [mounted, setMounted] = useState(() => p0 >= mountStart && p0 <= endAt);
  const [hubOp, setHubOp] = useState(() => ringHoldOpacity(p0, unifyWin, act.end, span));
  const [toolOp, setToolOp] = useState(() => ringHoldOpacity(p0, unifyWin, act.end, span));
  const [chipOp, setChipOp] = useState(() => ringHoldOpacity(p0, jobsWin, act.end, span));
  const [formatOp, setFormatOp] = useState(() => ringHoldOpacity(p0, approachWin, act.end, span));
  const [pulse, setPulse] = useState(() => p0 >= unifyWin.inStart && p0 <= act.end);

  useMotionValueEvent(progress, 'change', (p) => {
    setMounted(p >= mountStart && p <= endAt);
    setHubOp(ringHoldOpacity(p, unifyWin, act.end, span));
    setToolOp(ringHoldOpacity(p, unifyWin, act.end, span));
    setChipOp(ringHoldOpacity(p, jobsWin, act.end, span));
    setFormatOp(ringHoldOpacity(p, approachWin, act.end, span));
    setPulse(p >= unifyWin.inStart && p <= act.end);
  });

  if (!mounted) return null;

  return (
    <div className="exp-objective-orbit" aria-hidden>
      <ObjectiveOrbitLinks hubOp={hubOp} chipOp={chipOp} toolOp={toolOp} formatOp={formatOp} />

      <div className="exp-objective-orbit__guides" style={{ opacity: 0.28 * Math.max(hubOp, toolOp) }}>
        <span className="exp-objective-orbit__guide exp-objective-orbit__guide--chip" />
        <span className="exp-objective-orbit__guide exp-objective-orbit__guide--tool" />
        <span className="exp-objective-orbit__guide exp-objective-orbit__guide--format" />
      </div>

      <div
        className={`exp-objective-orbit__hub${!reduce && pulse ? ' exp-objective-orbit__hub--pulse' : ''}`}
        style={{
          top: `${ORBIT_CENTER.cy}%`,
          left: `${ORBIT_CENTER.cx}%`,
          opacity: hubOp,
        }}
      >
        <span className="exp-objective-orbit__hub-ring" />
        <span className="exp-objective-orbit__hub-label">Platform</span>
      </div>

      {ORBIT_CHIPS.map((chip, i) => {
        const pos = orbitChipPosition(i);
        const slot = orbitChipSlot(i);
        const stagger = clamp01((chipOp - i * 0.12) / 0.55);
        const op = chipOp * stagger;
        if (op < 0.02) return null;
        const accent = ACCENTS[chip.accent as AccentKey];
        return (
          <div
            key={chip.id}
            className={reduce ? 'exp-objective-orbit__chip' : 'exp-objective-orbit__chip exp-objective-orbit__chip--float'}
            style={{
              top: pos.top,
              left: pos.left,
              opacity: op,
              borderColor: accent,
              boxShadow: `0 0 10px color-mix(in srgb, ${accent} 28%, transparent)`,
              animationDuration: `${slot.floatSec}s`,
              animationDelay: `${slot.floatDelay}s`,
            }}
          >
            <span className="exp-objective-orbit__chip-dot" style={{ background: accent }} />
            {chip.label}
          </div>
        );
      })}

      {ORBIT_TOOLS.map((id, i) => {
        const pos = orbitToolPosition(i);
        const slot = orbitToolSlot(i);
        const meta = toolMeta(id);
        const stagger = clamp01((toolOp - i * 0.08) / 0.6);
        const op = toolOp * stagger * 0.82;
        if (op < 0.02) return null;
        return (
          <div
            key={id}
            className={reduce ? 'exp-objective-orbit__tool' : 'exp-objective-orbit__tool exp-objective-orbit__tool--float'}
            style={{
              top: pos.top,
              left: pos.left,
              opacity: op,
              ['--tool-color' as string]: meta.color,
              animationDuration: `${slot.floatSec}s`,
              animationDelay: `${slot.floatDelay}s`,
            }}
          >
            <ToolIcon id={id} size={15} />
          </div>
        );
      })}

      {Array.from({ length: FORMAT_RING_COUNT }, (_, i) => {
        const pos = orbitFormatPosition(i);
        const slot = orbitFormatSlot(i);
        const stagger = clamp01((formatOp - i * 0.07) / 0.65);
        const op = formatOp * stagger * 0.78;
        if (op < 0.02) return null;

        if (i < REPORT_FORMATS.length) {
          const report = REPORT_FORMATS[i];
          const Icon = report.Icon;
          return (
            <div
              key={report.id}
              className={reduce ? 'exp-objective-orbit__format' : 'exp-objective-orbit__format exp-objective-orbit__format--float'}
              style={{
                top: pos.top,
                left: pos.left,
                opacity: op,
                ['--format-color' as string]: report.color,
                animationDuration: `${slot.floatSec}s`,
                animationDelay: `${slot.floatDelay}s`,
              }}
            >
              <Icon size={14} color={report.color} aria-hidden />
              <span className="exp-objective-orbit__format-label">{report.label}</span>
            </div>
          );
        }

        const formatIndex = i - REPORT_FORMATS.length;
        const formatId = ORBIT_FORMAT_FILE_IDS[formatIndex];
        if (!formatId) return null;
        const meta = formatMeta(formatId);
        return (
          <div
            key={formatId}
            className={reduce ? 'exp-objective-orbit__format' : 'exp-objective-orbit__format exp-objective-orbit__format--float'}
            style={{
              top: pos.top,
              left: pos.left,
              opacity: op,
              ['--format-color' as string]: meta.color,
              animationDuration: `${slot.floatSec}s`,
              animationDelay: `${slot.floatDelay}s`,
            }}
          >
            <FormatIcon id={formatId} size={14} />
            <span className="exp-objective-orbit__format-label">{meta.label}</span>
          </div>
        );
      })}
    </div>
  );
}
