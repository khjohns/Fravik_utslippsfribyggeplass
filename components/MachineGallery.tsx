import React from 'react';
import type { Machine } from '../types';

const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


interface MachineGalleryProps {
  machines: Machine[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const MachineGallery: React.FC<MachineGalleryProps> = ({ machines, onEdit, onDelete }) => {
  if (machines.length === 0) {
    return (
      <div className="text-center py-8 px-4 border-2 border-dashed border-border-color rounded-lg">
        <p className="text-muted">Ingen maskiner er lagt til enda.</p>
        <p className="text-sm text-muted mt-1">Bruk knappen under for å legge til den første maskinen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {machines.map((machine) => (
        <div key={machine.id} className="bg-pri-light p-4 rounded-lg flex justify-between items-center border border-pri">
          <div>
            <p className="font-semibold text-ink">{machine.type === 'Annet' ? machine.otherType : machine.type}</p>
            <p className="text-sm text-muted">Periode: {machine.startDate || 'Uspesifisert'} - {machine.endDate || 'Uspesifisert'}</p>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => onEdit(machine.id)} className="text-muted hover:text-pri transition-colors" aria-label="Edit machine">
                <PencilIcon />
            </button>
            <button onClick={() => onDelete(machine.id)} className="text-muted hover:text-warn transition-colors" aria-label="Delete machine">
                <TrashIcon />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MachineGallery;