/**
 * Shared scatter + hub positions — Problem sprawl and Objective convergence
 * use the same coordinates so viewers recognize badges coming back together.
 */
import { formatScatterPosition } from '@/experience/problem-phases';
import { FORMAT_IDS, type FormatId } from '@/experience/ui/FormatIcon';
import { TOOL_IDS, type ToolId } from '@/experience/ui/ToolIcon';

export interface ScatterPosition {
  top: string;
  left: string;
}

/** Same scatter positions as ToolSprawlOverlay. */
export const TOOL_SPRAWL_POSITIONS: Record<ToolId, ScatterPosition> = {
  zap: { top: '18%', left: '80%' },
  msfconsole: { top: '30%', left: '16%' },
  trivy: { top: '13%', left: '46%' },
  nmap: { top: '23%', left: '28%' },
  nuclei: { top: '12%', left: '65%' },
  netexec: { top: '41%', left: '32%' },
  nikto: { top: '33%', left: '71%' },
  hydra: { top: '49%', left: '84%' },
  masscan: { top: '59%', left: '17%' },
  ffuf: { top: '67%', left: '40%' },
  lynis: { top: '71%', left: '75%' },
  sslscan: { top: '77%', left: '30%' },
  airodump: { top: '63%', left: '60%' },
};

/** Tools used in Cost stitch row — Objective resolves this chain. */
export const STITCH_TOOL_IDS: readonly ToolId[] = [
  'nmap',
  'nuclei',
  'zap',
  'msfconsole',
  'nikto',
  'trivy',
  'ffuf',
];

/** Horizontal chain row — centered below hero copy on "So we built one." */
export function stitchChainPosition(index: number, count: number): ScatterPosition {
  const left = 10 + (index / Math.max(count - 1, 1)) * 80;
  return { top: '74%', left: `${left}%` };
}

/** Formats merge target — below the stitched chain. */
export const UNIFIED_PANEL_POS: ScatterPosition = { top: '84%', left: '50%' };

/** Edge drift targets during human beats — slightly inward from sprawl. */
export function toolDriftPosition(id: ToolId, drift: number): ScatterPosition {
  const base = TOOL_SPRAWL_POSITIONS[id];
  const topN = parseFloat(base.top);
  const leftN = parseFloat(base.left);
  const cx = 50;
  const cy = 50;
  const t = topN + (cy - topN) * drift * 0.35;
  const l = leftN + (cx - leftN) * drift * 0.35;
  return { top: `${t}%`, left: `${l}%` };
}

export function formatScatterPos(index: number): ScatterPosition {
  return formatScatterPosition(index, FORMAT_IDS.length);
}

export interface SamplePanel {
  format: FormatId;
  slot: 'tl' | 'tr' | 'bl' | 'br';
  lines: string[];
}

export const SAMPLE_PANELS: readonly SamplePanel[] = [
  {
    format: 'xml',
    slot: 'tl',
    lines: [
      '<host>',
      '  <port protocol="tcp" portid="443">',
      '    <state state="open"/>',
      '  </port>',
      '</host>',
    ],
  },
  {
    format: 'jsonl',
    slot: 'tr',
    lines: [
      '{"severity":"critical",',
      ' "template":"CVE-2021-44228",',
      ' "matched-at":"10.0.0.5"}',
    ],
  },
  {
    format: 'csv',
    slot: 'bl',
    lines: ['host,port,service,state', '10.0.0.5,443,https,open', '10.0.0.5,22,ssh,open'],
  },
  {
    format: 'log',
    slot: 'br',
    lines: [
      '[WARN] 09:14:02 brute force attempt',
      '[INFO] 09:14:05 login success uid=0',
      '[ERR]  09:14:11 privilege escalation',
    ],
  },
];

const SAMPLE_SLOT_POS: Record<SamplePanel['slot'], ScatterPosition> = {
  tl: { top: '14%', left: '12%' },
  tr: { top: '14%', left: '72%' },
  bl: { top: '58%', left: '10%' },
  br: { top: '58%', left: '74%' },
};

export function sampleScatterPosition(slot: SamplePanel['slot']): ScatterPosition {
  return SAMPLE_SLOT_POS[slot];
}

/** Hub position for approach overlay. */
export const PLATFORM_HUB_POS: ScatterPosition = { top: '58%', left: '50%' };

export const APPROACH_CHIPS = [
  { id: 'jobs', label: 'Jobs', accent: 'purple' as const },
  { id: 'pipelines', label: 'Pipelines', accent: 'cyan' as const },
  { id: 'mitre', label: 'MITRE', accent: 'magenta' as const },
  { id: 'reports', label: 'Reports', accent: 'mint' as const },
] as const;

export function approachChipPosition(index: number): ScatterPosition {
  const angles = [-135, -45, 45, 135];
  const a = (angles[index] * Math.PI) / 180;
  const cx = 50;
  const cy = 58;
  const r = 22;
  return {
    top: `${cy + Math.sin(a) * r}%`,
    left: `${cx + Math.cos(a) * r}%`,
  };
}

/** Parse percent string to number for lerp. */
export function parsePercent(v: string): number {
  return parseFloat(v);
}

export function lerpPos(from: ScatterPosition, to: ScatterPosition, t: number): ScatterPosition {
  return {
    top: `${parsePercent(from.top) + (parsePercent(to.top) - parsePercent(from.top)) * t}%`,
    left: `${parsePercent(from.left) + (parsePercent(to.left) - parsePercent(from.left)) * t}%`,
  };
}

/** Edge tools shown during human overlay — subset keeps screen readable. */
export const EDGE_TOOL_IDS: readonly ToolId[] = TOOL_IDS.filter(
  (_, i) => i % 2 === 0,
);
