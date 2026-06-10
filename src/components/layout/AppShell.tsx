import { Outlet } from 'react-router-dom';

export function AppShell() {
  return (
    <div className="relative min-h-dvh aurora-bg text-text">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-60" aria-hidden />
      <main id="main-content" className="relative z-10 flex min-h-dvh flex-col">
        <Outlet />
      </main>
    </div>
  );
}
