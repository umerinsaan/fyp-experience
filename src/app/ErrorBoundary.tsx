import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ARCH_LAYERS, PROJECT_META } from '@/experience/narrative';
import { techMeta } from '@/experience/ui/TechLogo';
import { PROJECT } from '@/content/project';

interface State {
  error: Error | null;
  stack: string;
}

/**
 * Top-level safety net. A failure in the 3D layer (e.g. a lost WebGL context)
 * should never blank the entire briefing — we surface a readable message
 * instead, and keep it visible for diagnosis during development.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null, stack: '' };

  static getDerivedStateFromError(error: Error): State {
    return { error, stack: '' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surfaced for development; harmless in production.
    console.error('[experience] render error:', error, info.componentStack);
    this.setState({ stack: info.componentStack ?? '' });
  }

  render() {
    if (this.state.error) {
      // Presentable static fallback — if WebGL fails on the demo machine the
      // briefing still communicates the architecture instead of an error.
      return (
        <div role="alert" className="exp-fallback">
          <div className="exp-fallback__inner">
            <p className="exp-fallback__eyebrow">{PROJECT_META.group} · Final Year Project</p>
            <h1 className="exp-fallback__title">{PROJECT_META.title}</h1>
            <p className="exp-fallback__sub">
              A single platform — cloud control, edge execution. Every layer carries context to the next.
            </p>

            <div className="exp-fallback__stack">
              {ARCH_LAYERS.map((layer) => (
                <div key={layer.id} className="exp-fallback__layer" data-plane={layer.plane}>
                  <span className="exp-fallback__plane">
                    {layer.plane === 'cloud' ? 'Cloud · control' : 'Edge · execution'}
                  </span>
                  <span className="exp-fallback__name">
                    {layer.label}
                    {layer.primaryTech ? (
                      <span className="exp-fallback__tech">{techMeta(layer.primaryTech).label}</span>
                    ) : null}
                    {layer.services?.map((s) => (
                      <span key={s} className="exp-fallback__tech">
                        {techMeta(s).label}
                      </span>
                    ))}
                  </span>
                  <span className="exp-fallback__detail">{layer.role}</span>
                  <span className="exp-fallback__detail">{layer.detail}</span>
                </div>
              ))}
            </div>

            <div className="exp-fallback__team">
              {PROJECT.members.map((m) => (
                <span key={m.id}>
                  {m.name} · {m.id}
                </span>
              ))}
            </div>

            <details className="exp-fallback__diag">
              <summary>Technical details</summary>
              <pre>
                {this.state.error.message}
                {'\n'}
                {this.state.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
