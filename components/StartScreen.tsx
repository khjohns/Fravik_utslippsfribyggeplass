import React from 'react';
import { PktButton } from '@oslokommune/punkt-react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="bg-card-bg p-8 rounded-lg shadow-lg">
      <p className="text-ink-dim mb-4 max-w-3xl mx-auto">
        Dette skjemaet brukes for å søke om formelt unntak fra kontraktsfestede krav om utslippsfri byggeplass i prosjekter hos Oslobygg KF.
      </p>
      <p className="text-ink-dim mb-8 max-w-3xl mx-auto">
        Søknaden kan gjelde enten for spesifikke <strong>maskiner/kjøretøy</strong> eller for utfordringer knyttet til <strong>elektrisk infrastruktur</strong>.
      </p>

      <div className="bg-pri-light p-6 rounded-lg border border-border-color text-left">
        <h3 className="text-xl font-semibold text-ink mb-3">Før du starter:</h3>
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
      
      <div className="text-center mt-8">
        <PktButton
          onClick={onStart}
          skin="primary"
          size="medium"
          type="button"
        >
          Start ny søknad
        </PktButton>
      </div>
    </div>
  );
};

export default StartScreen;