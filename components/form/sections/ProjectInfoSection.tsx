import React from 'react';
import { PktTextinput, PktSelect, PktTag } from '@oslokommune/punkt-react';
import type { FormData, SubmissionMeta } from '../../../types';

interface ProjectInfoSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  submissionContext: SubmissionMeta;
  formatTimestamp: (isoTimestamp?: string) => string;
  sectionRef: React.RefObject<HTMLFieldSetElement>;
}

const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  formData,
  handleChange,
  submissionContext,
  formatTimestamp,
  sectionRef
}) => {
  return (
    <fieldset
      ref={sectionRef}
      data-section="1"
      className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28"
      role="region"
      aria-labelledby="section-1-heading"
    >
      <legend id="section-1-heading" className="text-lg font-semibold text-pri px-2">
        1. Prosjektinformasjon
      </legend>

      {/* Timestamp tags */}
      {(formData.submittedAt || formData.lastUpdatedAt) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {formData.submittedAt && (
            <PktTag size="medium" iconName="clock" skin="yellow">
              <span>Innsendt: {formatTimestamp(formData.submittedAt)}</span>
            </PktTag>
          )}
          {formData.lastUpdatedAt && (
            <PktTag size="medium" iconName="clock" skin="yellow">
              <span>Sist oppdatert: {formatTimestamp(formData.lastUpdatedAt)}</span>
            </PktTag>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
        <PktTextinput
          id="projectName"
          label="Prosjektnavn"
          name="projectName"
          value={formData.projectName}
          onChange={handleChange}
          required
          disabled={submissionContext.source === 'invited'}
        />
        <PktTextinput
          id="projectNumber"
          label="Prosjektnummer"
          name="projectNumber"
          value={formData.projectNumber}
          onChange={handleChange}
          required
          disabled={submissionContext.source === 'invited'}
        />
        <PktSelect
          id="frameworkAgreement"
          label="Rammeavtale"
          name="frameworkAgreement"
          value={formData.frameworkAgreement}
          onChange={handleChange}
          fullwidth
        >
          <option value="">Velg rammeavtale</option>
          <option value="Ikke aktuelt">Ikke aktuelt</option>
          <option value="Grunnarbeider">Grunnarbeider</option>
          <option value="Utomhusarbeider">Utomhusarbeider</option>
          <option value="Sammensatte håndverkertjenester">Sammensatte håndverkertjenester</option>
        </PktSelect>
        <PktTextinput
          id="mainContractor"
          label="Entreprenør"
          name="mainContractor"
          value={formData.mainContractor}
          onChange={handleChange}
          required
        />
      </div>
    </fieldset>
  );
};

export default ProjectInfoSection;
