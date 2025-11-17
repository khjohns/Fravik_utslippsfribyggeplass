import React, { useState, lazy, Suspense } from 'react';
import { PktHeader } from '@oslokommune/punkt-react';

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

  const handleStartApplication = () => {
    setAppState('form');
  };

  return (
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingSpinner />}>
            {appState === 'start' && <StartScreen onStart={handleStartApplication} />}
            {appState === 'form' && <MainForm />}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default App;
