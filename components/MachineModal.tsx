import React, { useState, useEffect, FormEvent } from 'react';
import { PktButton, PktTextinput, PktSelect, PktTextarea, PktCheckbox, PktDatepicker } from '@oslokommune/punkt-react';
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

  useEffect(() => {
    if (isOpen) {
      if (machineToEdit) {
        setMachineData(machineToEdit);
        setDocumentationName(machineToEdit.documentation ? machineToEdit.documentation.name : null);
      } else {
        setMachineData(initialMachineState);
        setDocumentationName(null);
      }
      setReasonError(null);
    }
  }, [isOpen, machineToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setMachineData(prev => ({ ...prev, [name]: value }));
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-card-bg rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 border-b border-border-color pb-4">
          <h2 className="text-2xl font-bold text-pri">{modalTitle}</h2>
          <button onClick={onClose} className="text-muted hover:text-ink text-3xl font-bold">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                id="startDate"
                label="Startdato for bruk"
                name="startDate"
                value={machineData.startDate}
                onChange={handleChange}
                required
                fullwidth
            />
            <PktDatepicker
                id="endDate"
                label="Sluttdato for bruk"
                name="endDate"
                value={machineData.endDate}
                onChange={handleChange}
                required
                fullwidth
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-dim mb-2">Begrunnelse for fravik (flere valg er mulig)</label>
            {reasonError && <p className="text-sm text-warn -mt-1 mb-2">{reasonError}</p>}
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-3">
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

          <h3 className="text-lg font-semibold text-pri border-t border-border-color pt-6 mt-6">Erstatningsmaskin</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <PktTextinput
                id="replacementMachine"
                label="Hvilken maskin/kjøretøy skal benyttes i stedet?"
                name="replacementMachine"
                value={machineData.replacementMachine}
                onChange={handleChange}
                placeholder="Merke, modell, Euro-klasse, etc."
                required
            />
             <PktSelect
                id="replacementFuel"
                label="Drivstoff for erstatningsmaskin"
                name="replacementFuel"
                value={machineData.replacementFuel}
                onChange={handleChange}
                required
             >
                <option value="">Velg drivstoff...</option>
                <option value="HVO100">HVO100</option>
                <option value="Annet biodrivstoff">Annet biodrivstoff</option>
                <option value="Diesel (Euro 6)">Diesel (Euro 6)</option>
            </PktSelect>
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