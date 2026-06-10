/**
 * Pass 7 — presenter / deployment flags (Vite env).
 *
 * VITE_VIVA_CONTROLS=false  — hide demo chip + keyboard jumps (public deploy)
 * VITE_VIVA_LITE=true       — mid-tier GPU caps on viva laptop
 */
export const VIVA_CONTROLS_ENABLED = import.meta.env.VITE_VIVA_CONTROLS !== 'false';

export const VIVA_LITE_MODE = import.meta.env.VITE_VIVA_LITE === 'true';
