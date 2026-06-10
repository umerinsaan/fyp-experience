/**
 * Organic multi-ring layout for Act II — Platform at center, chips / tools /
 * formats on separate orbits with varied radii (not perfect circles).
 */
import type { FormatId } from '@/experience/ui/FormatIcon';
import type { ToolId } from '@/experience/ui/ToolIcon';
import { APPROACH_CHIPS, STITCH_TOOL_IDS } from '@/experience/sprawl-layout';

export const ORBIT_CENTER = { cx: 50, cy: 56 } as const;

export interface OrbitSlot {
  angleDeg: number;
  radiusPct: number;
  /** Elliptical squash — keeps orbits readable behind copy. */
  verticalScale: number;
  floatSec: number;
  floatDelay: number;
}

export interface ScatterPosition {
  top: string;
  left: string;
}

export function orbitPosition(slot: OrbitSlot): ScatterPosition {
  const rad = (slot.angleDeg * Math.PI) / 180;
  const x = ORBIT_CENTER.cx + Math.cos(rad) * slot.radiusPct;
  const y = ORBIT_CENTER.cy + Math.sin(rad) * slot.radiusPct * slot.verticalScale;
  return { top: `${y}%`, left: `${x}%` };
}

/** Percent coords for SVG viewBox (0–100). */
export function orbitPointPercent(slot: OrbitSlot): { x: number; y: number } {
  const rad = (slot.angleDeg * Math.PI) / 180;
  return {
    x: ORBIT_CENTER.cx + Math.cos(rad) * slot.radiusPct,
    y: ORBIT_CENTER.cy + Math.sin(rad) * slot.radiusPct * slot.verticalScale,
  };
}

export const ORBIT_HUB_POINT = { x: ORBIT_CENTER.cx, y: ORBIT_CENTER.cy } as const;

function angleDelta(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function nearestByAngle(sourceAngle: number, slots: readonly OrbitSlot[]): number {
  let best = 0;
  let bestDiff = Infinity;
  for (let i = 0; i < slots.length; i += 1) {
    const diff = angleDelta(sourceAngle, slots[i].angleDeg);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  }
  return best;
}

export function nearestToolForChip(chipIndex: number): number {
  const slot = ORBIT_CHIP_SLOTS[chipIndex] ?? ORBIT_CHIP_SLOTS[0];
  return nearestByAngle(slot.angleDeg, ORBIT_TOOL_SLOTS);
}

export function nearestFormatForTool(toolIndex: number): number {
  const slot = ORBIT_TOOL_SLOTS[toolIndex] ?? ORBIT_TOOL_SLOTS[0];
  return nearestByAngle(slot.angleDeg, ORBIT_FORMAT_SLOTS);
}

/** Slight curve so links feel organic, not rigid spokes. */
export function orbitCurvePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  bend = 0.22,
): string {
  const mx = (from.x + to.x) / 2 + bend * (to.y - from.y);
  const my = (from.y + to.y) / 2 - bend * (to.x - from.x);
  return `M ${from.x} ${from.y} Q ${mx} ${my} ${to.x} ${to.y}`;
}

/** Inner ring — Jobs, Pipelines, MITRE, Reports. */
export const ORBIT_CHIP_SLOTS: readonly OrbitSlot[] = [
  { angleDeg: -122, radiusPct: 17.8, verticalScale: 0.78, floatSec: 7.2, floatDelay: 0 },
  { angleDeg: -34, radiusPct: 15.4, verticalScale: 0.82, floatSec: 6.4, floatDelay: -1.1 },
  { angleDeg: 48, radiusPct: 18.6, verticalScale: 0.76, floatSec: 7.8, floatDelay: -2.3 },
  { angleDeg: 132, radiusPct: 16.2, verticalScale: 0.8, floatSec: 6.9, floatDelay: -0.6 },
];

/** Middle ring — pentest tool logos. */
export const ORBIT_TOOL_SLOTS: readonly OrbitSlot[] = [
  { angleDeg: -148, radiusPct: 26.4, verticalScale: 0.74, floatSec: 8.5, floatDelay: 0 },
  { angleDeg: -92, radiusPct: 29.8, verticalScale: 0.7, floatSec: 7.1, floatDelay: -1.4 },
  { angleDeg: -38, radiusPct: 27.2, verticalScale: 0.76, floatSec: 9.2, floatDelay: -2.8 },
  { angleDeg: 18, radiusPct: 31.4, verticalScale: 0.72, floatSec: 8.0, floatDelay: -0.9 },
  { angleDeg: 72, radiusPct: 28.6, verticalScale: 0.75, floatSec: 7.6, floatDelay: -2.1 },
  { angleDeg: 128, radiusPct: 30.2, verticalScale: 0.73, floatSec: 8.8, floatDelay: -1.7 },
  { angleDeg: 168, radiusPct: 25.8, verticalScale: 0.77, floatSec: 7.3, floatDelay: -3.2 },
];

/** Outer ring — report formats + file-type badges. */
export const ORBIT_FORMAT_FILE_IDS: readonly FormatId[] = ['xml', 'json', 'jsonl', 'csv', 'log', 'txt'];

export const ORBIT_FORMAT_SLOTS: readonly OrbitSlot[] = [
  { angleDeg: -156, radiusPct: 38.2, verticalScale: 0.68, floatSec: 9.5, floatDelay: 0 },
  { angleDeg: -108, radiusPct: 41.6, verticalScale: 0.65, floatSec: 8.7, floatDelay: -1.5 },
  { angleDeg: -58, radiusPct: 36.8, verticalScale: 0.7, floatSec: 10.1, floatDelay: -2.9 },
  { angleDeg: -8, radiusPct: 42.4, verticalScale: 0.64, floatSec: 9.0, floatDelay: -0.8 },
  { angleDeg: 38, radiusPct: 37.4, verticalScale: 0.69, floatSec: 8.3, floatDelay: -2.2 },
  { angleDeg: 88, radiusPct: 40.8, verticalScale: 0.66, floatSec: 9.8, floatDelay: -1.1 },
  { angleDeg: 138, radiusPct: 39.0, verticalScale: 0.67, floatSec: 8.5, floatDelay: -3.0 },
  { angleDeg: 168, radiusPct: 35.6, verticalScale: 0.71, floatSec: 9.2, floatDelay: -1.9 },
];

export const ORBIT_CHIPS = APPROACH_CHIPS;
export const ORBIT_TOOLS: readonly ToolId[] = STITCH_TOOL_IDS;

export function orbitChipPosition(index: number): ScatterPosition {
  return orbitPosition(ORBIT_CHIP_SLOTS[index] ?? ORBIT_CHIP_SLOTS[0]);
}

export function orbitToolPosition(index: number): ScatterPosition {
  return orbitPosition(ORBIT_TOOL_SLOTS[index] ?? ORBIT_TOOL_SLOTS[0]);
}

export function orbitFormatPosition(index: number): ScatterPosition {
  return orbitPosition(ORBIT_FORMAT_SLOTS[index] ?? ORBIT_FORMAT_SLOTS[0]);
}

export function orbitToolSlot(index: number): OrbitSlot {
  return ORBIT_TOOL_SLOTS[index] ?? ORBIT_TOOL_SLOTS[0];
}

export function orbitChipSlot(index: number): OrbitSlot {
  return ORBIT_CHIP_SLOTS[index] ?? ORBIT_CHIP_SLOTS[0];
}

export function orbitFormatSlot(index: number): OrbitSlot {
  return ORBIT_FORMAT_SLOTS[index] ?? ORBIT_FORMAT_SLOTS[0];
}
