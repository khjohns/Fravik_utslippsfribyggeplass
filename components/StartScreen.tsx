import React, { useState } from 'react';
import { PktButton, PktTextinput } from '@oslokommune/punkt-react';

interface StartScreenProps {
  onStart: (applicationType: 'machine' | 'infrastructure') => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showInviteGenerator, setShowInviteGenerator] = useState(false);
  const [inviteProjectName, setInviteProjectName] = useState('');
  const [inviteProjectNumber, setInviteProjectNumber] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');

  const handleGenerateInviteLink = () => {
    const inviteData = {
      projectName: inviteProjectName,
      projectNumber: inviteProjectNumber,
      applicationType: 'machine'
    };

    const base64Data = btoa(JSON.stringify(inviteData));
    const baseUrl = window.location.origin + window.location.pathname;
    const inviteLink = `${baseUrl}?invite=${base64Data}`;

    setGeneratedLink(inviteLink);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Lenke kopiert til utklippstavlen!');
  };
  return (
    <div className="bg-card-bg p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <p className="text-ink-dim mb-4 max-w-3xl mx-auto">
        Dette skjemaet brukes for å søke om formelt unntak fra kontraktsfestede krav om utslippsfri byggeplass i prosjekter hos Oslobygg KF.
      </p>
      <p className="text-ink-dim mb-8 max-w-3xl mx-auto">
        Søknaden kan gjelde enten for spesifikke <strong>maskiner/kjøretøy</strong> eller for utfordringer knyttet til <strong>elektrisk infrastruktur</strong>.
      </p>

      <div className="bg-pri-light p-6 rounded-lg border border-border-color text-left">
        <h2 className="text-xl font-semibold text-ink mb-3">Før du starter:</h2>
        <p className="text-ink-dim mb-4">
          For å sikre en effektiv behandling av søknaden, vennligst sørg for at du har:
        </p>
        <ol className="list-decimal list-inside space-y-4 text-ink-dim">
          <li>
            <strong>Samlet relevant dokumentasjon.</strong> Avhengig av søknadstype kan dette være:
            <ul className="list-disc list-inside ml-6 mt-2 space-y-2 text-muted text-sm">
              <li><strong>Ved søknad for maskin/kjøretøy:</strong> Svar fra leverandører som dokumenterer markedsmangel, tekniske datablader etc.</li>
              <li><strong>Ved søknad for infrastruktur:</strong> Dokumentasjon på manglende strømkapasitet, kartlegging av HMS-forhold, eller kostnadsvurderinger for alternative løsninger.</li>
            </ul>
          </li>
          <li>
            <strong>Fått en foreløpig vurdering</strong> fra prosjektets rådgiver i Bærekraft og Innovasjon (BOI).
          </li>
        </ol>
      </div>

      <p className="text-sm text-muted italic mt-6 text-center">
        Ufullstendige søknader vil medføre lengre behandlingstid. Normal behandlingstid er ca. 10 virkedager.
      </p>

      {/* Invitation Link Generator */}
      <div className="mt-8 bg-white border border-border-color rounded-lg p-6">
        <button
          type="button"
          onClick={() => setShowInviteGenerator(!showInviteGenerator)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-md font-semibold text-ink">
            🔗 Opprett lenke til leverandør (Internt verktøy)
          </h3>
          <span className="text-ink-dim text-xl">
            {showInviteGenerator ? '−' : '+'}
          </span>
        </button>

        {showInviteGenerator && (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-ink-dim">
              Generer en forhåndsutfylt lenke som kan sendes til leverandører. Lenken inneholder prosjektinformasjon og lar leverandøren fylle ut søknaden direkte.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PktTextinput
                id="inviteProjectName"
                label="Prosjektnavn"
                name="inviteProjectName"
                value={inviteProjectName}
                onChange={(e) => setInviteProjectName(e.target.value)}
              />
              <PktTextinput
                id="inviteProjectNumber"
                label="Prosjektnummer"
                name="inviteProjectNumber"
                value={inviteProjectNumber}
                onChange={(e) => setInviteProjectNumber(e.target.value)}
              />
            </div>

            <PktButton
              onClick={handleGenerateInviteLink}
              skin="secondary"
              size="medium"
              type="button"
              disabled={!inviteProjectName || !inviteProjectNumber}
            >
              Generer lenke
            </PktButton>

            {generatedLink && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-2">
                  ✓ Lenke generert!
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-green-300 rounded text-sm bg-white"
                  />
                  <PktButton
                    onClick={handleCopyLink}
                    skin="primary"
                    size="small"
                    type="button"
                  >
                    Kopier
                  </PktButton>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Send denne lenken til leverandøren for å la dem fylle ut søknaden.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-ink mb-4 text-center">Velg din rolle:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: For contractor/supplier */}
          <div className="bg-white border border-border-color rounded-lg p-6 hover:border-pri hover:shadow-md transition-all">
            <h3 className="text-md font-semibold text-pri mb-3">For entreprenør / leverandør</h3>
            <p className="text-sm text-ink-dim mb-4">
              Du er entreprenør eller leverandør og skal søke om fravik for spesifikke maskiner eller kjøretøy.
            </p>
            <PktButton
              onClick={() => onStart('machine')}
              skin="primary"
              size="medium"
              type="button"
              className="w-full"
            >
              Start søknad
            </PktButton>
          </div>

          {/* Option 2: For project leader (Internal) */}
          <div className="bg-white border border-border-color rounded-lg p-6 hover:border-pri hover:shadow-md transition-all">
            <h3 className="text-md font-semibold text-pri mb-3">For prosjektleder (Intern)</h3>
            <p className="text-sm text-ink-dim mb-4">
              Du er prosjektleder hos Oslobygg KF og skal søke om fravik for elektrisk infrastruktur.
            </p>
            <PktButton
              onClick={() => onStart('infrastructure')}
              skin="primary"
              size="medium"
              type="button"
              className="w-full"
            >
              Start søknad
            </PktButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;