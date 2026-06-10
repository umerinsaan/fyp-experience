/**
 * Pass 6–7 — demo jumps, toast bus, presenter hint overlay.
 */
import { useEffect, useRef, useState } from 'react';
import { useExperience } from '@/experience/ExperienceContext';
import { getVivaBookmarks, vivaBookmarkByDigit } from '@/experience/viva-demo';
import { VIVA_CONTROLS_ENABLED } from '@/experience/viva/viva-config';
import { setVivaToastHandler } from '@/experience/viva/viva-toast';

const TOAST_MS = 2400;

export function VivaDemoDriver() {
  const { scrollToProgress } = useExperience();
  const [toast, setToast] = useState<string | null>(null);
  const [hintOpen, setHintOpen] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setVivaToastHandler((label) => {
      setToast(label);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setToast(null), TOAST_MS);
    });
    return () => setVivaToastHandler(null);
  }, []);

  useEffect(() => {
    if (!VIVA_CONTROLS_ENABLED) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?' && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setHintOpen((v) => !v);
        return;
      }

      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const digit = Number(e.key);
      if (!Number.isInteger(digit) || digit < 1 || digit > 9) return;

      e.preventDefault();
      const bookmark = vivaBookmarkByDigit(digit);
      if (!bookmark) return;
      scrollToProgress(bookmark.progress);
      setToast(bookmark.label);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setToast(null), TOAST_MS);
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [scrollToProgress]);

  const bookmarks = getVivaBookmarks();

  return (
    <>
      {toast ? (
        <div className="exp-viva-toast" role="status" aria-live="polite">
          {toast}
        </div>
      ) : null}
      {VIVA_CONTROLS_ENABLED && hintOpen ? (
        <div className="exp-viva-hint" role="dialog" aria-label="Demo shortcuts">
          <p className="exp-viva-hint__title">Viva demo jumps</p>
          <ul className="exp-viva-hint__list">
            {bookmarks.map((b) => (
              <li key={b.id}>
                <kbd>{b.shortcut}</kbd> {b.label}
              </li>
            ))}
          </ul>
          <p className="exp-viva-hint__foot">
            Keys: ↑↓/Space scroll · PgUp/PgDn page · 1–9 jump · Home/End · Alt+1–9 demo
          </p>
          <p className="exp-viva-hint__foot">
            Rail: click = act open · double-click = highlight · Press ? to close
          </p>
        </div>
      ) : null}
    </>
  );
}
