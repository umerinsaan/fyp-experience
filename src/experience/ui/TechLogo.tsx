/**
 * TechLogo — renders the real brand mark for a technology in the architecture
 * stack and technologies act. Most marks come from react-icons (Simple Icons);
 * others get simple, original representative glyphs in brand colors.
 */
import type { IconType } from 'react-icons';
import { SiAngular, SiDocker, SiDotnet, SiKeycloak, SiMinio, SiPython, SiRedis } from 'react-icons/si';
import type { TechId } from '@/experience/narrative';

type CustomKind =
  | 'signalr'
  | 'sqlserver'
  | 'hangfire'
  | 'csharp'
  | 'primeng'
  | 'elkjs'
  | 'mediatr'
  | 'serilog'
  | 'requests'
  | 'signalrcore';

interface TechMeta {
  label: string;
  color: string;
  Icon?: IconType;
  custom?: CustomKind;
}

const REGISTRY: Record<TechId, TechMeta> = {
  dotnet: { label: '.NET', color: '#512BD4', Icon: SiDotnet },
  csharp: { label: 'C#', color: '#68217A', custom: 'csharp' },
  angular: { label: 'Angular', color: '#DD0031', Icon: SiAngular },
  python: { label: 'Python', color: '#3776AB', Icon: SiPython },
  keycloak: { label: 'Keycloak', color: '#008AAA', Icon: SiKeycloak },
  redis: { label: 'Redis', color: '#FF4438', Icon: SiRedis },
  minio: { label: 'MinIO', color: '#C72E49', Icon: SiMinio },
  docker: { label: 'Docker', color: '#2496ED', Icon: SiDocker },
  signalr: { label: 'SignalR', color: '#0EA5E9', custom: 'signalr' },
  signalrcore: { label: 'signalrcore', color: '#0EA5E9', custom: 'signalrcore' },
  sqlserver: { label: 'SQL Server', color: '#CC2927', custom: 'sqlserver' },
  hangfire: { label: 'Hangfire', color: '#E2522B', custom: 'hangfire' },
  primeng: { label: 'PrimeNG', color: '#10B981', custom: 'primeng' },
  elkjs: { label: 'ELK.js', color: '#FF6B4A', custom: 'elkjs' },
  mediatr: { label: 'MediatR', color: '#6366F1', custom: 'mediatr' },
  serilog: { label: 'Serilog', color: '#2ECC71', custom: 'serilog' },
  requests: { label: 'requests', color: '#3776AB', custom: 'requests' },
};

export function techMeta(id: TechId): TechMeta {
  return REGISTRY[id];
}

function CustomGlyph({ kind, size, color }: { kind: CustomKind; size: number; color: string }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const };

  if (kind === 'signalr' || kind === 'signalrcore') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="6" cy="18" r="2" fill={color} />
        <path d="M5 12a9 9 0 0 1 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M5 7a14 14 0 0 1 12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'sqlserver') {
    return (
      <svg {...common} aria-hidden>
        <ellipse cx="12" cy="5.5" rx="7" ry="2.6" stroke={color} strokeWidth="1.8" />
        <path d="M5 5.5v13c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-13" stroke={color} strokeWidth="1.8" />
        <path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" stroke={color} strokeWidth="1.8" />
      </svg>
    );
  }
  if (kind === 'hangfire') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="12" cy="13" r="7.5" stroke={color} strokeWidth="1.8" />
        <path d="M12 9.5V13l2.5 1.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2.5v2M9 3h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'csharp') {
    return (
      <svg {...common} aria-hidden>
        <text x="12" y="16.5" textAnchor="middle" fill={color} fontSize="13" fontWeight="700" fontFamily="system-ui, sans-serif">
          C#
        </text>
      </svg>
    );
  }
  if (kind === 'primeng') {
    return (
      <svg {...common} aria-hidden>
        <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 8v8M9 10.5h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'elkjs') {
    return (
      <svg {...common} aria-hidden>
        <circle cx="6" cy="12" r="2.5" stroke={color} strokeWidth="1.8" />
        <circle cx="18" cy="6" r="2.5" stroke={color} strokeWidth="1.8" />
        <circle cx="18" cy="18" r="2.5" stroke={color} strokeWidth="1.8" />
        <path d="M8.2 11.2 15.5 7.2M8.2 12.8l7.3 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'mediatr') {
    return (
      <svg {...common} aria-hidden>
        <path d="M4 12h16M12 4v16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3.5" stroke={color} strokeWidth="1.8" />
      </svg>
    );
  }
  if (kind === 'serilog') {
    return (
      <svg {...common} aria-hidden>
        <path d="M5 18V6l7-2 7 2v12" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 10h6M9 14h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  // requests — HTTP arrows
  return (
    <svg {...common} aria-hidden>
      <path d="M4 8h12M11 5l5 3-5 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H8M13 13l-5 3 5 3" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TechLogo({ id, size = 16 }: { id: TechId; size?: number }) {
  const meta = REGISTRY[id];
  if (meta.Icon) {
    const Icon = meta.Icon;
    return <Icon size={size} color={meta.color} aria-hidden />;
  }
  if (meta.custom) return <CustomGlyph kind={meta.custom} size={size} color={meta.color} />;
  return null;
}

/** Multi-logo header for composite stack cards (.NET stack). */
export function TechLogoGroup({ ids, size = 16 }: { ids: readonly TechId[]; size?: number }) {
  return (
    <span className="exp-tech-logo-group">
      {ids.map((id) => (
        <TechLogo key={id} id={id} size={size} />
      ))}
    </span>
  );
}

/** Primary brand color for a technology entry (first logo). */
export function techEntryColor(logos: readonly TechId[]): string {
  return REGISTRY[logos[0] ?? 'dotnet'].color;
}
