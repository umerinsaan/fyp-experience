/**
 * Pass 8 — one-shot readiness check after boot (console + optional toast).
 */
import { useEffect, useRef } from 'react';
import { usePreload } from '@/app/PreloadContext';
import { showVivaToast } from '@/experience/viva/viva-toast';
import { VIVA_CONTROLS_ENABLED } from '@/experience/viva/viva-config';
import { FONT_DISPLAY_3D } from '@/content/asset-manifest';

async function waitForCanvas(timeoutMs = 8000): Promise<HTMLCanvasElement | null> {
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    const canvas = document.querySelector<HTMLCanvasElement>('.exp-stage canvas, canvas.exp-canvas');
    if (canvas) return canvas;
    await new Promise((r) => window.setTimeout(r, 50));
  }
  return document.querySelector<HTMLCanvasElement>('.exp-stage canvas, canvas.exp-canvas');
}

async function runChecks(): Promise<{ ok: boolean; lines: string[] }> {
  const lines: string[] = [];
  let ok = true;

  const canvas = await waitForCanvas();
  if (!canvas) {
    ok = false;
    lines.push('WebGL canvas not mounted');
  } else {
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) {
      ok = false;
      lines.push('WebGL context unavailable');
    } else {
      lines.push('WebGL context OK');
    }
  }

  try {
    const res = await fetch(FONT_DISPLAY_3D, { method: 'HEAD' });
    if (!res.ok) {
      ok = false;
      lines.push(`Local font missing (${FONT_DISPLAY_3D})`);
    } else {
      lines.push('Local 3D font OK');
    }
  } catch {
    ok = false;
    lines.push('Local font fetch failed');
  }

  if (typeof window !== 'undefined' && window.innerWidth < 1280) {
    lines.push('Viewport < 1280px — projector layout not primary');
  } else {
    lines.push('Viewport OK for desktop/projector');
  }

  return { ok, lines };
}

export function VivaShipCheck() {
  const { ready, canvasReady } = usePreload();
  const ran = useRef(false);

  useEffect(() => {
    if (!ready || !canvasReady || ran.current) return;
    ran.current = true;

    void runChecks().then(({ ok, lines }) => {
      const tag = '[fyp-viva]';
      if (ok) {
        console.info(`${tag} Ship check passed\n  · ${lines.join('\n  · ')}`);
        if (VIVA_CONTROLS_ENABLED) showVivaToast('Ready for viva');
      } else {
        console.warn(`${tag} Ship check issues\n  · ${lines.join('\n  · ')}`);
        if (VIVA_CONTROLS_ENABLED) showVivaToast('Check console — ship warnings');
      }
    });
  }, [ready, canvasReady]);

  return null;
}
