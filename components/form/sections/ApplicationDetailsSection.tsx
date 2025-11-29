import React from 'react';
import { PktTextinput, PktDatepicker, PktCheckbox, PktTextarea, PktAlert } from '@oslokommune/punkt-react';
import type { FormData, SubmissionMeta } from '../../../types';

interface ApplicationDetailsSectionProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  submissionContext: SubmissionMeta;
  sectionRef: React.RefObject<HTMLFieldSetElement>;
}

const ApplicationDetailsSection: React.FC<ApplicationDetailsSectionProps> = ({
  formData,
  handleChange,
  submissionContext,
  sectionRef
}) => {
  return (
    <fieldset
      ref={sectionRef}
      data-section="2"
      className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28"
      role="region"
      aria-labelledby="section-2-heading"
    >
      <legend id="section-2-heading" className="text-lg font-semibold text-pri px-2">
        2. Søknadsdetaljer
      </legend>
      <div className="mt-4 space-y-6">
        {/* User Info Display (for authenticated users) */}
        {submissionContext.user ? (
          <PktAlert
            title="Automatisk signatur"
            skin="info"
            compact
            ariaLive="polite"
          >
            <span>Dato og signatur settes automatisk basert på innlogget bruker ({submissionContext.user.name})</span>
          </PktAlert>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <PktTextinput
              id="submitterName"
              label="Navn på innsender"
              name="submitterName"
              value={formData.submitterName}
              onChange={handleChange}
              required
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <PktDatepicker
            id="deadline"
            label="Ønsket frist for svar"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            required
            fullwidth
          />
        </div>
        <div className="mt-6 pt-6 border-t border-border-color">
          <div>
            <PktCheckbox
              id="isUrgent"
              name="isUrgent"
              label="Akutt behov"
              checked={formData.isUrgent}
              onChange={handleChange}
            />
            <p className="mt-1 ml-7 text-sm text-ink-dim">
              Gjelder søknader som sendes etter eller nært oppstart
            </p>
          </div>
          <div className={`transition-all duration-500 ease-in-out overflow-hidden ${formData.isUrgent ? 'max-h-96 mt-4' : 'max-h-0'}`}>
            <PktTextarea
              id="urgencyReason"
              label="Begrunnelse for sen søknad"
              name="urgencyReason"
              value={formData.urgencyReason}
              onChange={handleChange}
              placeholder="Begrunn hvorfor søknad sendes uten ugrunnet opphold."
              required={formData.isUrgent}
              fullwidth
              rows={4}
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
};

export default ApplicationDetailsSection;
