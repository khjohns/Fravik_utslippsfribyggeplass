import React from 'react';
import { PktRadioButton, PktTextarea, PktTag } from '@oslokommune/punkt-react';
import type { FormData } from '../../types';

interface BOIReviewSectionProps {
  processing: FormData['processing'];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  formatTimestamp: (isoTimestamp?: string) => string;
  sectionRef: React.RefObject<HTMLFieldSetElement>;
}

const BOIReviewSection: React.FC<BOIReviewSectionProps> = ({
  processing,
  handleChange,
  formatTimestamp,
  sectionRef
}) => {
  return (
    <fieldset
      ref={sectionRef}
      data-section="5"
      className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28"
      role="region"
      aria-labelledby="section-5-heading"
    >
      <legend id="section-5-heading" className="text-lg font-semibold text-pri px-2">
        5. Vurdering fra rådgiver (BOI)
      </legend>

      {/* Timestamp tag */}
      {processing.boiReviewedAt && (
        <div className="mt-4">
          <PktTag size="medium" iconName="clock" skin="yellow">
            <span>Vurdert: {formatTimestamp(processing.boiReviewedAt)}{processing.boiReviewedBy && ` av ${processing.boiReviewedBy}`}</span>
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
              id="boi-sufficient-yes"
              name="boiDocumentationSufficient"
              value="yes"
              label="Ja - gi anbefaling"
              checked={processing.boiDocumentationSufficient === 'yes'}
              onChange={handleChange}
            />
            <PktRadioButton
              id="boi-sufficient-no"
              name="boiDocumentationSufficient"
              value="no"
              label="Nei - be ENT om mer dokumentasjon"
              checked={processing.boiDocumentationSufficient === 'no'}
              onChange={handleChange}
            />
          </div>
        </div>

        <PktTextarea
          id="boiAssessment"
          label={processing.boiDocumentationSufficient === 'yes' ? 'Anbefaling fra rådgiver' : 'Be om mer dokumentasjon'}
          name="boiAssessment"
          value={processing.boiAssessment}
          onChange={handleChange}
          placeholder={processing.boiDocumentationSufficient === 'yes'
            ? 'Skriv din anbefaling her...'
            : 'Beskriv hvilken dokumentasjon som mangler...'}
          rows={6}
          fullwidth
        />

        {/* Show recommendation checkboxes only if documentation is sufficient */}
        {processing.boiDocumentationSufficient === 'yes' && (
          <div>
            <label className="block text-sm font-medium text-ink-dim mb-2">
              Anbefaling
            </label>
            <div className="mt-2 flex flex-col gap-y-2">
              <PktRadioButton
                id="boi-rec-approved"
                name="boiRecommendation"
                value="approved"
                label="Godkjent"
                checked={processing.boiRecommendation === 'approved'}
                onChange={handleChange}
              />
              <PktRadioButton
                id="boi-rec-partial"
                name="boiRecommendation"
                value="partially_approved"
                label="Delvis godkjent"
                checked={processing.boiRecommendation === 'partially_approved'}
                onChange={handleChange}
              />
              <PktRadioButton
                id="boi-rec-rejected"
                name="boiRecommendation"
                value="rejected"
                label="Avslått"
                checked={processing.boiRecommendation === 'rejected'}
                onChange={handleChange}
              />
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
};

export default BOIReviewSection;
