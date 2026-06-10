import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { FypLogo } from '@/components/brand/FypLogo';
import { usePreload } from '@/app/PreloadContext';
import { PROJECT_META } from '@/experience/narrative';

const FRAGMENTS = 14;

/** Elegant initialization milestones — premium, not a fake hacking screen. */
const DIAGNOSTICS: { at: number; label: string }[] = [
  { at: 0.08, label: 'Initializing session' },
  { at: 0.24, label: 'Loading typography' },
  { at: 0.5, label: 'Preparing 3D engine' },
  { at: 0.66, label: 'Compositing atmosphere' },
  { at: 0.82, label: 'Linking control plane → edge' },
  { at: 0.94, label: 'Calibrating camera' },
];

function BootScreen() {
  const { progress, skip } = usePreload();
  const reduceMotion = useReducedMotion();
  const pct = Math.round(progress * 100);
  const filled = Math.round(progress * FRAGMENTS);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="boot-title"
      aria-describedby="boot-status"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="boot-screen fixed inset-0 z-[100] flex items-center justify-center aurora-bg"
    >
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-50" aria-hidden />
      <div className="boot-mesh pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FypLogo size={44} showWordmark={false} />
        </motion.div>

        <h1 id="boot-title" className="sr-only">
          {PROJECT_META.title}
        </h1>

        <motion.p
          className="boot-wordmark mt-8"
          initial={reduceMotion ? false : { opacity: 0, filter: 'blur(10px)', y: 14 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden
        >
          Below the <span className="boot-wordmark__accent">Surface</span>
        </motion.p>

        <p className="boot-subtitle" aria-hidden>
          {PROJECT_META.title}
        </p>

        <div className="boot-fragments" aria-hidden>
          {Array.from({ length: FRAGMENTS }).map((_, i) => (
            <span key={i} className="boot-fragment" data-on={i < filled} />
          ))}
        </div>

        <div className="boot-bar" aria-hidden>
          <motion.div
            className="boot-bar__fill"
            animate={{ scaleX: progress }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            style={{ scaleX: progress }}
          />
        </div>

        <p id="boot-status" className="boot-pct">
          {pct}% · {PROJECT_META.group}
        </p>

        <div className="boot-diag" aria-hidden>
          {DIAGNOSTICS.map((d) => (
            <div key={d.label} className="boot-diag-line" data-on={progress >= d.at}>
              <span className="boot-diag-tick" />
              <span>{d.label}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={skip}
          className="boot-skip mt-9 rounded-md border border-border bg-surface px-5 py-2.5 font-medium text-text-secondary transition-colors hover:border-accent-cyan/40 hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          Skip intro
        </button>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Esc to skip</p>
      </div>
    </motion.div>
  );
}

export function PreloaderGate({ children }: { children: ReactNode }) {
  const { ready, canvasReady } = usePreload();
  const reduceMotion = useReducedMotion();
  const showExperience = ready && canvasReady;

  return (
    <>
      <div aria-hidden={!showExperience} style={{ visibility: showExperience ? 'visible' : 'hidden' }}>
        {children}
      </div>
      <AnimatePresence mode="wait">{!ready ? <BootScreen key="boot" /> : null}</AnimatePresence>
      {!ready && !reduceMotion ? (
        <span className="sr-only" aria-live="polite">
          Loading experience
        </span>
      ) : null}
    </>
  );
}
