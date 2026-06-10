interface FypLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function FypLogo({ size = 40, showWordmark = true, className = '' }: FypLogoProps) {
  const gradientId = 'fyp-logo-grad';

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={showWordmark ? undefined : 'FYP'}
        className="shrink-0"
      >
        {!showWordmark ? <title>FYP</title> : null}
        <defs>
          <linearGradient id={gradientId} x1="6" y1="4" x2="34" y2="36">
            <stop offset="0%" stopColor="var(--color-accent-mint, #7dd3c0)" />
            <stop offset="100%" stopColor="var(--color-accent-purple, #a78bfa)" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
        <path
          d="M20 7.5 29.2 12.2v8.4c0 5.6-3.8 9.2-9.2 11.1-5.4-1.9-9.2-5.5-9.2-11.1v-8.4L20 7.5Z"
          fill="#0f172a"
          fillOpacity="0.94"
        />
        <path
          d="M15.5 18.2h9"
          stroke="var(--color-accent-mint, #7dd3c0)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="20" cy="22.5" r="2.25" fill="var(--color-accent-mint, #7dd3c0)" />
        <path
          d="M17.2 25.8c1.1 1 1.9 1.5 2.8 1.5s1.7-.5 2.8-1.5"
          stroke="var(--color-accent-purple, #a78bfa)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-display text-sm font-semibold tracking-wide text-text">FYP</span>
          <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Security posture
          </span>
        </span>
      ) : null}
    </span>
  );
}
