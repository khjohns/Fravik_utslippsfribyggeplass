import React, { Component, ReactNode } from 'react';
import { logger } from '../../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

/**
 * ErrorBoundary komponent for å fange opp feil i React-komponenter
 * Viser en fallback UI i stedet for å krasje hele appen
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Oppdater state slik at neste render viser fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Logg feil til konsoll (kun i development pga. logger utility)
    logger.error('ErrorBoundary fanget en feil:', error);
    logger.error('Component stack:', errorInfo.componentStack);

    // Oppdater state med error info
    this.setState({ errorInfo });

    // TODO: Send til error tracking service (f.eks. Sentry, Application Insights)
    // sendErrorToMonitoring(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Bruk custom fallback hvis oppgitt
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard fallback UI
      return (
        <div
          className="min-h-screen flex items-center justify-center bg-body-bg p-4"
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md w-full bg-card-bg border-2 border-warn rounded-lg p-6 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {/* Error Icon */}
                <svg
                  className="h-10 w-10 text-warn"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-warn mb-2">
                  Noe gikk galt
                </h2>
                <p className="text-ink-dim mb-4">
                  En uventet feil oppstod i applikasjonen. Vi beklager ulempene.
                </p>

                {/* Error details (kun i development) */}
                {import.meta.env.DEV && this.state.error && (
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-pri hover:text-pri-600">
                      Vis tekniske detaljer
                    </summary>
                    <div className="mt-2 p-3 bg-body-bg rounded border border-border-color">
                      <p className="text-xs font-mono text-warn break-all">
                        {this.state.error.toString()}
                      </p>
                      {this.state.errorInfo && (
                        <pre className="mt-2 text-xs font-mono text-ink-dim overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  </details>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-pri text-white font-medium rounded-md hover:bg-pri-600 focus:outline-none focus:ring-2 focus:ring-pri focus:ring-offset-2 transition-colors"
                  >
                    Last inn siden på nytt
                  </button>
                  <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-card-bg border border-border-color text-ink font-medium rounded-md hover:bg-body-bg focus:outline-none focus:ring-2 focus:ring-pri focus:ring-offset-2 transition-colors"
                  >
                    Gå tilbake
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
