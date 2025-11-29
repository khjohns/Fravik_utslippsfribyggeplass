import React from 'react';
import { PktTextarea, PktCheckbox } from '@oslokommune/punkt-react';
import type { FormData } from '../../../types';

interface InfraApplicationSectionProps {
  infrastructure: FormData['infrastructure'];
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InfraApplicationSection: React.FC<InfraApplicationSectionProps> = ({
  infrastructure,
  onTextChange,
  onCheckboxChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <PktTextarea
          id="powerAccessDescription"
          label="Beskriv utfordringer med strømtilgang på byggeplassen"
          name="powerAccessDescription"
          value={infrastructure.powerAccessDescription}
          onChange={onTextChange}
          placeholder="Beskriv den kartlagte situasjonen..."
          required
          fullwidth
          rows={4}
        />
        <p className="mt-1 text-sm text-ink-dim">
          Hvor er nærmeste tilkoblingspunkt? Hva er tilgjengelig elektrisk effekt (kW/kVA)?
        </p>
      </div>
      <PktTextarea
        id="infrastructureReplacement"
        label="Beskriv erstatningsløsning"
        name="infrastructureReplacement"
        value={infrastructure.infrastructureReplacement}
        onChange={onTextChange}
        placeholder="F.eks. Dieselaggregat (Euro 6) på HVO100, etc."
        required
        fullwidth
        rows={4}
      />
      <div>
        <label className="block text-sm font-medium text-ink-dim mb-2">
          Alternative løsninger som er vurdert:
        </label>
        <div className="mt-2 flex flex-col gap-y-2">
          <PktCheckbox
            id="mobileBatteryConsidered"
            name="mobileBatteryConsidered"
            label="Mobile batteriløsninger"
            checked={infrastructure.mobileBatteryConsidered}
            onChange={onCheckboxChange}
          />
          <PktCheckbox
            id="temporaryGridConsidered"
            name="temporaryGridConsidered"
            label="Midlertidig nett (transformatorstasjon)"
            checked={infrastructure.temporaryGridConsidered}
            onChange={onCheckboxChange}
          />
        </div>
      </div>
      <PktTextarea
        id="alternativeMethods"
        label="Vurderte alternative løsninger (utover batteri/nett)"
        name="alternativeMethods"
        value={infrastructure.alternativeMethods}
        onChange={onTextChange}
        placeholder="F.eks. endret arbeidsmetode, bruk av mindre maskiner som ikke krever like mye effekt, etc."
        fullwidth
        rows={4}
      />
      <PktTextarea
        id="projectSpecificConditions"
        label="Beskriv prosjektspesifikke forhold som påvirker"
        name="projectSpecificConditions"
        value={infrastructure.projectSpecificConditions}
        onChange={onTextChange}
        placeholder="F.eks. plassmangel, HMS, støy etc."
        required
        fullwidth
        rows={4}
      />
      <div>
        <PktTextarea
          id="costAssessment"
          label="Vurdering av kostnader for alternative løsninger"
          name="costAssessment"
          value={infrastructure.costAssessment}
          onChange={onTextChange}
          placeholder="Beskriv kostnadsvurderingen..."
          required
          fullwidth
          rows={4}
        />
        <p className="mt-1 text-sm text-ink-dim">
          Er merkostnaden for utslippsfri drift &gt;10% av prosjektkostnaden? Vær konkret med tall og estimater.
        </p>
      </div>
    </div>
  );
};

export default InfraApplicationSection;
