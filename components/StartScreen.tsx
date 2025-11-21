import React, { useState } from 'react';
import { PktButton, PktAlert, PktAccordion, PktAccordionItem } from '@oslokommune/punkt-react';

interface StartScreenProps {
  onStart: (type: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [genProjectName, setGenProjectName] = useState('');
  const [genProjectNumber, setGenProjectNumber] = useState('');

  // ... (Behold logikken for lenke-generatoren din her) ...
  const handleGenerateLink = () => {
    const data = {
      projectName: genProjectName,
      projectNumber: genProjectNumber,
      applicationType: 'machine'
    };
    const base64 = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}?invite=${base64}`;
    setGeneratedLink(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Lenke kopiert!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* 1. Header - Kort og konsis */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-pri mb-4">Søknad om fravik</h1>
        <p className="text-lg text-ink-dim max-w-2xl mx-auto">
          Søk om unntak fra krav om utslippsfri byggeplass (maskiner eller infrastruktur).
        </p>
      </div>

      {/* 2. Hovedvalg - Dette er det viktigste */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Kort 1: Leverandør */}
        <div className="bg-white p-8 rounded-xl border-2 border-border-color hover:border-pri transition-all shadow-sm flex flex-col items-start text-left group">
          <div className="mb-4 p-3 bg-blue-50 rounded-full text-pri group-hover:bg-pri group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-pri mb-2">For entreprenør / leverandør</h2>
          <p className="text-ink-dim mb-6 flex-grow">
            Søk om fravik for spesifikke maskiner eller kjøretøy som ikke oppfyller miljøkravene.
          </p>
          <PktButton 
            onClick={() => onStart('machine')} 
            skin="primary" 
            size="medium"
            className="w-full sm:w-auto"
          >
            Start søknad for maskin
          </PktButton>
        </div>

        {/* Kort 2: Prosjektleder */}
        <div className="bg-white p-8 rounded-xl border-2 border-border-color hover:border-pri transition-all shadow-sm flex flex-col items-start text-left group">
          <div className="mb-4 p-3 bg-green-50 rounded-full text-green-800 group-hover:bg-green-800 group-hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-pri mb-2">For prosjektleder (Intern)</h2>
          <p className="text-ink-dim mb-6 flex-grow">
            Søk om fravik grunnet manglende elektrisk infrastruktur (kun for avrop på rammeavtaler).
          </p>
          <PktButton 
            onClick={() => onStart('infrastructure')} 
            skin="secondary" 
            size="medium"
            className="w-full sm:w-auto"
          >
            Start søknad for infrastruktur
          </PktButton>
        </div>
      </div>

      {/* 3. Trekkspill for info og verktøy - Rydder opp siden */}
      <div className="bg-white border border-border-color rounded-lg overflow-hidden">
        <PktAccordion>
          
          {/* Sjekklisten - Skjult som default */}
          <PktAccordionItem title="Hva må jeg ha klart før jeg søker?">
            <div className="p-6 bg-blue-50/50">
              <p className="text-sm text-ink mb-4 font-semibold">For å sikre rask behandling bør du ha følgende klart:</p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Liste for Maskin */}
                <div>
                  <h4 className="text-sm font-bold text-pri mb-2 uppercase tracking-wider">Maskin / Kjøretøy</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="text-green-600 mt-0.5">✔</span>
                      <span>Dokumentasjon på markedsmangel (svar fra leverandører)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="text-green-600 mt-0.5">✔</span>
                      <span>Tekniske datablader</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="text-green-600 mt-0.5">✔</span>
                      <span>Informasjon om erstatningsmaskin</span>
                    </li>
                  </ul>
                </div>

                {/* Liste for Infrastruktur */}
                <div>
                  <h4 className="text-sm font-bold text-pri mb-2 uppercase tracking-wider">Infrastruktur</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="text-green-600 mt-0.5">✔</span>
                      <span>Dokumentasjon på manglende strømkapasitet</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="text-green-600 mt-0.5">✔</span>
                      <span>Kostnadsvurdering av alternativer</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-ink-dim">
                      <span className="text-green-600 mt-0.5">✔</span>
                      <span>HMS-kartlegging (hvis relevant)</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <p className="text-xs text-muted italic mt-6">
                Tips: Ufullstendige søknader vil medføre lengre behandlingstid. Normal tid er ca. 10 virkedager.
              </p>
            </div>
          </PktAccordionItem>

          {/* Internt verktøy - Flyttet hit for å ikke forstyrre eksterne */}
          <PktAccordionItem title="🔗 Opprett lenke til leverandør (Internt verktøy)">
            <div className="p-6 bg-gray-50">
                <p className="mb-4 text-sm text-ink-dim">
                  Her kan du generere en unik lenke som du sender til leverandøren. 
                  Lenken forhåndsutfyller prosjektinformasjon slik at leverandøren slipper å gjøre det.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input 
                    type="text" 
                    placeholder="Prosjektnavn"
                    className="pkt-input"
                    value={genProjectName}
                    onChange={(e) => setGenProjectName(e.target.value)}
                  />
                  <input 
                    type="text" 
                    placeholder="Prosjektnummer"
                    className="pkt-input"
                    value={genProjectNumber}
                    onChange={(e) => setGenProjectNumber(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <PktButton onClick={handleGenerateLink} skin="secondary" size="small">
                    Generer lenke
                  </PktButton>

                  {generatedLink && (
                    <div className="bg-white p-3 border border-green-200 rounded flex items-center gap-2">
                      <code className="text-xs text-green-800 flex-grow truncate bg-green-50 p-1 rounded">
                        {generatedLink}
                      </code>
                      <button 
                        onClick={copyToClipboard}
                        className="text-xs font-bold text-green-700 hover:text-green-900 underline"
                      >
                        Kopier
                      </button>
                    </div>
                  )}
                </div>
            </div>
          </PktAccordionItem>

        </PktAccordion>
      </div>
    </div>
  );
};

export default StartScreen;
