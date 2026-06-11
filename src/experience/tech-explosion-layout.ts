/**
 * Scatter positions for the technologies explosion — polar ring around
 * viewport center (50%, 50%), keeping the headline band readable.
 */
import { TECHNOLOGIES } from '@/experience/narrative';

export interface TechScatterPosition {
  top: string;
  left: string;
}

/** Polar scatter from viewport center — even radius on both axes. */
function techScatterPosition(index: number, total: number): TechScatterPosition {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  const ring = 0.24 + (index % 3) * 0.045;
  const cx = 50 + Math.cos(angle) * ring * 100;
  const cy = 50 + Math.sin(angle) * ring * 100;
  const top = Math.min(80, Math.max(16, cy));
  const left = Math.min(84, Math.max(16, cx));
  return { top: `${top}%`, left: `${left}%` };
}

export const TECH_EXPLOSION_POSITIONS: Record<string, TechScatterPosition> = Object.fromEntries(
  TECHNOLOGIES.map((entry, i) => [entry.key, techScatterPosition(i, TECHNOLOGIES.length)]),
);

export const TECH_CENTER: TechScatterPosition = { top: '50%', left: '50%' };
