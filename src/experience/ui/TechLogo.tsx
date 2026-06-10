/**
 * TechLogo — renders the real brand mark for a technology in the architecture
 * stack. Most marks come from react-icons (Simple Icons); SignalR, SQL Server
 * and Hangfire aren't in that set, so we draw simple, original representative
 * glyphs (signal waves / database / scheduler clock) in their brand colors.
 */
import type { IconType } from 'react-icons';
import { SiAngular, SiDocker, SiDotnet, SiKeycloak, SiMinio, SiPython, SiRedis } from 'react-icons/si';
import type { TechId } from '@/experience/narrative';

interface TechMeta {
  label: string;
  color: string;
  Icon?: IconType;
  custom?: 'signalr' | 'sqlserver' | 'hangfire';
}

const REGISTRY: Record<TechId, TechMeta> = {
  dotnet: { label: '.NET', color: '#512BD4', Icon: SiDotnet },
  angular: { label: 'Angular', color: '#DD0031', Icon: SiAngular },
  python: { label: 'Python', color: '#3776AB', Icon: SiPython },
  keycloak: { label: 'Keycloak', color: '#008AAA', Icon: SiKeycloak },
  redis: { label: 'Redis', color: '#FF4438', Icon: SiRedis },
  minio: { label: 'MinIO', color: '#C72E49', Icon: SiMinio },
  docker: { label: 'Docker', color: '#2496ED', Icon: SiDocker },
  signalr: { label: 'SignalR', color: '#0EA5E9', custom: 'signalr' },
  sqlserver: { label: 'SQL Server', color: '#CC2927', custom: 'sqlserver' },
  hangfire: { label: 'Hangfire', color: '#E2522B', custom: 'hangfire' },
};

export function techMeta(id: TechId): TechMeta {
  return REGISTRY[id];
}

function CustomGlyph({ kind, size, color }: { kind: NonNullable<TechMeta['custom']>; size: number; color: string }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const };
  if (kind === 'signalr') {
    // Concentric broadcast arcs + origin dot — a realtime signal.
    return (
      <svg {...common} aria-hidden>
        <circle cx="6" cy="18" r="2" fill={color} />
        <path d="M5 12a9 9 0 0 1 7 7" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M5 7a14 14 0 0 1 12 12" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'sqlserver') {
    // Database cylinder.
    return (
      <svg {...common} aria-hidden>
        <ellipse cx="12" cy="5.5" rx="7" ry="2.6" stroke={color} strokeWidth="1.8" />
        <path d="M5 5.5v13c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6v-13" stroke={color} strokeWidth="1.8" />
        <path d="M5 12c0 1.4 3.1 2.6 7 2.6s7-1.2 7-2.6" stroke={color} strokeWidth="1.8" />
      </svg>
    );
  }
  // hangfire — scheduler clock with a spark.
  return (
    <svg {...common} aria-hidden>
      <circle cx="12" cy="13" r="7.5" stroke={color} strokeWidth="1.8" />
      <path d="M12 9.5V13l2.5 1.8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2.5v2M9 3h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
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
