/**
 * FormatIcon — file-extension marks for the format-chaos phase. Uses
 * react-icons/bs file glyphs (already installed) with per-format colors.
 */
import type { IconType } from 'react-icons';
import {
  BsFillFileEarmarkCodeFill,
  BsFillFileEarmarkSpreadsheetFill,
  BsFillFileEarmarkTextFill,
  BsFillFileEarmarkFill,
} from 'react-icons/bs';

export type FormatId = 'xml' | 'jsonl' | 'json' | 'txt' | 'dat' | 'log' | 'csv';

export const FORMAT_IDS: readonly FormatId[] = [
  'xml',
  'jsonl',
  'json',
  'txt',
  'dat',
  'log',
  'csv',
] as const;

interface FormatMeta {
  label: string;
  color: string;
  Icon: IconType;
}

const REGISTRY: Record<FormatId, FormatMeta> = {
  xml: { label: '.xml', color: '#E67E22', Icon: BsFillFileEarmarkCodeFill },
  jsonl: { label: '.jsonl', color: '#2ECC71', Icon: BsFillFileEarmarkCodeFill },
  json: { label: '.json', color: '#3498DB', Icon: BsFillFileEarmarkCodeFill },
  txt: { label: '.txt', color: '#64748B', Icon: BsFillFileEarmarkTextFill },
  dat: { label: '.dat', color: '#9B59B6', Icon: BsFillFileEarmarkFill },
  log: { label: '.log', color: '#D97706', Icon: BsFillFileEarmarkTextFill },
  csv: { label: '.csv', color: '#16A34A', Icon: BsFillFileEarmarkSpreadsheetFill },
};

export function formatMeta(id: FormatId): FormatMeta {
  return REGISTRY[id];
}

export function FormatIcon({ id, size = 28 }: { id: FormatId; size?: number }) {
  const meta = REGISTRY[id];
  const Icon = meta.Icon;
  return <Icon size={size} color={meta.color} aria-hidden />;
}
