import React from 'react';
import type { FormData, SubmissionMeta } from '../../types';
import ProjectInfoSection from '../form/sections/ProjectInfoSection';
import ApplicationDetailsSection from '../form/sections/ApplicationDetailsSection';
import MachineApplicationSection from '../form/sections/MachineApplicationSection';
import InfraApplicationSection from '../form/sections/InfraApplicationSection';
import ConsequencesSection from '../form/sections/ConsequencesSection';

interface ApplicationTabProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleInfraCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInfraTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleOpenMachineModal: (id?: string) => void;
  handleDeleteMachine: (id: string) => void;
  submissionContext: SubmissionMeta;
  formatTimestamp: (isoTimestamp?: string) => string;
  mode: 'submit' | 'process';
  section1Ref: React.RefObject<HTMLFieldSetElement>;
  section2Ref: React.RefObject<HTMLFieldSetElement>;
  section3Ref: React.RefObject<HTMLDivElement>;
  section4Ref: React.RefObject<HTMLFieldSetElement>;
}

const ApplicationTab: React.FC<ApplicationTabProps> = ({
  formData,
  handleChange,
  handleInfraCheckboxChange,
  handleInfraTextChange,
  handleOpenMachineModal,
  handleDeleteMachine,
  submissionContext,
  formatTimestamp,
  mode,
  section1Ref,
  section2Ref,
  section3Ref,
  section4Ref
}) => {
  return (
    <fieldset disabled={mode === 'process'} className={mode === 'process' ? 'opacity-90 space-y-8' : 'space-y-8'}>
      {/* Section 1: Project Info */}
      <ProjectInfoSection
        formData={formData}
        handleChange={handleChange}
        submissionContext={submissionContext}
        formatTimestamp={formatTimestamp}
        sectionRef={section1Ref}
      />

      {/* Section 2: Application Details */}
      <ApplicationDetailsSection
        formData={formData}
        handleChange={handleChange}
        submissionContext={submissionContext}
        sectionRef={section2Ref}
      />

      {/* Section 3: Machine or Infrastructure Application (animated conditional rendering) */}
      <div
        ref={section3Ref}
        data-section="3"
        className={`transition-all duration-500 ease-in-out overflow-hidden scroll-mt-28 ${
          formData.applicationType ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {formData.applicationType && (
          <fieldset className="bg-card-bg border border-border-color rounded-lg p-6" role="region" aria-labelledby="section-3-heading">
            <legend id="section-3-heading" className="text-lg font-semibold text-pri px-2">
              3. Grunnlag for søknad: {formData.applicationType === 'machine' ? 'Maskin/kjøretøy' : 'Infrastruktur'}
            </legend>
            <div className="mt-4 space-y-6">
              {/* Section 3A: Machine Application */}
              {formData.applicationType === 'machine' && (
                <MachineApplicationSection
                  machines={formData.machines}
                  onEdit={handleOpenMachineModal}
                  onDelete={handleDeleteMachine}
                  onAddMachine={() => handleOpenMachineModal()}
                />
              )}

              {/* Section 3B: Infrastructure Application */}
              {formData.applicationType === 'infrastructure' && (
                <InfraApplicationSection
                  infrastructure={formData.infrastructure}
                  onTextChange={handleInfraTextChange}
                  onCheckboxChange={handleInfraCheckboxChange}
                />
              )}
            </div>
          </fieldset>
        )}
      </div>

      {/* Section 4: Consequences */}
      <ConsequencesSection
        formData={formData}
        handleChange={handleChange}
        sectionRef={section4Ref}
      />
    </fieldset>
  );
};

export default ApplicationTab;
