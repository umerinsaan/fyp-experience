/**
 * CostManualEffortOverlay — large faded gears behind "Every step in between
 * takes manual effort." Gears mount early (spinning off-screen) so rotation is
 * already underway when the line fades in.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useMemo, useState } from 'react';
import { beatWindow } from '@/experience/act-model';
import { interp } from '@/story/scroll-math';

const BASE_DUR = 10;

const GEARS = [
  { cx: 200, cy: 210, r: 118, teeth: 18, dir: 1 as const, dur: BASE_DUR },
  { cx: 340, cy: 130, r: 82, teeth: 14, dir: -1 as const, dur: BASE_DUR * (82 / 118) },
  { cx: 430, cy: 248, r: 96, teeth: 15, dir: 1 as const, dur: BASE_DUR * (96 / 118) },
  { cx: 120, cy: 100, r: 64, teeth: 11, dir: -1 as const, dur: BASE_DUR * (64 / 118) },
] as const;

function gearPath(outerR: number, rootR: number, teeth: number): string {
  const tau = Math.PI * 2;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const t = (i / teeth) * tau;
    const step = tau / teeth;
    const push = (r: number, a: number) => {
      pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
    };
    push(outerR, t);
    push(outerR, t + step * 0.18);
    push(rootR, t + step * 0.36);
    push(rootR, t + step * 0.64);
    push(outerR, t + step * 0.82);
    push(outerR, t + step);
  }
  return `M ${pts.join(' L ')} Z`;
}

function BgGear({
  cx,
  cy,
  r,
  teeth,
  dir,
  dur,
  animate,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  dir: 1 | -1;
  dur: number;
  animate: boolean;
}) {
  const d = useMemo(() => gearPath(r, r * 0.72, teeth), [r, teeth]);

  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <g
        className={
          animate
            ? `exp-manual-effort__spin${dir < 0 ? ' exp-manual-effort__spin--rev' : ''}`
            : undefined
        }
        style={animate ? { animationDuration: `${dur}s` } : undefined}
      >
        <path className="exp-manual-effort__bg-gear" d={d} />
        <circle className="exp-manual-effort__bg-hub" r={r * 0.2} />
        <line className="exp-manual-effort__bg-spoke" x1="0" y1="0" x2="0" y2={-r * 0.78} />
      </g>
    </g>
  );
}

export function CostManualEffortOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const manualWin = beatWindow('cost', 1, 4);
  // Mount when the cost act's first beat begins — gears spin invisibly until manual-effort copy.
  const mountStart = beatWindow('cost', 0, 4).inStart;
  const visibleRange = [manualWin.inStart, manualWin.inEnd, manualWin.outStart, manualWin.outEnd];

  const p0 = progress.get();
  const [visible, setVisible] = useState(() => interp(p0, visibleRange, [0, 1, 1, 0]));
  const [mounted, setMounted] = useState(
    () => p0 >= mountStart && p0 <= manualWin.outEnd,
  );

  useMotionValueEvent(progress, 'change', (p) => {
    setVisible(interp(p, visibleRange, [0, 1, 1, 0]));
    setMounted(p >= mountStart && p <= manualWin.outEnd);
  });

  if (!mounted) return null;

  return (
    <div className="exp-manual-effort" style={{ opacity: visible }} aria-hidden>
      <svg className="exp-manual-effort__bg" viewBox="0 0 520 340" role="presentation">
        {GEARS.map((g) => (
          <BgGear key={`${g.cx}-${g.cy}`} {...g} animate={!reduce} />
        ))}
      </svg>
    </div>
  );
}
