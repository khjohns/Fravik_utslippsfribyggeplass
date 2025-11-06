import React from 'react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-card-bg rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-pri">Bekreft innsending</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-3xl font-bold">&times;</button>
        </div>
        <div className="space-y-6">
            <p className="text-ink-dim">
                Er du sikker på at du vil sende inn søknaden?
            </p>
             <p className="text-sm text-muted">
                Ved å klikke "Bekreft og send" bekrefter du at informasjonen i søknaden er korrekt. Du vil ikke kunne gjøre endringer etter innsending.
            </p>
        </div>
        <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-border-color">
            <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-2 border border-border-color rounded-md text-ink hover:bg-body-bg"
                disabled={isSubmitting}
            >
              Avbryt
            </button>
            <button 
                type="button" 
                onClick={onConfirm} 
                className="px-6 py-2 bg-pri text-white font-bold rounded-md hover:bg-pri-600 disabled:bg-muted disabled:cursor-not-allowed"
                disabled={isSubmitting}
            >
              {isSubmitting ? 'Sender...' : 'Bekreft og send'}
            </button>
          </div>
      </div>
    </div>
  );
};

export default SubmissionModal;