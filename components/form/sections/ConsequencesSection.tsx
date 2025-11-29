import React from 'react';
import { PktTextarea } from '@oslokommune/punkt-react';
import type { FormData } from '../../../types';

interface ConsequencesSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  sectionRef: React.RefObject<HTMLFieldSetElement>;
}

const ConsequencesSection: React.FC<ConsequencesSectionProps> = ({
  formData,
  handleChange,
  sectionRef
}) => {
  return (
    <fieldset
      ref={sectionRef}
      data-section="4"
      className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28"
      role="region"
      aria-labelledby="section-4-heading"
    >
      <legend id="section-4-heading" className="text-lg font-semibold text-pri px-2">
        4. Konsekvenser og avbøtende tiltak
      </legend>
      <div className="mt-4 space-y-6">
        <PktTextarea
          id="mitigatingMeasures"
          label="Hvilke avbøtende tiltak er vurdert eller planlagt?"
          name="mitigatingMeasures"
          value={formData.mitigatingMeasures}
          onChange={handleChange}
          placeholder="F.eks. bruk av HVO100, optimalisering av logistikk, tidsbegrenset bruk etc."
          required
          rows={4}
          fullwidth
        />
        <div>
          <PktTextarea
            id="consequencesOfRejection"
            label="Hva er konsekvensene dersom søknaden IKKE innvilges?"
            name="consequencesOfRejection"
            value={formData.consequencesOfRejection}
            onChange={handleChange}
            placeholder="Beskriv konsekvensene..."
            required
            rows={4}
            fullwidth
          />
          <p className="mt-1 text-sm text-ink-dim">
            Beskriv konsekvenser for fremdrift, kostnader, og teknisk gjennomførbarhet.
          </p>
        </div>
      </div>
    </fieldset>
  );
};

export default ConsequencesSection;
