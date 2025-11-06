import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import MainForm from './components/MainForm';

type AppState = 'start' | 'form';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('start');

  const handleStartApplication = () => {
    setAppState('form');
  };

  return (
    <div className="min-h-screen bg-body-bg text-ink font-sans">
      <main className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-pri">
              Søknad om fravik
            </h1>
            <p className="mt-2 text-lg sm:text-xl text-ink-dim">
              Krav til utslippsfri byggeplass
            </p>
          </div>

          {appState === 'start' && <StartScreen onStart={handleStartApplication} />}
          {appState === 'form' && <MainForm />}
        </div>
      </main>
    </div>
  );
};

export default App;