/**
 * ToolIcon — renders a recognizable mark for each pentest tool used in the
 * Tool Sprawl phase of Act I. Mirrors the TechLogo.tsx pattern: a few tools
 * have real Simple Icons marks; the rest get simple, original representative
 * glyphs in a distinct brand-ish color so the sprawl reads as many different,
 * unrelated tools.
 *
 * No new packages — `react-icons/si` is already used by TechLogo.tsx.
 */
import type { IconType } from 'react-icons';
import { SiMetasploit, SiTrivy, SiZap } from 'react-icons/si';

export type ToolId =
  | 'nmap'
  | 'nuclei'
  | 'netexec'
  | 'zap'
  | 'msfconsole'
  | 'nikto'
  | 'hydra'
  | 'masscan'
  | 'ffuf'
  | 'lynis'
  | 'trivy'
  | 'sslscan'
  | 'airodump';

type Glyph =
  | 'nmap'
  | 'nuclei'
  | 'netexec'
  | 'nikto'
  | 'hydra'
  | 'masscan'
  | 'ffuf'
  | 'lynis'
  | 'sslscan'
  | 'airodump';

interface ToolMeta {
  label: string;
  color: string;
  Icon?: IconType;
  glyph?: Glyph;
}

const REGISTRY: Record<ToolId, ToolMeta> = {
  zap: { label: 'OWASP ZAP', color: '#00549E', Icon: SiZap },
  msfconsole: { label: 'msfconsole', color: '#2596CD', Icon: SiMetasploit },
  trivy: { label: 'Trivy', color: '#1904DA', Icon: SiTrivy },
  nmap: { label: 'nmap', color: '#4A90D9', glyph: 'nmap' },
  nuclei: { label: 'Nuclei', color: '#F26522', glyph: 'nuclei' },
  netexec: { label: 'NetExec', color: '#7C3AED', glyph: 'netexec' },
  nikto: { label: 'Nikto', color: '#E11D48', glyph: 'nikto' },
  hydra: { label: 'Hydra', color: '#059669', glyph: 'hydra' },
  masscan: { label: 'masscan', color: '#D97706', glyph: 'masscan' },
  ffuf: { label: 'ffuf', color: '#DC2626', glyph: 'ffuf' },
  lynis: { label: 'Lynis', color: '#0891B2', glyph: 'lynis' },
  sslscan: { label: 'sslscan', color: '#6D28D9', glyph: 'sslscan' },
  airodump: { label: 'airodump-ng', color: '#0D9488', glyph: 'airodump' },
};

export function toolMeta(id: ToolId): ToolMeta {
  return REGISTRY[id];
}

export const TOOL_IDS = Object.keys(REGISTRY) as ToolId[];

function CustomGlyph({ kind, size, color }: { kind: Glyph; size: number; color: string }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const };
  const stroke = { stroke: color, strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (kind) {
    case 'nmap':
      // Port-scan grid — a host probed across a row of ports.
      return (
        <svg {...common} aria-hidden>
          <circle cx="4" cy="12" r="1.8" fill={color} />
          <path d="M6 12h4M12 12h4M18 12h2" {...stroke} />
          <path d="M11 8v8M16 9v6M20 10v4" {...stroke} />
        </svg>
      );
    case 'nuclei':
      // Concentric target with a template tick — signature-based scanning.
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <circle cx="12" cy="12" r="3.4" {...stroke} />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" {...stroke} />
        </svg>
      );
    case 'netexec':
      // Linked network nodes — lateral movement across hosts.
      return (
        <svg {...common} aria-hidden>
          <circle cx="5" cy="6" r="2" fill={color} />
          <circle cx="19" cy="9" r="2" fill={color} />
          <circle cx="9" cy="18" r="2" fill={color} />
          <path d="M6.6 7.2 17.4 8M7 16.4 17.6 10.4M6.2 8 8.4 16" {...stroke} />
        </svg>
      );
    case 'nikto':
      // Globe with probe lines — web server enumeration.
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="12" r="8" {...stroke} />
          <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" {...stroke} />
        </svg>
      );
    case 'hydra':
      // Multi-head fork — parallel credential brute force.
      return (
        <svg {...common} aria-hidden>
          <path d="M12 21V11" {...stroke} />
          <path d="M12 11 6 4M12 11l6-7M12 11 12 4" {...stroke} />
          <circle cx="6" cy="3" r="1.6" fill={color} />
          <circle cx="12" cy="3" r="1.6" fill={color} />
          <circle cx="18" cy="3" r="1.6" fill={color} />
        </svg>
      );
    case 'masscan':
      // Wide broadcast sweep — mass port scanning.
      return (
        <svg {...common} aria-hidden>
          <circle cx="4" cy="18" r="1.8" fill={color} />
          <path d="M4 14a10 10 0 0 1 6 6" {...stroke} />
          <path d="M4 9a15 15 0 0 1 11 11" {...stroke} />
          <path d="M4 4a20 20 0 0 1 16 16" {...stroke} />
        </svg>
      );
    case 'ffuf':
      // Fuzz burst — directory / parameter fuzzing.
      return (
        <svg {...common} aria-hidden>
          <path d="M12 12 12 3M12 12l6.5-6.5M12 12 21 12M12 12l6.5 6.5M12 12 12 21M12 12 5.5 18.5M12 12 3 12M12 12 5.5 5.5" {...stroke} />
        </svg>
      );
    case 'lynis':
      // Audit checklist with ticks — system hardening audit.
      return (
        <svg {...common} aria-hidden>
          <rect x="5" y="3" width="14" height="18" rx="2" {...stroke} />
          <path d="M8.5 8.5 10 10l2.4-2.6M8.5 14.5 10 16l2.4-2.6" {...stroke} />
          <path d="M14.5 9h2.5M14.5 15h2.5" {...stroke} />
        </svg>
      );
    case 'sslscan':
      // Padlock crossed by scan lines — TLS/SSL cipher scanning.
      return (
        <svg {...common} aria-hidden>
          <rect x="6" y="11" width="12" height="9" rx="1.6" {...stroke} />
          <path d="M9 11V8a3 3 0 0 1 6 0v3" {...stroke} />
          <path d="M9.5 15h5" {...stroke} />
        </svg>
      );
    case 'airodump':
    default:
      // Wireless wave bands — Wi-Fi capture.
      return (
        <svg {...common} aria-hidden>
          <circle cx="12" cy="18" r="1.8" fill={color} />
          <path d="M8 14a5.5 5.5 0 0 1 8 0" {...stroke} />
          <path d="M5 11a10 10 0 0 1 14 0" {...stroke} />
          <path d="M2.5 8a14 14 0 0 1 19 0" {...stroke} />
        </svg>
      );
  }
}

export function ToolIcon({ id, size = 20 }: { id: ToolId; size?: number }) {
  const meta = REGISTRY[id];
  if (meta.Icon) {
    const Icon = meta.Icon;
    return <Icon size={size} color={meta.color} aria-hidden />;
  }
  if (meta.glyph) return <CustomGlyph kind={meta.glyph} size={size} color={meta.color} />;
  return null;
}
