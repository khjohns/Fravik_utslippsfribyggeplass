import React, { useState, useEffect, lazy, Suspense } from 'react';
import { PktHeader } from '@oslokommune/punkt-react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import type { SubmissionMeta } from './types';

const StartScreen = lazy(() => import('./components/StartScreen'));
const MainForm = lazy(() => import('./components/MainForm'));

type AppState = 'start' | 'form';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-[400px]" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pri"></div>
    <span className="sr-only">Laster...</span>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [submissionContext, setSubmissionContext] = useState<SubmissionMeta>({
    source: 'standalone'
  });
  const [initialApplicationType, setInitialApplicationType] = useState<'machine' | 'infrastructure' | ''>('');

  // Parse URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const source = searchParams.get('source');
    const caseId = searchParams.get('caseId');
    const projectId = searchParams.get('projectId');

    if (source === 'catenda' && caseId) {
      // Catenda integration mode: skip StartScreen
      setSubmissionContext({
        source: 'catenda',
        externalCaseId: caseId,
        projectId: projectId || undefined,
        originUrl: window.location.href
      });
      setAppState('form');
    } else {
      // Standalone mode: show StartScreen
      setSubmissionContext({
        source: 'standalone'
      });
    }
  }, []);

  const handleStartApplication = (applicationType: 'machine' | 'infrastructure') => {
    setInitialApplicationType(applicationType);
    setAppState('form');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-body-bg text-ink font-sans">
        <PktHeader
          serviceName="Fravik utslippsfri byggeplass"
          user={{
            name: "Søker",
            showName: true
          }}
        />

        <h1 className="sr-only">Søknad om fravik - Oslo kommunes krav til utslippsfri byggeplasser</h1>

        <main className="pt-32 pb-8 sm:pb-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Suspense fallback={<LoadingSpinner />}>
              {appState === 'start' && <StartScreen onStart={handleStartApplication} />}
              {appState === 'form' && (
                <MainForm
                  submissionContext={submissionContext}
                  initialApplicationType={initialApplicationType}
                />
              )}
            </Suspense>
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
