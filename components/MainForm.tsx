// Fix: Removed invalid CDATA wrapper from the file content.
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FormData, Machine } from '../types';
import { InputField, SelectField, TextAreaField, FileUploadField, CheckboxField, RadioGroupField, DatePickerField } from './form/Fields';
import MachineGallery from './MachineGallery';
import MachineModal from './MachineModal';
import SubmissionModal from './SubmissionModal';

const exampleMachine: Machine = {
  id: uuidv4(),
  type: 'Gravemaskin',
  otherType: '',
  startDate: '2024-09-01',
  endDate: '2024-12-31',
  reasons: ['Markedsmangel', 'Leveringstid'],
  marketSurveyConfirmed: true,
  surveyedCompanies: 'Pon Equipment AS, Volvo Maskin AS',
  detailedReasoning: 'Det er undersøkt markedet for elektriske gravemaskiner i 30-tonnsklassen. Tilgjengelige modeller har for lang leveringstid (over 12 mnd) til å passe med prosjektets fremdriftsplan. Se vedlagt dokumentasjon fra leverandører.',
  documentation: null,
  replacementMachine: 'Volvo EC300EL',
  replacementFuel: 'HVO100',
  workDescription: 'Maskinen skal primært brukes til masseforflytting og planering av anleggsområdet.',
  alternativeSolutions: 'Bruk av mindre, elektriske maskiner ble vurdert, men dette ville ført til betydelig lengre byggetid og er derfor ikke et reelt alternativ. Batteribanker ble vurdert, men er ikke tilstrekkelig for å dekke effektbehovet over en hel arbeidsdag.',
};

const exampleData: FormData = {
  projectName: 'Nye Tøyenbadet',
  projectNumber: 'P12345',
  mainContractor: 'Byggmester AS',
  contractBasis: 'Kontrakt inngått ETTER 1. jan 2025',
  submittedBy: 'Totalentreprenør',
  submitterName: 'Kari Nordmann',
  primaryDriver: 'Teknisk/Markedsmessig hindring',
  deadline: '2024-08-15',
  applicationType: 'machine',
  isUrgent: true,
  urgencyReason: 'Uforutsett hendelse på byggeplass krevde umiddelbar endring av utstyr. Søknad sendes så raskt som mulig etter at behovet oppstod.',
  machines: [exampleMachine],
  infrastructure: {
    powerAccessDescription: '',
    mobileBatteryConsidered: false,
    temporaryGridConsidered: false,
    projectSpecificConditions: '',
    costAssessment: '',
    infrastructureReplacement: '',
    alternativeMethods: '',
  },
  mitigatingMeasures: 'Det vil bli benyttet HVO100 biodiesel på den aktuelle maskinen for å redusere utslippene så mye som mulig. Kjøremønster vil bli optimalisert for å redusere unødvendig tomgangskjøring.',
  consequencesOfRejection: 'Dersom søknaden ikke innvilges, vil prosjektet bli betydelig forsinket, da alternative maskiner ikke er tilgjengelige. Dette vil medføre store ekstrakostnader for prosjektet.',
  advisorAssessment: 'Rådgiver i BOI har vurdert markedsundersøkelsen som grundig og bekrefter at det for øyeblikket er utfordringer med levering av elektriske maskiner i denne størrelsesklassen. Rådgiver støtter søknaden under forutsetning av at avbøtende tiltak (HVO100) benyttes.',
  advisorAttachment: null,
};


const initialFormData: FormData = {
  projectName: '',
  projectNumber: '',
  mainContractor: '',
  contractBasis: '',
  submittedBy: '',
  submitterName: '',
  primaryDriver: '',
  deadline: '',
  applicationType: '',
  isUrgent: false,
  urgencyReason: '',
  machines: [],
  infrastructure: {
    powerAccessDescription: '',
    mobileBatteryConsidered: false,
    temporaryGridConsidered: false,
    projectSpecificConditions: '',
    costAssessment: '',
    infrastructureReplacement: '',
    alternativeMethods: '',
  },
  mitigatingMeasures: '',
  consequencesOfRejection: '',
  advisorAssessment: '',
  advisorAttachment: null,
};

const MainForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [advisorAttachmentName, setAdvisorAttachmentName] = useState<string | null>(null);
  const [advisorValidationError, setAdvisorValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string }}) => {
    const { name, value } = e.target;
    
    // Check if it's a checkbox based on the event object, not type string
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
        const { checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  
  const handleInfraCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      infrastructure: {
        ...prev.infrastructure,
        [name]: checked
      }
    }));
  };

  const handleInfraTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      infrastructure: {
        ...prev.infrastructure,
        [name]: value
      }
    }));
  };

  const handleAdvisorAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, advisorAttachment: file }));
      setAdvisorAttachmentName(file.name);
      setAdvisorValidationError(null);
    }
  };

  const handleAdvisorAssessmentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value}));
    if (value.trim()) {
        setAdvisorValidationError(null);
    }
  }
  
  const handleFillWithExample = () => {
    setFormData(exampleData);
    setAdvisorAttachmentName(null);
    setAdvisorValidationError(null);
  };

  const handleReset = () => {
    if (window.confirm('Er du sikker på at du vil nullstille hele skjemaet? All data vil bli slettet.')) {
      setFormData(initialFormData);
      setAdvisorAttachmentName(null);
      setSubmissionStatus('idle');
      setAdvisorValidationError(null);
    }
  };

  const handleOpenMachineModal = (id?: string) => {
    setEditingMachineId(id || null);
    setIsMachineModalOpen(true);
  };

  const handleCloseMachineModal = () => {
    setIsMachineModalOpen(false);
    setEditingMachineId(null);
  };

  const handleSaveMachine = (machine: Machine) => {
    if (editingMachineId) {
      setFormData((prev) => ({
        ...prev,
        machines: prev.machines.map((m) => (m.id === editingMachineId ? machine : m)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        machines: [...prev.machines, { ...machine, id: uuidv4() }],
      }));
    }
    handleCloseMachineModal();
  };

  const handleDeleteMachine = (id: string) => {
    if (window.confirm('Er du sikker på at du vil slette denne maskinen?')) {
        setFormData((prev) => ({
        ...prev,
        machines: prev.machines.filter((m) => m.id !== id),
        }));
    }
  };
  
  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.advisorAssessment.trim() && !formData.advisorAttachment) {
        setAdvisorValidationError('Du må enten lime inn vurderingen eller laste opp vedlegget.');
        return;
    }
    setAdvisorValidationError(null);
    setIsSubmissionModalOpen(true);
  };

  const handleConfirmSubmit = () => {
     setIsSubmitting(true);
     setSubmissionStatus('idle');
     console.log("Søknadsdata sendes:", formData);
     // Simulate API call
    setTimeout(() => {
        setIsSubmitting(false);
        setSubmissionStatus('success');
        setIsSubmissionModalOpen(false);
    }, 2000);
  }

  const editingMachine = editingMachineId ? formData.machines.find(m => m.id === editingMachineId) : null;

  const applicationTypeOptions = [
      { value: 'machine', label: 'Spesifikk maskin / kjøretøy' },
      { value: 'infrastructure', label: 'Elektrisk infrastruktur på byggeplass' }
  ];

  return (
    <>
      <form onSubmit={handleInitiateSubmit} className="space-y-8">
        {/* Section 1 */}
        <div className="bg-card-bg p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-pri mb-6 border-b border-border-color pb-4">1. Prosjektinformasjon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Prosjektnavn" name="projectName" value={formData.projectName} onChange={handleChange} required />
                <InputField label="Prosjektnummer" name="projectNumber" value={formData.projectNumber} onChange={handleChange} required />
                <InputField label="Total- / Hovedentreprenør" name="mainContractor" value={formData.mainContractor} onChange={handleChange} required />
                <SelectField label="Kontraktsgrunnlag" name="contractBasis" value={formData.contractBasis} onChange={handleChange} required>
                    <option value="">Velg...</option>
                    <option value="Kontrakt inngått FØR 1. jan 2025">Kontrakt inngått FØR 1. jan 2025</option>
                    <option value="Kontrakt inngått ETTER 1. jan 2025">Kontrakt inngått ETTER 1. jan 2025</option>
                </SelectField>
            </div>
        </div>

        {/* Section 2 */}
        <div className="bg-card-bg p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-pri mb-6 border-b border-border-color pb-4">2. Søknadsdetaljer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField label="Søknad sendes inn av" name="submittedBy" value={formData.submittedBy} onChange={handleChange} required>
                    <option value="">Velg...</option>
                    <option value="Byggherrens prosjektleder">Byggherrens prosjektleder</option>
                    <option value="Totalentreprenør">Totalentreprenør</option>
                </SelectField>
                <InputField label="Navn på innsender" name="submitterName" value={formData.submitterName} onChange={handleChange} required />
                <SelectField label="Hovedårsak for søknad" name="primaryDriver" value={formData.primaryDriver} onChange={handleChange} required>
                    <option value="">Velg...</option>
                    <option value="Teknisk/Markedsmessig hindring">Teknisk/Markedsmessig hindring</option>
                    <option value="Kostnad">Kostnad</option>
                    <option value="Fremdrift">Fremdrift</option>
                </SelectField>
                <DatePickerField label="Frist for svar på søknad" name="deadline" value={formData.deadline} onChange={handleChange} required />
            </div>
            <div className="mt-6">
                 <RadioGroupField
                    label="Søknaden gjelder"
                    name="applicationType"
                    value={formData.applicationType}
                    onChange={handleChange}
                    options={applicationTypeOptions}
                    required
                />
            </div>
            <div className="mt-6 pt-6 border-t border-border-color">
                <CheckboxField
                    id="isUrgent"
                    name="isUrgent"
                    label="Akutt behov / Søknad sendes etter oppstart eller nært oppstart"
                    checked={formData.isUrgent}
                    onChange={handleChange}
                />
                <div className={`transition-all duration-500 ease-in-out overflow-hidden ${formData.isUrgent ? 'max-h-96 mt-4' : 'max-h-0'}`}>
                    <TextAreaField
                        label="Begrunnelse for sen søknad"
                        name="urgencyReason"
                        value={formData.urgencyReason}
                        onChange={handleChange}
                        placeholder="Begrunn hvorfor søknad sendes uten ugrunnet opphold."
                        required={formData.isUrgent}
                    />
                </div>
            </div>
        </div>
        
        {/* Section 3 - Animated conditional rendering */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${formData.applicationType ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {formData.applicationType && (
              <div className="bg-card-bg p-8 rounded-lg shadow-lg">
                  <h2 className="text-xl font-bold text-pri mb-6 border-b border-border-color pb-4">
                    3. Grunnlag for søknad: {formData.applicationType === 'machine' ? 'Maskin/kjøretøy' : 'Infrastruktur'}
                  </h2>

                  {/* Section 3A */}
                  {formData.applicationType === 'machine' && (
                    <div className="space-y-6">
                      <p className="text-ink-dim">
                          Legg til alle maskiner eller kjøretøy det søkes fravik for. Hver maskin må legges inn separat med egen begrunnelse og dokumentasjon.
                      </p>
                      <MachineGallery machines={formData.machines} onEdit={handleOpenMachineModal} onDelete={handleDeleteMachine} />
                      <div className="text-left">
                          <button type="button" onClick={() => handleOpenMachineModal()} className="bg-pri-light border border-pri text-pri font-bold py-2 px-4 rounded-lg hover:bg-pri hover:text-white transition duration-300">
                              + Legg til maskin
                          </button>
                      </div>
                    </div>
                  )}

                  {/* Section 3B */}
                  {formData.applicationType === 'infrastructure' && (
                      <div className="space-y-6">
                          <TextAreaField 
                              label="Beskriv utfordringer med strømtilgang på byggeplassen"
                              name="powerAccessDescription"
                              value={formData.infrastructure.powerAccessDescription}
                              onChange={handleInfraTextChange}
                              placeholder="Beskriv kartlagt situasjon. Hvor er nærmeste tilkoblingspunkt? Hva er tilgjengelig elektrisk effekt (kW/kVA)?"
                              required
                          />
                          <TextAreaField 
                              label="Beskriv erstatningsløsning"
                              name="infrastructureReplacement"
                              value={formData.infrastructure.infrastructureReplacement}
                              onChange={handleInfraTextChange}
                              placeholder="F.eks. Dieselaggregat (Euro 6) på HVO100, etc."
                              required
                          />
                          <div>
                            <label className="block text-sm font-medium text-ink-dim mb-2">
                                Alternative løsninger som er vurdert:
                            </label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <CheckboxField
                                    id="mobileBatteryConsidered"
                                    name="mobileBatteryConsidered"
                                    label="Mobile batteriløsninger"
                                    checked={formData.infrastructure.mobileBatteryConsidered}
                                    onChange={handleInfraCheckboxChange}
                                />
                                <CheckboxField
                                    id="temporaryGridConsidered"
                                    name="temporaryGridConsidered"
                                    label="Midlertidig nett (transformatorstasjon)"
                                    checked={formData.infrastructure.temporaryGridConsidered}
                                    onChange={handleInfraCheckboxChange}
                                />
                            </div>
                          </div>
                           <TextAreaField 
                              label="Vurderte alternative løsninger (utover batteri/nett)"
                              name="alternativeMethods"
                              value={formData.infrastructure.alternativeMethods}
                              onChange={handleInfraTextChange}
                              placeholder="F.eks. endret arbeidsmetode, bruk av mindre maskiner som ikke krever like mye effekt, etc."
                          />
                          <TextAreaField 
                              label="Beskriv prosjektspesifikke forhold som påvirker"
                              name="projectSpecificConditions"
                              value={formData.infrastructure.projectSpecificConditions}
                              onChange={handleInfraTextChange}
                              placeholder="F.eks. plassmangel, HMS, støy etc."
                              required
                          />
                          <TextAreaField 
                              label="Vurdering av kostnader for alternative løsninger"
                              name="costAssessment"
                              value={formData.infrastructure.costAssessment}
                              onChange={handleInfraTextChange}
                              placeholder="Vær konkret. Er merkostnaden for utslippsfri drift >10% av prosjektkostnaden?"
                              required
                          />
                      </div>
                  )}
              </div>
          )}
        </div>


        {/* Section 4 */}
        <div className="bg-card-bg p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-pri mb-6 border-b border-border-color pb-4">4. Konsekvenser og avbøtende tiltak</h2>
            <div className="space-y-6">
                <TextAreaField 
                    label="Hvilke avbøtende tiltak er vurdert eller planlagt?"
                    name="mitigatingMeasures"
                    value={formData.mitigatingMeasures}
                    onChange={handleChange}
                    placeholder="F.eks. bruk av HVO100, optimalisering av logistikk, tidsbegrenset bruk etc."
                    required
                />
                <TextAreaField 
                    label="Hva er konsekvensene dersom søknaden IKKE innvilges?"
                    name="consequencesOfRejection"
                    value={formData.consequencesOfRejection}
                    onChange={handleChange}
                    placeholder="Beskriv konsekvenser for fremdrift, kostnader, og teknisk gjennomførbarhet."
                    required
                />
            </div>
        </div>

        {/* Section 5 */}
        <div className="bg-card-bg p-8 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-pri mb-6 border-b border-border-color pb-4">5. Vurdering fra rådgiver</h2>
            <div className="space-y-6">
                 <TextAreaField 
                    label="Oppsummering av vurdering fra rådgiver i Bæraft og Innovasjon (BOI)"
                    name="advisorAssessment"
                    value={formData.advisorAssessment}
                    onChange={handleAdvisorAssessmentChange}
                    placeholder="Søker skal her lime inn skriftlig vurdering mottatt fra BOI."
                />

                <div className="relative flex items-center">
                    <div className="flex-grow border-t border-border-color"></div>
                    <span className="flex-shrink mx-4 text-muted">ELLER</span>
                    <div className="flex-grow border-t border-border-color"></div>
                </div>

                <FileUploadField 
                    label="Last opp vurdering fra rådgiver (hvis du har den som fil)"
                    id="advisorAttachment"
                    onChange={handleAdvisorAttachmentChange}
                    fileName={advisorAttachmentName}
                />
                {advisorValidationError && <p className="text-center text-sm text-warn">{advisorValidationError}</p>}
            </div>
        </div>
        
        {/* Submission */}
        <div className="text-center space-y-4 pt-4">
             <div className="flex justify-center items-center gap-4">
                <button
                    type="button"
                    onClick={handleFillWithExample}
                    className="bg-gray-200 text-ink font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition duration-300"
                >
                    Fyll med eksempeldata
                </button>
                 <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white text-ink font-bold py-3 px-8 rounded-lg border border-muted hover:bg-gray-100 hover:border-ink transition duration-300"
                >
                    Nullstill
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-pri text-white font-bold py-3 px-8 rounded-lg hover:bg-pri-600 transition duration-300 disabled:bg-muted disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Sender...' : 'Send inn søknad'}
                </button>
            </div>
            {submissionStatus === 'success' && <p className="text-green-600">Søknaden er sendt inn!</p>}
            {submissionStatus === 'error' && <p className="text-warn">Noe gikk galt. Prøv igjen.</p>}
        </div>

      </form>
      <MachineModal 
        isOpen={isMachineModalOpen} 
        onClose={handleCloseMachineModal} 
        onSave={handleSaveMachine}
        machineToEdit={editingMachine || null}
      />
      <SubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default MainForm;