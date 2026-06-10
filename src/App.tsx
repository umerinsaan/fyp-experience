import { AppProviders } from '@/app/providers';
import { AppRoutes } from '@/app/routes';
import { ErrorBoundary } from '@/app/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRoutes />
      </AppProviders>
    </ErrorBoundary>
  );
}
