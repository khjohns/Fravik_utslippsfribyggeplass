import React, { useState, useEffect, FormEvent, useRef } from 'react';
import { PktButton, PktTextinput, PktSelect, PktTextarea, PktCheckbox, PktDatepicker, PktRadioButton } from '@oslokommune/punkt-react';
import type { Machine } from '../types';
import { FileUploadField } from './form/Fields';

interface MachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (machine: Machine) => void;
  machineToEdit: Machine | null;
}

const initialMachineState: Omit<Machine, 'id'> = {
  type: '',
  otherType: '',
  startDate: '',
  endDate: '',
  reasons: [],
  marketSurveyConfirmed: false,
  surveyedCompanies: '',
  detailedReasoning: '',
  documentation: null,
  replacementMachine: '',
  replacementFuel: '',
  workDescription: '',
  alternativeSolutions: '',
};

const reasonOptions = [
  'Markedsmangel',
  'Leveringstid',
  'Tekniske begrensninger',
  'HMS-krav',
  'Annet',
];

const MachineModal: React.FC<MachineModalProps> = ({ isOpen, onClose, onSave, machineToEdit }) => {
  const [machineData, setMachineData] = useState<Omit<Machine, 'id'>>(initialMachineState);
  const [documentationName, setDocumentationName] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element to restore later
      previousActiveElement.current = document.activeElement as HTMLElement;

      if (machineToEdit) {
        setMachineData(machineToEdit);
        setDocumentationName(machineToEdit.documentation ? machineToEdit.documentation.name : null);
      } else {
        setMachineData(initialMachineState);
        setDocumentationName(null);
      }
      setReasonError(null);

      // Focus on the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Restore focus when modal closes
      previousActiveElement.current?.focus();
    }
  }, [isOpen, machineToEdit]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setMachineData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (event: CustomEvent<string[]>) => {
    const dates = event.detail;
    if (dates && dates.length === 2) {
      setMachineData(prev => ({
        ...prev,
        startDate: dates[0],
        endDate: dates[1]
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setMachineData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (reasonError) {
      setReasonError(null);
    }
    const { value, checked } = e.target;
    setMachineData(prev => {
      const newReasons = checked 
        ? [...prev.reasons, value]
        : prev.reasons.filter(reason => reason !== value);
      return { ...prev, reasons: newReasons };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMachineData(prev => ({ ...prev, documentation: file }));
      setDocumentationName(file.name);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (machineData.reasons.length === 0) {
      setReasonError('Vennligst velg minst én begrunnelse.');
      return;
    }

    const finalMachineData: Machine = {
        ...machineData,
        id: machineToEdit?.id || '', // id is handled by parent
    };
    onSave(finalMachineData);
  };

  const modalTitle = machineToEdit ? 'Rediger maskin' : 'Legg til ny maskin';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-card-bg rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        role="document"
      >
        <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
          <h2 id="modal-title" className="text-2xl font-bold text-pri">{modalTitle}</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-muted hover:text-ink text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-pri rounded"
            aria-label="Lukk modal"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Gruppe 1: Generelt */}
          <fieldset className="bg-card-bg border border-border-color rounded-lg p-6">
            <legend className="text-lg font-semibold text-pri px-2">Generelt</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
              <PktSelect
                  id="type"
                  label="Type maskin/kjøretøy"
                  name="type"
                  value={machineData.type}
                  onChange={handleChange}
                  required
              >
                  <option value="">Velg type...</option>
                  <option value="Gravemaskin">Gravemaskin</option>
                  <option value="Hjullaster">Hjullaster</option>
                  <option value="Lift">Lift</option>
                  <option value="Annet">Annet</option>
              </PktSelect>
              {machineData.type === 'Annet' && (
                  <PktTextinput
                      id="otherType"
                      label="Spesifiser annen type"
                      name="otherType"
                      value={machineData.otherType || ''}
                      onChange={handleChange}
                      required
                  />
              )}
              <PktDatepicker
                  id="dateRange"
                  label="Dato for bruk (startdato - sluttdato)"
                  name="dateRange"
                  value={machineData.startDate && machineData.endDate ? [machineData.startDate, machineData.endDate] : []}
                  onValueChange={handleDateRangeChange}
                  required
                  fullwidth
                  range
                  useWrapper
              />
            </div>
          </fieldset>

          {/* Gruppe 2: Begrunnelse for fravik */}
          <fieldset className="bg-card-bg border border-border-color rounded-lg p-6">
            <legend className="text-lg font-semibold text-pri px-2">Begrunnelse for fravik</legend>
            <div className="mt-4 space-y-6">
              <div>
                <label className="block text-sm font-medium text-ink-dim mb-3">Velg relevante grunner (flere valg er mulig)</label>
                {reasonError && <p className="text-sm text-warn mb-2">{reasonError}</p>}
                <div className="flex flex-col gap-y-2">
                  {reasonOptions.map(reason => (
                    <PktCheckbox
                      key={reason}
                      id={`reason-${reason}`}
                      label={reason}
                      value={reason}
                      checked={machineData.reasons.includes(reason)}
                      onChange={handleReasonChange}
                    />
                  ))}
                </div>
              </div>

              <PktTextarea
                id="detailedReasoning"
                label="Detaljert begrunnelse"
                name="detailedReasoning"
                value={machineData.detailedReasoning}
                onChange={handleChange}
                placeholder="Utdyp hvorfor fravik er nødvendig. Beskriv tekniske begrensninger, markedssituasjon, etc."
                required
                fullwidth
                rows={4}
              />

              <div className="bg-body-bg p-4 rounded-md border border-border-color space-y-4">
                <PktCheckbox
                  id="marketSurveyConfirmed"
                  name="marketSurveyConfirmed"
                  label="Markedsundersøkelse er gjennomført for å finne utslippsfrie alternativer"
                  checked={machineData.marketSurveyConfirmed}
                  onChange={handleCheckboxChange}
                />
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${machineData.marketSurveyConfirmed ? 'max-h-96' : 'max-h-0'}`}>
                    <PktTextarea
                        id="surveyedCompanies"
                        label="Hvilke selskaper er forespurt?"
                        name="surveyedCompanies"
                        value={machineData.surveyedCompanies}
                        onChange={handleChange}
                        placeholder="F.eks. Pon Equipment AS, Volvo Maskin AS, etc."
                        required={machineData.marketSurveyConfirmed}
                        fullwidth
                        rows={4}
                    />
                </div>
              </div>

              <FileUploadField
                label="Last opp dokumentasjon (f.eks. svar fra leverandør)"
                id="machineDocumentation"
                onChange={handleFileChange}
                fileName={documentationName}
              />

              <PktTextarea
                id="alternativeSolutions"
                label="Vurdering av alternative løsninger"
                name="alternativeSolutions"
                value={machineData.alternativeSolutions}
                onChange={handleChange}
                placeholder="Hvilke andre løsninger er vurdert (f.eks. bruk av mindre maskiner, batteribanker, endret metode)? Hvorfor er de ikke valgt?"
                required
                fullwidth
                rows={4}
              />
            </div>
          </fieldset>

          {/* Gruppe 3: Informasjon om erstatningsmaskin */}
          <fieldset className="bg-card-bg border border-border-color rounded-lg p-6">
            <legend className="text-lg font-semibold text-pri px-2">Informasjon om erstatningsmaskin</legend>
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <PktTextinput
                    id="replacementMachine"
                    label="Hvilken maskin/kjøretøy skal benyttes i stedet?"
                    name="replacementMachine"
                    value={machineData.replacementMachine}
                    onChange={handleChange}
                    placeholder="Merke, modell, Euro-klasse, etc."
                    required
                />
                <div>
                    <label className="block text-sm font-medium text-ink-dim mb-2">
                        Drivstoff for erstatningsmaskin <span className="text-warn">*</span>
                    </label>
                    <div className="flex flex-col gap-y-2">
                        <PktRadioButton
                            id="replacementFuel-hvo"
                            name="replacementFuel"
                            value="HVO100"
                            label="HVO100"
                            checked={machineData.replacementFuel === 'HVO100'}
                            onChange={handleChange}
                        />
                        <PktRadioButton
                            id="replacementFuel-bio"
                            name="replacementFuel"
                            value="Annet biodrivstoff"
                            label="Annet biodrivstoff"
                            checked={machineData.replacementFuel === 'Annet biodrivstoff'}
                            onChange={handleChange}
                        />
                        <PktRadioButton
                            id="replacementFuel-diesel"
                            name="replacementFuel"
                            value="Diesel (Euro 6)"
                            label="Diesel (Euro 6)"
                            checked={machineData.replacementFuel === 'Diesel (Euro 6)'}
                            onChange={handleChange}
                        />
                    </div>
                </div>
              </div>

               <PktTextarea
                id="workDescription"
                label="Beskrivelse av arbeidsoppgaver"
                name="workDescription"
                value={machineData.workDescription}
                onChange={handleChange}
                placeholder="Beskriv hva maskinen/kjøretøyet skal brukes til."
                required
                fullwidth
                rows={4}
              />
            </div>
          </fieldset>

          <div className="flex justify-end space-x-4 pt-6 mt-6 border-t border-border-color">
            <PktButton type="button" onClick={onClose} skin="tertiary" size="medium">
              Avbryt
            </PktButton>
            <PktButton type="submit" skin="primary" size="medium">
              Lagre maskin
            </PktButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MachineModal;
