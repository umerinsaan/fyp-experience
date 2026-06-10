/**
 * Act I (problem) — scroll-phase timing as fractions of the problem act span.
 * Single source of truth so tool sprawl, format chaos, copy beats, and report
 * stay in lockstep.
 */
import { FORMAT_IDS } from '@/experience/ui/FormatIcon';
import { TOOL_IDS } from '@/experience/ui/ToolIcon';

const TOOL_COUNT = TOOL_IDS.length;
const FORMAT_COUNT = FORMAT_IDS.length;
const SAMPLE_COUNT = 4;

/** First tool badge begins fading in. */
export const SPRAWL_TOOL_START = 0.12;
export const SPRAWL_TOOL_STAGGER = 0.02;
export const SPRAWL_TOOL_FADE = 0.045;

export const SPRAWL_ALL_VISIBLE =
  SPRAWL_TOOL_START + (TOOL_COUNT - 1) * SPRAWL_TOOL_STAGGER + SPRAWL_TOOL_FADE;

export const SPRAWL_HOLD = 0.08;

export const CHAOS_START = SPRAWL_ALL_VISIBLE + SPRAWL_HOLD;

export const SPRAWL_HEADLINE_IN = 0.14;
/** Headline + tool badges exit together. */
export const SPRAWL_HEADLINE_OUT_START = CHAOS_START - 0.05;
export const SPRAWL_HEADLINE_OUT = CHAOS_START - 0.01;
export const SPRAWL_EXIT_START = SPRAWL_HEADLINE_OUT_START;
export const SPRAWL_EXIT_END = SPRAWL_HEADLINE_OUT;

/** Brief gap after sprawl clears, then format-chaos copy + format badges together. */
export const CHAOS_COPY_GAP = 0.04;
export const CHAOS_COPY_IN = CHAOS_START + CHAOS_COPY_GAP;
export const CHAOS_COPY_FADE = 0.05;

/** Format badges appear in sync with the format-chaos copy line. */
export const CHAOS_FORMATS_START = CHAOS_COPY_IN;
export const CHAOS_FORMAT_STAGGER = 0.013;
export const CHAOS_FORMAT_FADE = 0.032;

export const CHAOS_FORMATS_COMPLETE =
  CHAOS_FORMATS_START + (FORMAT_COUNT - 1) * CHAOS_FORMAT_STAGGER + CHAOS_FORMAT_FADE;

/** "Some tools speak…" copy + scattered formats — hold before sample cards. */
export const CHAOS_FORMATS_PHASE_END = CHAOS_COPY_IN + 0.2;
export const CHAOS_COPY_OUT = CHAOS_FORMATS_PHASE_END - 0.04;

/** Sample output structure cards. */
export const CHAOS_SAMPLES_START = CHAOS_FORMATS_PHASE_END;
export const CHAOS_SAMPLE_STAGGER = 0.038;
export const CHAOS_SAMPLE_FADE = 0.038;

export const CHAOS_SAMPLES_COMPLETE =
  CHAOS_SAMPLES_START + (SAMPLE_COUNT - 1) * CHAOS_SAMPLE_STAGGER + CHAOS_SAMPLE_FADE;

/** "Nothing shares a structure" copy + sample cards — hold before report. */
export const CHAOS_SAMPLES_PHASE_END = CHAOS_SAMPLES_COMPLETE + 0.09;
export const CHAOS_STRUCTURE_COPY_IN = CHAOS_SAMPLES_START;
export const CHAOS_STRUCTURE_COPY_OUT = CHAOS_SAMPLES_PHASE_END - 0.04;

export const CHAOS_END = CHAOS_SAMPLES_PHASE_END;

export const REPORT_START = CHAOS_END + 0.012;

export function sprawlToolInAt(index: number): number {
  return SPRAWL_TOOL_START + index * SPRAWL_TOOL_STAGGER;
}

export function chaosFormatInAt(index: number): number {
  return CHAOS_FORMATS_START + index * CHAOS_FORMAT_STAGGER;
}

export function chaosSampleInAt(index: number): number {
  return CHAOS_SAMPLES_START + index * CHAOS_SAMPLE_STAGGER;
}

/** Elliptical ring around center — fills top and bottom, center kept clear for copy. */
export function formatScatterPosition(
  index: number,
  count: number,
): { top: string; left: string } {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2 + 0.12;
  const cx = 50;
  const cy = 54;
  const rx = 35;
  const ry = 40;
  return {
    top: `${cy + Math.sin(angle) * ry}%`,
    left: `${cx + Math.cos(angle) * rx}%`,
  };
}
