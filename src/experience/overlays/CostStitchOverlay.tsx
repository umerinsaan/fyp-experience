/**
 * CostStitchOverlay — beat: "Hours go to stitching tools together — not to
 * finding risk." Faded tool logos linked by threads that stitch, fail, repeat;
 * a clock ticks in the background.
 */
import { useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState, type CSSProperties } from 'react';
import { beatWindow } from '@/experience/act-model';
import { ToolIcon, toolMeta, type ToolId } from '@/experience/ui/ToolIcon';
import { interp } from '@/story/scroll-math';

const TOOLS: ToolId[] = ['nmap', 'nuclei', 'zap', 'msfconsole', 'nikto', 'trivy', 'ffuf'];

/** Per-link timing — fixed offsets so links rarely sync (feels random, stays stable). */
const LINK_RHYTHM = [
  { delay: 0.1, duration: 3.4, rhythm: 'a' },
  { delay: 1.8, duration: 2.3, rhythm: 'b' },
  { delay: 0.6, duration: 4.2, rhythm: 'c' },
  { delay: 2.9, duration: 2.8, rhythm: 'a' },
  { delay: 1.2, duration: 3.9, rhythm: 'c' },
  { delay: 3.5, duration: 2.5, rhythm: 'b' },
] as const;

function WasteClock({ animate }: { animate: boolean }) {
  return (
    <svg className="exp-cost-stitch__clock" viewBox="0 0 120 120" aria-hidden>
      <circle className="exp-cost-stitch__clock-face" cx="60" cy="60" r="52" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const x1 = 60 + Math.cos(a) * 44;
        const y1 = 60 + Math.sin(a) * 44;
        const x2 = 60 + Math.cos(a) * 48;
        const y2 = 60 + Math.sin(a) * 48;
        return (
          <line
            key={i}
            className="exp-cost-stitch__clock-tick"
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
          />
        );
      })}
      <line className="exp-cost-stitch__clock-hand exp-cost-stitch__clock-hand--hour" x1="60" y1="60" x2="60" y2="34" />
      <g className="exp-cost-stitch__clock-hand exp-cost-stitch__clock-hand--minute">
        {animate ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="360 60 60"
            dur="8s"
            repeatCount="indefinite"
          />
        ) : null}
        <line x1="60" y1="60" x2="60" y2="24" />
      </g>
      <g className="exp-cost-stitch__clock-hand exp-cost-stitch__clock-hand--second">
        {animate ? (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 60 60"
            to="360 60 60"
            dur="2s"
            repeatCount="indefinite"
          />
        ) : null}
        <line x1="60" y1="60" x2="60" y2="18" />
      </g>
      <circle className="exp-cost-stitch__clock-cap" cx="60" cy="60" r="4" />
    </svg>
  );
}

function StitchLink({ index, animate }: { index: number; animate: boolean }) {
  const { delay, duration, rhythm } = LINK_RHYTHM[index % LINK_RHYTHM.length];
  const style = animate
    ? ({
        '--stitch-delay': `${delay}s`,
        '--stitch-dur': `${duration}s`,
      } as CSSProperties)
    : undefined;

  return (
    <div
      className={`exp-cost-stitch__link${animate ? ` exp-cost-stitch__link--cycle exp-cost-stitch__link--${rhythm}` : ''}`}
      style={style}
      aria-hidden
    >
      <span className="exp-cost-stitch__thread exp-cost-stitch__thread--ok" />
      <span className="exp-cost-stitch__thread exp-cost-stitch__thread--fail" />
      <span className="exp-cost-stitch__fail-mark">×</span>
    </div>
  );
}

export function CostStitchOverlay({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const stitchWin = beatWindow('cost', 2, 4);
  const mountStart = beatWindow('cost', 1, 4).outStart;
  const visibleRange = [stitchWin.inStart, stitchWin.inEnd, stitchWin.outStart, stitchWin.outEnd];

  const p0 = progress.get();
  const [visible, setVisible] = useState(() => interp(p0, visibleRange, [0, 1, 1, 0]));
  const [mounted, setMounted] = useState(
    () => p0 >= mountStart && p0 <= stitchWin.outEnd,
  );

  useMotionValueEvent(progress, 'change', (p) => {
    setVisible(interp(p, visibleRange, [0, 1, 1, 0]));
    setMounted(p >= mountStart && p <= stitchWin.outEnd);
  });

  if (!mounted) return null;

  const animate = !reduce;

  return (
    <div className="exp-cost-stitch" style={{ opacity: visible }} aria-hidden>
      <div className="exp-cost-stitch__stack">
        <div className="exp-cost-stitch__clock-wrap">
          <WasteClock animate={animate} />
        </div>
        <div className="exp-cost-stitch__text-gap" />
        <div className="exp-cost-stitch__chain">
        {TOOLS.map((id, i) => {
          const meta = toolMeta(id);
          return (
            <div key={id} className="exp-cost-stitch__unit">
              <div
                className="exp-cost-stitch__tool"
                style={{ '--tool-color': meta.color } as CSSProperties}
              >
                <span className="exp-cost-stitch__tool-icon">
                  <ToolIcon id={id} size={28} />
                </span>
              </div>
              {i < TOOLS.length - 1 ? <StitchLink index={i} animate={animate} /> : null}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
