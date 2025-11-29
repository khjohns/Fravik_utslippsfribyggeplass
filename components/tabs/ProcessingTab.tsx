import React from 'react';
import { PktAlert } from '@oslokommune/punkt-react';
import type { FormData } from '../../types';
import BOIReviewSection from '../processing/BOIReviewSection';
import PLReviewSection from '../processing/PLReviewSection';
import WorkingGroupSection from '../processing/WorkingGroupSection';
import ProjectOwnerSection from '../processing/ProjectOwnerSection';

interface ProcessingTabProps {
  formData: FormData;
  handleProcessingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleMachineDecisionChange: (machineId: string, field: 'decision' | 'comment', value: string) => void;
  formatTimestamp: (isoTimestamp?: string) => string;
  section5Ref: React.RefObject<HTMLFieldSetElement>;
}

const ProcessingTab: React.FC<ProcessingTabProps> = ({
  formData,
  handleProcessingChange,
  handleMachineDecisionChange,
  formatTimestamp,
  section5Ref
}) => {
  const { processing } = formData;

  return (
    <div className="space-y-8">
      {/* Helper text for internal users */}
      <PktAlert
        title="Intern saksbehandling"
        skin="info"
        compact
        ariaLive="polite"
      >
        <span>Denne fanen er kun for intern bruk av Oslobygg KF. Her skal rådgiver, prosjektleder, arbeidsgruppe og prosjekteier registrere sine vurderinger.</span>
      </PktAlert>

      {/* Status Indicator */}
      {processing.status && (
        <PktAlert
          title="Status"
          skin={
            processing.status === 'approved' ? 'success' :
            processing.status === 'partially_approved' ? 'warning' :
            processing.status === 'rejected' ? 'error' :
            'info'
          }
          compact
          ariaLive="polite"
        >
          <span>
            {processing.status === 'submitted' && 'Innsendt'}
            {processing.status === 'awaiting_boi_review' && 'Venter på BOI-vurdering'}
            {processing.status === 'awaiting_ent_revision' && 'Venter på oppdatering fra ENT'}
            {processing.status === 'awaiting_pl_review' && 'Venter på prosjektleder-vurdering'}
            {processing.status === 'awaiting_group_review' && 'Venter på arbeidsgruppens vurdering'}
            {processing.status === 'awaiting_owner_decision' && 'Venter på prosjekteiers beslutning'}
            {processing.status === 'approved' && 'Godkjent ✅'}
            {processing.status === 'partially_approved' && 'Delvis godkjent ⚠️'}
            {processing.status === 'rejected' && 'Avslått ❌'}
          </span>
        </PktAlert>
      )}

      {/* Section 5: BOI Advisor Review */}
      <BOIReviewSection
        processing={processing}
        handleChange={handleProcessingChange}
        formatTimestamp={formatTimestamp}
        sectionRef={section5Ref}
      />

      {/* Section 6: Project Leader Review */}
      <PLReviewSection
        processing={processing}
        handleChange={handleProcessingChange}
        formatTimestamp={formatTimestamp}
      />

      {/* Section 7: Working Group Assessment */}
      <WorkingGroupSection
        formData={formData}
        processing={processing}
        handleProcessingChange={handleProcessingChange}
        handleMachineDecisionChange={handleMachineDecisionChange}
        formatTimestamp={formatTimestamp}
      />

      {/* Section 8: Project Owner Decision */}
      <ProjectOwnerSection
        processing={processing}
        handleChange={handleProcessingChange}
        formatTimestamp={formatTimestamp}
      />
    </div>
  );
};

export default ProcessingTab;
