import React, { useState, useEffect, lazy, Suspense } from 'react';
import { PktHeader } from '@oslokommune/punkt-react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import type { SubmissionMeta, FormData } from './types';
import { getSubmission } from './services/api.service';
import { logger } from './utils/logger';

const StartScreen = lazy(() => import('./components/StartScreen'));
const MainForm = lazy(() => import('./components/MainForm'));

type AppState = 'start' | 'form' | 'loading';
type FormMode = 'submit' | 'process';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center min-h-[400px]" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pri"></div>
    <span className="sr-only">Laster...</span>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('start');
  const [formMode, setFormMode] = useState<FormMode>('submit');
  const [submissionContext, setSubmissionContext] = useState<SubmissionMeta>({
    source: 'standalone'
  });
  const [initialApplicationType, setInitialApplicationType] = useState<'machine' | 'infrastructure' | ''>('');
  const [loadedSubmissionData, setLoadedSubmissionData] = useState<FormData | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Parse URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get('mode');
    const submissionId = searchParams.get('id');
    const source = searchParams.get('source');
    const caseId = searchParams.get('caseId');
    const projectId = searchParams.get('projectId');
    const inviteParam = searchParams.get('invite');

    // Scenario A: Processing Mode (?mode=process&id=...)
    if (mode === 'process' && submissionId) {
      const fetchSubmission = async () => {
        try {
          setAppState('loading');
          logger.log('Fetching submission for processing:', submissionId);

          const data = await getSubmission(submissionId);

          setFormMode('process');
          setSubmissionContext({
            source: 'processing',
            submissionId: submissionId,
            // Mock authenticated user for processing
            user: {
              name: 'Prosjektleder',
              email: 'prosjektleder@oslo.kommune.no'
            }
          });
          setLoadedSubmissionData(data);
          setInitialApplicationType(data.applicationType);
          setAppState('form');
        } catch (error) {
          logger.error('Failed to fetch submission:', error);
          setLoadError('Kunne ikke laste søknaden. Vennligst prøv igjen.');
          setAppState('start');
        }
      };

      fetchSubmission();
      return; // Exit early to prevent other scenarios from running
    }

    // Scenario B: Invitation Link
    if (inviteParam) {
      try {
        // Decode Base64 and parse JSON
        const decodedData = JSON.parse(atob(inviteParam));

        setFormMode('submit');
        setSubmissionContext({
          source: 'invited',
          originUrl: window.location.href
        });

        // Pre-fill project details from invitation
        setInitialApplicationType(decodedData.applicationType || 'machine');

        // Store pre-filled data to pass to MainForm
        (window as any).__invitedProjectData = {
          projectName: decodedData.projectName || '',
          projectNumber: decodedData.projectNumber || '',
          applicationType: decodedData.applicationType || 'machine'
        };

        setAppState('form');
      } catch (error) {
        console.error('Failed to parse invitation link:', error);
        // Fall back to standalone mode
        setFormMode('submit');
        setSubmissionContext({ source: 'standalone' });
      }
    }
    // Scenario C: Catenda Integration
    else if (source === 'catenda' && caseId) {
      setFormMode('submit');
      setSubmissionContext({
        source: 'catenda',
        externalCaseId: caseId,
        projectId: projectId || undefined,
        originUrl: window.location.href,
        // Mock authenticated user
        user: {
          name: 'Ola Nordmann',
          email: 'ola@catenda.no'
        }
      });
      setAppState('form');
    }
    // Scenario D: Default (Standalone)
    else {
      setFormMode('submit');
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
              {appState === 'loading' && <LoadingSpinner />}
              {appState === 'start' && (
                <>
                  {loadError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-800">{loadError}</p>
                    </div>
                  )}
                  <StartScreen onStart={handleStartApplication} />
                </>
              )}
              {appState === 'form' && (
                <MainForm
                  mode={formMode}
                  submissionContext={submissionContext}
                  initialApplicationType={initialApplicationType}
                  initialData={loadedSubmissionData}
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
