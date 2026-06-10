import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { PreloadProvider } from '@/app/PreloadContext';
import { PreloaderGate } from '@/components/preloader/PreloaderGate';
import { DesktopOnlyNotice } from '@/components/layout/DesktopOnlyNotice';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      <PreloadProvider>
        <DesktopOnlyNotice />
        <PreloaderGate>{children}</PreloaderGate>
      </PreloadProvider>
    </BrowserRouter>
  );
}
