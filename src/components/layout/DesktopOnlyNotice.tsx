import { useEffect, useState } from 'react';
import { VIEWPORT } from '@/content/asset-manifest';

export function DesktopOnlyNotice() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${VIEWPORT.mobileMax}px)`);
    const update = () => setBlocked(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!blocked) return null;

  return (
    <div
      role="alert"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-bg px-8 text-center"
    >
      <div className="max-w-md rounded-2xl border border-border bg-surface p-10 shadow-lg">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent-cyan">
          Desktop experience
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-text">
          Best viewed on a laptop or projector
        </h1>
        <p className="mt-4 text-base leading-relaxed text-text-secondary">
          This briefing is designed for desktop and laptop screens (1280px and wider). Please open
          on a computer for the full experience.
        </p>
      </div>
    </div>
  );
}
