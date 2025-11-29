import React from 'react';
import { PktRadioButton, PktTextarea, PktTag, PktAlert } from '@oslokommune/punkt-react';
import type { FormData } from '../../types';

interface ProjectOwnerSectionProps {
  processing: FormData['processing'];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  formatTimestamp: (isoTimestamp?: string) => string;
}

const ProjectOwnerSection: React.FC<ProjectOwnerSectionProps> = ({
  processing,
  handleChange,
  formatTimestamp
}) => {
  return (
    <fieldset className="bg-card-bg border border-border-color rounded-lg p-6" role="region" aria-labelledby="section-8-heading">
      <legend id="section-8-heading" className="text-lg font-semibold text-pri px-2">
        8. Prosjekteiers beslutning
      </legend>

      {/* Timestamp tag */}
      {processing.ownerDecidedAt && (
        <div className="mt-4">
          <PktTag size="medium" iconName="clock" skin="yellow">
            <span>Besluttet: {formatTimestamp(processing.ownerDecidedAt)}{processing.ownerDecidedBy && ` av ${processing.ownerDecidedBy}`}</span>
          </PktTag>
        </div>
      )}

      <div className="mt-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-dim mb-2">
            Er prosjekteier enig i arbeidsgruppens vurdering/innstilling?
          </label>
          <div className="mt-2 flex flex-col gap-y-2">
            <PktRadioButton
              id="owner-agrees-yes"
              name="ownerAgreesWithGroup"
              value="yes"
              label="Ja"
              checked={processing.ownerAgreesWithGroup === 'yes'}
              onChange={handleChange}
            />
            <PktRadioButton
              id="owner-agrees-no"
              name="ownerAgreesWithGroup"
              value="no"
              label="Nei"
              checked={processing.ownerAgreesWithGroup === 'no'}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Show justification field only if owner disagrees */}
        {processing.ownerAgreesWithGroup === 'no' && (
          <PktTextarea
            id="ownerJustification"
            label="Begrunnelse (påkrevd ved uenighet)"
            name="ownerJustification"
            value={processing.ownerJustification}
            onChange={handleChange}
            placeholder="Begrunn hvorfor du er uenig i arbeidsgruppens vurdering..."
            rows={6}
            fullwidth
            required
          />
        )}

        {/* Show final decision summary */}
        {processing.ownerAgreesWithGroup === 'yes' && processing.groupRecommendation && (
          <PktAlert
            title="Endelig beslutning"
            skin={
              processing.groupRecommendation === 'approved' ? 'success' :
              processing.groupRecommendation === 'partially_approved' ? 'warning' :
              'error'
            }
            compact
            ariaLive="polite"
          >
            <span>
              <strong>
                {processing.groupRecommendation === 'approved' && 'Godkjent'}
                {processing.groupRecommendation === 'partially_approved' && 'Delvis godkjent'}
                {processing.groupRecommendation === 'rejected' && 'Avslått'}
              </strong> (i samsvar med arbeidsgruppens innstilling)
            </span>
          </PktAlert>
        )}
      </div>
    </fieldset>
  );
};

export default ProjectOwnerSection;
