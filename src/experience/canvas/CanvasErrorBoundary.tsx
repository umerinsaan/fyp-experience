/**
 * Canvas-scoped error boundary (Pass 2.5).
 * A WebGL failure must not replace the entire briefing with the static card stack.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State {
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[experience] WebGL layer error:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="exp-canvas-fallback" role="status" aria-live="polite">
          <p className="exp-canvas-fallback__title">3D view paused</p>
          <p className="exp-canvas-fallback__body">
            Scroll continues — typography and copy overlays remain active. Refresh to retry WebGL.
          </p>
          <details className="exp-canvas-fallback__diag">
            <summary>Technical details</summary>
            <pre>{this.state.error.message}</pre>
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}
