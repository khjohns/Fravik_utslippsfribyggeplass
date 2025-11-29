import React from 'react';
import { PktRadioButton, PktTextarea, PktTag } from '@oslokommune/punkt-react';
import type { FormData } from '../../types';

interface PLReviewSectionProps {
  processing: FormData['processing'];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  formatTimestamp: (isoTimestamp?: string) => string;
}

const PLReviewSection: React.FC<PLReviewSectionProps> = ({
  processing,
  handleChange,
  formatTimestamp
}) => {
  return (
    <fieldset className="bg-card-bg border border-border-color rounded-lg p-6" role="region" aria-labelledby="section-6-heading">
      <legend id="section-6-heading" className="text-lg font-semibold text-pri px-2">
        6. Vurdering fra prosjektleder
      </legend>

      {processing.plReviewedAt && (
        <div className="mt-4">
          <PktTag size="medium" iconName="clock" skin="yellow">
            <span>Vurdert: {formatTimestamp(processing.plReviewedAt)}{processing.plReviewedBy && ` av ${processing.plReviewedBy}`}</span>
          </PktTag>
        </div>
      )}

      <div className="mt-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-dim mb-2">
            Er innlevert dokumentasjon vurdert tilstrekkelig til å foreta en vurdering?
          </label>
          <div className="mt-2 flex flex-col gap-y-2">
            <PktRadioButton
              id="pl-sufficient-yes"
              name="plDocumentationSufficient"
              value="yes"
              label="Ja - gi anbefaling"
              checked={processing.plDocumentationSufficient === 'yes'}
              onChange={handleChange}
            />
            <PktRadioButton
              id="pl-sufficient-no"
              name="plDocumentationSufficient"
              value="no"
              label="Nei - be ENT om mer dokumentasjon"
              checked={processing.plDocumentationSufficient === 'no'}
              onChange={handleChange}
            />
          </div>
        </div>

        <PktTextarea
          id="plAssessment"
          label={processing.plDocumentationSufficient === 'yes' ? 'Anbefaling fra prosjektleder' : 'Be om mer dokumentasjon'}
          name="plAssessment"
          value={processing.plAssessment}
          onChange={handleChange}
          placeholder={processing.plDocumentationSufficient === 'yes'
            ? 'Skriv din anbefaling her...'
            : 'Beskriv hvilken dokumentasjon som mangler...'}
          rows={6}
          fullwidth
        />

        {processing.plDocumentationSufficient === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-ink-dim mb-2">
              Anbefaling
            </label>
            <div className="mt-2 flex flex-col gap-y-2">
              <PktRadioButton
                id="pl-rec-approved"
                name="plRecommendation"
                value="approved"
                label="Godkjent"
                checked={processing.plRecommendation === 'approved'}
                onChange={handleChange}
              />
              <PktRadioButton
                id="pl-rec-partial"
                name="plRecommendation"
                value="partially_approved"
                label="Delvis godkjent"
                checked={processing.plRecommendation === 'partially_approved'}
                onChange={handleChange}
              />
              <PktRadioButton
                id="pl-rec-rejected"
                name="plRecommendation"
                value="rejected"
                label="Avslått"
                checked={processing.plRecommendation === 'rejected'}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default PLReviewSection;
