/**
 * Pass 6–8 — presenter demo bookmarks + act highlight targets.
 * Progress fractions are derived from act windows so pacing edits stay in sync.
 */
import { actJumpProgress } from '@/experience/act-navigation';
import { actWindowById } from '@/experience/act-model';
import { ACTS, type ActId } from '@/experience/narrative';
import { clamp01 } from '@/story/scroll-math';

export type VivaBookmarkId =
  | 'arch-wide'
  | 'arch-channel'
  | 'workflow-lock'
  | 'agent-open'
  | 'jobs-resolve'
  | 'pipeline-fork'
  | 'mitre-rank'
  | 'smart-fire'
  | 'impact';

export interface VivaBookmark {
  id: VivaBookmarkId;
  label: string;
  /** Shown in HUD, e.g. Alt+1 */
  shortcut: string;
  /** Global scroll progress 0..1 */
  progress: number;
}

function actPoint(actId: Parameters<typeof actWindowById>[0], local: number): number {
  const w = actWindowById(actId);
  return w.start + (w.end - w.start) * clamp01(local);
}

/** Precomputed bookmark targets — call after module load (weights stable at runtime). */
export function getVivaBookmarks(): readonly VivaBookmark[] {
  return [
    {
      id: 'arch-wide',
      label: 'Architecture — wide ecosystem',
      shortcut: 'Alt+1',
      progress: actPoint('architecture', 0.75),
    },
    {
      id: 'arch-channel',
      label: 'Architecture — Agent Channel',
      shortcut: 'Alt+2',
      progress: actPoint('architecture', 0.43),
    },
    {
      id: 'workflow-lock',
      label: 'Workflow — ring complete',
      shortcut: 'Alt+3',
      progress: actPoint('workflow', 0.99),
    },
    {
      id: 'agent-open',
      label: 'Agent — edge intelligence',
      shortcut: 'Alt+4',
      progress: actPoint('agent', 0.12),
    },
    {
      id: 'jobs-resolve',
      label: 'Jobs — schema to argv',
      shortcut: 'Alt+5',
      progress: actPoint('jobs', 0.7),
    },
    {
      id: 'pipeline-fork',
      label: 'Pipeline — fork & join',
      shortcut: 'Alt+6',
      progress: actPoint('pipeline', 0.65),
    },
    {
      id: 'mitre-rank',
      label: 'MITRE — mapped & ranked',
      shortcut: 'Alt+7',
      progress: actPoint('mitre', 0.78),
    },
    {
      id: 'smart-fire',
      label: 'Smart — rule fires',
      shortcut: 'Alt+8',
      progress: actPoint('smart', 0.6),
    },
    {
      id: 'impact',
      label: 'Impact — outcomes',
      shortcut: 'Alt+9',
      progress: actPoint('impact', 0.4),
    },
  ] as const;
}

export function vivaBookmarkByDigit(digit: number): VivaBookmark | null {
  if (digit < 1 || digit > 9) return null;
  return getVivaBookmarks()[digit - 1] ?? null;
}

/** Pass 8 — double-click chapter rail → best demo moment per act. */
const ACT_HIGHLIGHT_BOOKMARK: Partial<Record<ActId, VivaBookmarkId>> = {
  architecture: 'arch-wide',
  workflow: 'workflow-lock',
  agent: 'agent-open',
  jobs: 'jobs-resolve',
  pipeline: 'pipeline-fork',
  mitre: 'mitre-rank',
  smart: 'smart-fire',
  impact: 'impact',
};

export function actHighlightProgress(actId: ActId): number {
  const bookmarkId = ACT_HIGHLIGHT_BOOKMARK[actId];
  if (bookmarkId) {
    const hit = getVivaBookmarks().find((b) => b.id === bookmarkId);
    if (hit) return hit.progress;
  }
  return actJumpProgress(actId, 0.45);
}

export function actHighlightLabel(actId: ActId): string {
  const bookmarkId = ACT_HIGHLIGHT_BOOKMARK[actId];
  if (bookmarkId) {
    const hit = getVivaBookmarks().find((b) => b.id === bookmarkId);
    if (hit) return hit.label;
  }
  const name = ACTS.find((a) => a.id === actId)?.name ?? actId;
  return `${name} — mid`;
}
