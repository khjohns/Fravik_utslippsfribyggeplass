import React from 'react';
import { PktRadioButton, PktTextarea, PktTag } from '@oslokommune/punkt-react';
import type { FormData, Machine } from '../../types';

interface WorkingGroupSectionProps {
  formData: FormData;
  processing: FormData['processing'];
  handleProcessingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleMachineDecisionChange: (machineId: string, field: 'decision' | 'comment', value: string) => void;
  formatTimestamp: (isoTimestamp?: string) => string;
}

const WorkingGroupSection: React.FC<WorkingGroupSectionProps> = ({
  formData,
  processing,
  handleProcessingChange,
  handleMachineDecisionChange,
  formatTimestamp
}) => {
  return (
    <fieldset className="bg-card-bg border border-border-color rounded-lg p-6" role="region" aria-labelledby="section-7-heading">
      <legend id="section-7-heading" className="text-lg font-semibold text-pri px-2">
        7. Arbeidsgruppens vurdering
      </legend>

      {/* Timestamp tag */}
      {processing.groupReviewedAt && (
        <div className="mt-4">
          <PktTag size="medium" iconName="clock" skin="yellow">
            <span>Vurdert: {formatTimestamp(processing.groupReviewedAt)}{processing.groupReviewedBy && ` av ${processing.groupReviewedBy}`}</span>
          </PktTag>
        </div>
      )}

      <div className="mt-4 space-y-6">
        {/* Machine-specific decisions (only for machine applications) */}
        {formData.applicationType === 'machine' && formData.machines.length > 0 && (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-ink">Vurdering per maskin</h4>
            <p className="text-sm text-ink-dim">
              Arbeidsgruppen kan godkjenne eller avslå hver maskin individuelt. Den samlede innstillingen beregnes automatisk.
            </p>
            {formData.machines.map((machine, index) => (
              <div key={machine.id} className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
                <h5 className="font-medium text-ink">
                  Maskin {index + 1}: {machine.type}{machine.otherType ? ` (${machine.otherType})` : ''}
                </h5>
                <div>
                  <label className="block text-sm font-medium text-ink-dim mb-2">
                    Beslutning
                  </label>
                  <div className="flex flex-col gap-y-2">
                    <PktRadioButton
                      id={`machine-${machine.id}-approved`}
                      name={`machine-decision-${machine.id}`}
                      value="approved"
                      label="Godkjent"
                      checked={processing.machineDecisions?.[machine.id]?.decision === 'approved'}
                      onChange={() => handleMachineDecisionChange(machine.id, 'decision', 'approved')}
                    />
                    <PktRadioButton
                      id={`machine-${machine.id}-rejected`}
                      name={`machine-decision-${machine.id}`}
                      value="rejected"
                      label="Avslått"
                      checked={processing.machineDecisions?.[machine.id]?.decision === 'rejected'}
                      onChange={() => handleMachineDecisionChange(machine.id, 'decision', 'rejected')}
                    />
                  </div>
                </div>
                <PktTextarea
                  id={`machine-comment-${machine.id}`}
                  label="Vilkår eller kommentar (valgfritt)"
                  name={`machine-comment-${machine.id}`}
                  value={processing.machineDecisions?.[machine.id]?.comment || ''}
                  onChange={(e) => handleMachineDecisionChange(machine.id, 'comment', e.target.value)}
                  placeholder="F.eks. 'Godkjent under forutsetning av at HVO100 benyttes'"
                  rows={2}
                  fullwidth
                />
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-ink-dim mb-2">
            {formData.applicationType === 'machine' && formData.machines.length > 0
              ? 'Samlet innstilling (beregnes automatisk)'
              : 'Arbeidsgruppens innstilling'}
          </label>
          <div className="mt-2 flex flex-col gap-y-2">
            <PktRadioButton
              id="group-rec-approved"
              name="groupRecommendation"
              value="approved"
              label="Godkjent"
              checked={processing.groupRecommendation === 'approved'}
              onChange={handleProcessingChange}
              disabled={formData.applicationType === 'machine' && formData.machines.length > 0}
            />
            <PktRadioButton
              id="group-rec-partial"
              name="groupRecommendation"
              value="partially_approved"
              label="Delvis godkjent"
              checked={processing.groupRecommendation === 'partially_approved'}
              onChange={handleProcessingChange}
              disabled={formData.applicationType === 'machine' && formData.machines.length > 0}
            />
            <PktRadioButton
              id="group-rec-rejected"
              name="groupRecommendation"
              value="rejected"
              label="Avslått"
              checked={processing.groupRecommendation === 'rejected'}
              onChange={handleProcessingChange}
              disabled={formData.applicationType === 'machine' && formData.machines.length > 0}
            />
          </div>
        </div>

        <PktTextarea
          id="groupAssessment"
          label="Begrunnelse"
          name="groupAssessment"
          value={processing.groupAssessment}
          onChange={handleProcessingChange}
          placeholder="Skriv arbeidsgruppens begrunnelse her..."
          rows={6}
          fullwidth
        />
      </div>
    </fieldset>
  );
};

export default WorkingGroupSection;
