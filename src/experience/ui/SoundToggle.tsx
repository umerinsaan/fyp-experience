/**
 * SoundToggle — opt-in ambient audio. Off by default (autoplay policies +
 * presenter control). Enabling starts the synthesized bed; act changes shift
 * the tone and fire a whoosh, and landmark beats chime.
 */
import { useEffect, useRef, useState } from 'react';
import { useExperience } from '@/experience/ExperienceContext';
import { getFypAudio } from '@/experience/audio/audio-engine';

export function SoundToggle() {
  const { actIndex } = useExperience();
  const engineRef = useRef(getFypAudio());
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const engine = engineRef.current;
    return () => engine?.stop();
  }, []);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !enabled || !engine.isRunning) return;
    engine.transition(actIndex);
  }, [actIndex, enabled]);

  const toggle = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (enabled) {
      engine.stop();
      setEnabled(false);
    } else {
      engine.start();
      engine.transition(actIndex);
      setEnabled(true);
    }
  };

  return (
    <button
      type="button"
      className="exp-sound"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute ambient sound' : 'Enable ambient sound'}
      title={enabled ? 'Sound on' : 'Sound off'}
    >
      <span className="exp-sound__icon" aria-hidden>
        {enabled ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
            <path d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
            <path d="m16 9 5 6m0-6-5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="exp-sound__label">{enabled ? 'Sound on' : 'Sound'}</span>
    </button>
  );
}
