import React from 'react';
import { PktButton } from '@oslokommune/punkt-react';
import MachineGallery from '../../MachineGallery';
import type { Machine } from '../../../types';

interface MachineApplicationSectionProps {
  machines: Machine[];
  onEdit: (id?: string) => void;
  onDelete: (id: string) => void;
  onAddMachine: () => void;
}

const MachineApplicationSection: React.FC<MachineApplicationSectionProps> = ({
  machines,
  onEdit,
  onDelete,
  onAddMachine
}) => {
  return (
    <div className="space-y-6">
      <p className="text-ink-dim">
        Legg til alle maskiner eller kjøretøy det søkes fravik for. Hver maskin må legges inn separat med egen begrunnelse og dokumentasjon.
      </p>
      <MachineGallery machines={machines} onEdit={onEdit} onDelete={onDelete} />
      <div className="text-left">
        <PktButton
          type="button"
          onClick={onAddMachine}
          skin="secondary"
          size="medium"
        >
          + Legg til maskin
        </PktButton>
      </div>
    </div>
  );
};

export default MachineApplicationSection;
