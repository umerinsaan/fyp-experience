/**
 * ObjectiveLoopBreakOverlay — beat 2. Cost workflow loop cracks during
 * "We remove the redundant work that surrounds it."
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById, beatWindow } from '@/experience/act-model';
import { OBJ_LOOP_BREAK_AT } from '@/experience/objective-phases';
import { clamp01, interp } from '@/story/scroll-math';

const STEPS = ['Scope', 'Scan', 'Findings', 'Report'] as const;
const STEP_ANGLES = [270, 0, 90, 180];
const VIEW_W = 420;
const VIEW_H = 320;
const CX = VIEW_W / 2;
const CY = VIEW_H / 2;
const RX = 185;
const RY = 125;

export function ObjectiveLoopBreakOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const redundantWin = beatWindow('objective', 2, 6);
  const { start, end } = actWindowById('objective');
  const span = end - start;
  const breakAt = start + span * OBJ_LOOP_BREAK_AT;
  const fadeIn = redundantWin.inEnd - redundantWin.inStart;
  const mountStart = Math.max(0, redundantWin.inStart - fadeIn);
  const range = [redundantWin.inStart, redundantWin.inEnd, redundantWin.outStart, redundantWin.outEnd];

  const p0 = progress.get();
  const [mounted, setMounted] = useState(() => p0 >= mountStart && p0 <= redundantWin.outEnd);
  const [opacity, setOpacity] = useState(() => interp(p0, range, [0, 1, 1, 0]));
  const [broken, setBroken] = useState(() => p0 >= breakAt);
  const [breakT, setBreakT] = useState(() => clamp01((p0 - breakAt) / (span * 0.06)));

  useMotionValueEvent(progress, 'change', (p) => {
    setMounted(p >= mountStart && p <= redundantWin.outEnd);
    setOpacity(interp(p, range, [0, 1, 1, 0]));
    setBroken(p >= breakAt);
    setBreakT(clamp01((p - breakAt) / (span * 0.06)));
  });

  if (!mounted) return null;

  const grey = broken ? breakT : 0;

  return (
    <div className="exp-objective-loop" style={{ opacity }} aria-hidden>
      <svg className="exp-objective-loop__svg" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} role="presentation">
        <defs>
          <path
            id="exp-objective-loop-path"
            d={`M ${CX} ${CY - RY} A ${RX} ${RY} 0 1 1 ${CX - 0.4} ${CY - RY}`}
            fill="none"
          />
        </defs>
        <ellipse
          className={`exp-objective-loop__track${broken ? ' exp-objective-loop__track--broken' : ''}`}
          cx={CX}
          cy={CY}
          rx={RX}
          ry={RY}
          fill="none"
          style={{ opacity: 1 - grey * 0.65 }}
        />
        {!reduce && !broken ? (
          <circle className="exp-objective-loop__dot" r="5" fill="currentColor">
            <animateMotion dur="4s" repeatCount="indefinite" calcMode="linear">
              <mpath href="#exp-objective-loop-path" />
            </animateMotion>
          </circle>
        ) : null}
        {STEPS.map((label, i) => {
          const rad = (STEP_ANGLES[i] * Math.PI) / 180;
          const x = CX + Math.cos(rad) * RX;
          const y = CY + Math.sin(rad) * RY;
          return (
            <g key={label} transform={`translate(${x}, ${y})`} style={{ opacity: 1 - grey * 0.7 }}>
              <circle className="exp-objective-loop__node" r="14" />
              <text className="exp-objective-loop__node-label" textAnchor="middle" dominantBaseline="middle">
                {label}
              </text>
            </g>
          );
        })}
        {broken ? (
          <line
            className="exp-objective-loop__crack"
            x1={CX - 40}
            y1={CY - 20}
            x2={CX + 50}
            y2={CY + 30}
            style={{ opacity: breakT }}
          />
        ) : null}
      </svg>
    </div>
  );
}
