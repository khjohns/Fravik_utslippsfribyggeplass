import React, { useState } from 'react';
import { PktHeader } from '@oslokommune/punkt-react';
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
      <PktHeader serviceName="Fravik utslippsfri byggeplass" />

      <main className="py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {appState === 'start' && <StartScreen onStart={handleStartApplication} />}
          {appState === 'form' && <MainForm />}
        </div>
      </main>
    </div>
  );
};

export default App;