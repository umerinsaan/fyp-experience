/**
 * HeroTitle — project identity on load. Mount stagger only; scroll fades it out
 * with opacity (no competing Y/scale transforms).
 */
import { motion, useMotionValueEvent, useReducedMotion, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { actWindowById } from '@/experience/act-model';
import { usePreload } from '@/app/PreloadContext';
import { ACCENTS } from '@/experience/narrative';
import { PROJECT } from '@/content/project';
import { TITLE_ANCHOR } from '@/content/chapter-pentest';
import { interp } from '@/story/scroll-math';

function TitleLine({ line, revealed, baseDelay }: { line: string; revealed: boolean; baseDelay: number }) {
  const anchorIndex = line.indexOf(TITLE_ANCHOR);
  const segments =
    anchorIndex >= 0
      ? [
          { text: line.slice(0, anchorIndex), accent: false },
          { text: TITLE_ANCHOR, accent: true },
          { text: line.slice(anchorIndex + TITLE_ANCHOR.length), accent: false },
        ].filter((s) => s.text.length > 0)
      : [{ text: line, accent: false }];

  let wordCounter = 0;

  return (
    <span className="exp-herotitle__title-line">
      {segments.map((seg, si) => {
        const words = seg.text.trim().split(/\s+/);
        return (
          <span key={si} className={seg.accent ? 'exp-herotitle__anchor' : undefined}>
            {words.map((w) => {
              const delay = baseDelay + wordCounter * 0.07;
              wordCounter += 1;
              return (
                <motion.span
                  key={`${w}-${delay}`}
                  className="exp-herotitle__word"
                  initial={{ opacity: 0 }}
                  animate={revealed ? { opacity: 1 } : { opacity: 0 }}
                  transition={{ delay, duration: 0.5, ease: 'easeOut' }}
                >
                  {w}
                </motion.span>
              );
            })}
          </span>
        );
      })}
    </span>
  );
}

export function HeroTitle({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion();
  const { revealed } = usePreload();
  const { start, end } = actWindowById('hero');
  const span = end - start;
  const [opacity, setOpacity] = useState(1);

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, [start, start + span * 0.55, start + span * 0.8], [1, 1, 0]));
  });

  if (opacity < 0.02) return null;

  return (
    <div
      className="exp-herotitle"
      style={{ opacity, transition: reduce ? 'none' : 'opacity 0.15s linear' }}
      aria-hidden
    >
      <motion.span
        className="exp-herotitle__eyebrow"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        Platform Briefing
      </motion.span>

      <h1 className="exp-herotitle__title">
        {PROJECT.titleLines.map((line, i) => (
          <TitleLine key={line} line={line} revealed={revealed} baseDelay={0.2 + i * 0.25} />
        ))}
      </h1>

      <motion.div
        className="exp-herotitle__meta"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <span className="exp-herotitle__meta-accent">{PROJECT.group}</span>
        <span>Final Year Project</span>
      </motion.div>

      <motion.div
        className="exp-herotitle__team"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.85, duration: 0.55 }}
      >
        {PROJECT.members.map((member, i) => (
          <span key={member.id} className="exp-herotitle__member-wrap">
            {i > 0 ? <span className="exp-herotitle__member-sep" aria-hidden>·</span> : null}
            <span className="exp-herotitle__member" style={{ color: ACCENTS[member.accent] }}>
              {member.name}
              <span className="exp-herotitle__member-id">{member.id}</span>
            </span>
          </span>
        ))}
      </motion.div>

      <motion.div
        className="exp-herotitle__advisors"
        initial={{ opacity: 0 }}
        animate={revealed ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.95, duration: 0.55 }}
      >
        <div className="exp-herotitle__advisor-card">
          <span className="exp-herotitle__advisor-label">Supervisor</span>
          <span className="exp-herotitle__advisor-name">{PROJECT.supervisor.name}</span>
          <span className="exp-herotitle__advisor-role">{PROJECT.supervisor.role}</span>
        </div>
        <div className="exp-herotitle__advisor-card">
          <span className="exp-herotitle__advisor-label">Co-Supervisor</span>
          <span className="exp-herotitle__advisor-name">{PROJECT.coSupervisor.name}</span>
          <span className="exp-herotitle__advisor-role">{PROJECT.coSupervisor.role}</span>
        </div>
      </motion.div>
    </div>
  );
}
