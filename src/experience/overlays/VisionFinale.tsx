/**
 * VisionFinale — Act V closing. Opacity crossfade only; calm and stable.
 */
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import { useState } from 'react';
import { FypLogo } from '@/components/brand/FypLogo';
import { actWindowById } from '@/experience/act-model';
import { ACCENTS, ACTS, PROJECT_META } from '@/experience/narrative';
import { PROJECT } from '@/content/project';
import { interp } from '@/story/scroll-math';

const visionAct = ACTS.find((a) => a.id === 'vision')!;
const headline = visionAct.beats[0];

export function VisionFinale({ progress }: { progress: MotionValue<number> }) {
  const { start, end } = actWindowById('vision');
  const span = end - start;
  const [opacity, setOpacity] = useState(0);
  const [creditsOpacity, setCreditsOpacity] = useState(0);

  useMotionValueEvent(progress, 'change', (p) => {
    setOpacity(interp(p, [start, start + span * 0.25], [0, 1]));
    setCreditsOpacity(interp(p, [start + span * 0.4, start + span * 0.7], [0, 1]));
  });

  if (opacity < 0.02 && creditsOpacity < 0.02) return null;

  const [before, after] = headline.accentText
    ? headline.text.split(headline.accentText)
    : [headline.text, ''];

  return (
    <div className="exp-finale" style={{ opacity }} aria-hidden>
      <div className="exp-finale__glow" />
      <div>
        <div className="exp-finale__logo">
          <FypLogo size={56} showWordmark={false} />
        </div>
        <span className="exp-kicker" style={{ textAlign: 'center', display: 'block' }}>
          {headline.kicker}
        </span>
        <p className="exp-line exp-line--hero" style={{ textAlign: 'center' }}>
          {before}
          {headline.accentText ? <span className="exp-accent">{headline.accentText}</span> : null}
          {after}
        </p>
      </div>

      <div className="exp-finale__credits" style={{ opacity: creditsOpacity }}>
        <p className="exp-finale__group">{PROJECT_META.group} · Final Year Project</p>
        <p className="exp-finale__title">{PROJECT_META.title}</p>
        <div className="exp-finale__team">
          {PROJECT.members.map((m) => (
            <span key={m.id} className="exp-finale__member">
              <span className="exp-finale__member-dot" style={{ color: ACCENTS[m.accent] }} />
              {m.name}
              <span className="exp-finale__member-id">{m.id}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
