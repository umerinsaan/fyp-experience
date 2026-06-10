/**
 * ActCopy — lays out every act's typographic beats over the 3D stage. Each
 * beat owns a global-progress window, so only the relevant line is visible at
 * any scroll position. Alignment is chosen per act to avoid clashing with the
 * 3D set behind it (e.g. architecture/workflow text sits low-left).
 */
import type { MotionValue } from 'framer-motion';
import { ACTS, type ActId } from '@/experience/narrative';
import { beatWindow } from '@/experience/act-model';
import { CinematicBeat } from '@/experience/overlays/CinematicBeat';

/** Acts whose copy is rendered here. Hero (HeroTitle), Impact + Vision have
 * bespoke overlays. */
const ALIGN: Partial<Record<ActId, 'center' | 'bottom' | 'left' | 'top'>> = {
  problem: 'bottom',
  cost: 'center',
  objective: 'center',
  workflow: 'bottom',
  agent: 'bottom',
  jobs: 'top',
  pipeline: 'top',
  mitre: 'top',
  smart: 'top',
};

export function ActCopy({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="exp-overlay" aria-hidden>
      <div className="exp-overlay-inner">
        {ACTS.filter((a) => ALIGN[a.id]).map((act) =>
          act.beats.map((beat, i) => {
            // Sprawl headline is rendered centered inside ToolSprawlOverlay.
            if (act.id === 'problem' && i === 0) return null;
            const align =
              act.id === 'problem' && (i === 1 || i === 2) ? 'center' : ALIGN[act.id]!;
            return (
              <CinematicBeat
                key={`${act.id}-${i}`}
                progress={progress}
                beat={beat}
                win={beatWindow(act.id, i, act.beats.length)}
                align={align}
              />
            );
          }),
        )}
      </div>
    </div>
  );
}
