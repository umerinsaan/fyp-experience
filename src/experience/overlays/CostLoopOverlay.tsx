/**
 * CostLoopOverlay — Act I (The Cost). An elliptical workflow loop runs endlessly
 * behind "So the work repeats." — scope, scan, findings, report, then again.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { beatWindow } from '@/experience/act-model';
import { interp } from '@/story/scroll-math';

const STEPS = ['Scope', 'Scan', 'Findings', 'Report'] as const;

/** Place step labels at 12, 3, 6, 9 o'clock on the ring. */
const STEP_ANGLES = [270, 0, 90, 180];

const VIEW_W = 420;
const VIEW_H = 320;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const RX = 185;
const RY = 125;

export function CostLoopOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const repeatWin = beatWindow('cost', 0, 4);

  // Fade in/out in lockstep with "So the work repeats." — gone before the next line.
  const range = [repeatWin.inStart, repeatWin.inEnd, repeatWin.outStart, repeatWin.outEnd];
  const fadeIn = repeatWin.inEnd - repeatWin.inStart;
  const mountStart = Math.max(0, repeatWin.inStart - fadeIn);

  const p0 = progress.get();
  const [opacity, setOpacity] = useState(() => interp(p0, range, [0, 1, 1, 0]));
  const [active, setActive] = useState(() => p0 >= mountStart && p0 <= repeatWin.outEnd);

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, range, [0, 1, 1, 0]));
    setActive(p >= mountStart && p <= repeatWin.outEnd);
  });

  // Keep SVG mounted for the full beat so animateMotion runs during fade-in.
  if (!active) return null;

  return (
    <div className="exp-cost-loop" style={{ opacity }} aria-hidden>
      <svg className="exp-cost-loop__svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="presentation">
        <defs>
          <path
            id="exp-cost-loop-path"
            d={`M ${CX} ${CY - RY} A ${RX} ${RY} 0 1 1 ${CX - 0.4} ${CY - RY}`}
            fill="none"
          />
        </defs>
        <ellipse className="exp-cost-loop__track" cx={CX} cy={CY} rx={RX} ry={RY} fill="none" />
        <ellipse className="exp-cost-loop__glow" cx={CX} cy={CY} rx={RX} ry={RY} fill="none" />
        {!reduce ? (
          <circle className="exp-cost-loop__dot" r="5" fill="currentColor">
            <animateMotion dur="4s" repeatCount="indefinite" calcMode="linear">
              <mpath href="#exp-cost-loop-path" />
            </animateMotion>
          </circle>
        ) : null}
        {STEPS.map((label, i) => {
          const rad = (STEP_ANGLES[i] * Math.PI) / 180;
          const x = CX + Math.cos(rad) * RX;
          const y = CY + Math.sin(rad) * RY;
          return (
            <g key={label} transform={`translate(${x}, ${y})`}>
              <circle className="exp-cost-loop__node" r="14" />
              <text className="exp-cost-loop__node-label" textAnchor="middle" dominantBaseline="middle">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
