// Fix: Removed invalid CDATA wrapper from the file content.
import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PktButton, PktTextinput, PktTextarea, PktSelect, PktCheckbox, PktRadioButton, PktDatepicker, PktStepper, PktStep } from '@oslokommune/punkt-react';
import type { FormData, Machine } from '../types';
import { FileUploadField } from './form/Fields';
import MachineGallery from './MachineGallery';
import {
  submitApplicationWithRetry,
  validateBeforeSubmit,
  APIError
} from '../services/api.service';
import { useFormPersistence } from '../hooks/useFormPersistence';
import { useUnsavedChangesWarning } from '../hooks/useUnsavedChangesWarning';

const MachineModal = lazy(() => import('./MachineModal'));

/**
 * Submission states
 */
type SubmissionState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'submitting'; progress: number }
  | { status: 'success'; applicationId: number }
  | { status: 'error'; error: string };

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
  // Use custom hooks for form persistence
  const { formData, setFormData, clearSaved, hasSavedData } = useFormPersistence(initialFormData);

  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [advisorAttachmentName, setAdvisorAttachmentName] = useState<string | null>(null);
  const [advisorValidationError, setAdvisorValidationError] = useState<string | null>(null);

  // File state
  const [files, setFiles] = useState<{
    advisorAttachment?: File;
    documentation?: File[];
  }>({});

  // Submission state
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    status: 'idle',
  });

  // Stepper state
  const [activeStep, setActiveStep] = useState<string>('1');

  // Warn about unsaved changes
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Refs for scroll-to-section
  const section1Ref = useRef<HTMLFieldSetElement>(null);
  const section2Ref = useRef<HTMLFieldSetElement>(null);
  const section3Ref = useRef<HTMLDivElement>(null);
  const section4Ref = useRef<HTMLFieldSetElement>(null);
  const section5Ref = useRef<HTMLFieldSetElement>(null);

  // Scroll Spy: Automatically update activeStep based on visible section
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is in upper 30% of viewport
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.getAttribute('data-section');
          if (sectionId) {
            setActiveStep(sectionId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    const sections = [
      section1Ref.current,
      section2Ref.current,
      section3Ref.current,
      section4Ref.current,
      section5Ref.current
    ];

    sections.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sections.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

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

  /**
   * Handle file input change
   */
  const handleFileChange = (
    fieldName: 'advisorAttachment' | 'documentation',
    file: File | File[]
  ) => {
    setFiles(prev => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  const handleAdvisorAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, advisorAttachment: file }));
      handleFileChange('advisorAttachment', file);
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
      setFiles({});
      setAdvisorAttachmentName(null);
      setSubmissionState({ status: 'idle' });
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
  
  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validation
    setSubmissionState({ status: 'validating' });

    const validation = validateBeforeSubmit(formData, files);

    if (!validation.valid) {
      setSubmissionState({
        status: 'error',
        error: validation.errors.join('\n'),
      });
      return;
    }

    // 2. Submit with retry logic
    setSubmissionState({ status: 'submitting', progress: 0 });

    try {
      // Simulate progress updates (optional - for UX)
      const progressInterval = setInterval(() => {
        setSubmissionState(prev =>
          prev.status === 'submitting'
            ? { ...prev, progress: Math.min(prev.progress + 10, 90) }
            : prev
        );
      }, 500);

      // Submit application
      const response = await submitApplicationWithRetry(
        formData,
        files,
        3, // Max 3 retries
        1000 // 1 second delay
      );

      clearInterval(progressInterval);

      // Success!
      setSubmissionState({
        status: 'success',
        applicationId: response.id,
      });

      console.log('✅ Application submitted:', response);

      // Clear saved data from localStorage
      clearSaved();

      // Optional: Reset form
      // setFormData(initialFormData);
      // setFiles({});

    } catch (error) {
      const apiError = error as APIError;

      console.error('❌ Submission failed:', apiError);

      setSubmissionState({
        status: 'error',
        error: apiError.message + (apiError.details ? `\n\n${apiError.details}` : ''),
      });

      // Log to analytics/monitoring (optional)
      // trackError('submission_failed', apiError);
    }
  };

  /**
   * Render submission state UI
   */
  const renderSubmissionState = () => {
    switch (submissionState.status) {
      case 'idle':
        return null;

      case 'validating':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">Validerer skjemadata...</p>
          </div>
        );

      case 'submitting':
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 mb-2">Sender inn søknad...</p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${submissionState.progress}%` }}
              />
            </div>
            <p className="text-sm text-blue-600 mt-2">
              Vennligst ikke lukk dette vinduet
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-green-800 font-semibold mb-2">
              ✅ Søknad sendt inn!
            </h3>
            <p className="text-green-700">
              Søknads-ID: <strong>{submissionState.applicationId}</strong>
            </p>
            <p className="text-green-600 text-sm mt-2">
              Du vil motta en bekreftelse på e-post snart.
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">
              ❌ Innsending feilet
            </h3>
            <pre className="text-red-700 text-sm whitespace-pre-wrap">
              {submissionState.error}
            </pre>
            <PktButton
              onClick={() => setSubmissionState({ status: 'idle' })}
              skin="primary"
              color="red"
              size="medium"
              className="mt-4"
            >
              Prøv igjen
            </PktButton>
          </div>
        );
    }
  };

  const editingMachine = editingMachineId ? formData.machines.find(m => m.id === editingMachineId) : null;

  const applicationTypeOptions = [
      { value: 'machine', label: 'Spesifikk maskin / kjøretøy' },
      { value: 'infrastructure', label: 'Elektrisk infrastruktur på byggeplass' }
  ];

  // Scroll to section when step is clicked
  const scrollToSection = (stepNumber: string) => {
    setActiveStep(stepNumber);
    const refs = {
      '1': section1Ref,
      '2': section2Ref,
      '3': section3Ref,
      '4': section4Ref,
      '5': section5Ref
    };
    const targetRef = refs[stepNumber as keyof typeof refs];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Calculate step status based on form data completion
  const getStepStatus = (stepNumber: string): 'completed' | 'current' | 'incomplete' => {
    // Check completion status for each step independently
    const isStepComplete = (step: string): boolean => {
      switch (step) {
        case '1':
          return !!(formData.projectName && formData.projectNumber && formData.mainContractor && formData.contractBasis);
        case '2':
          return !!(formData.submittedBy && formData.submitterName && formData.primaryDriver && formData.deadline && formData.applicationType);
        case '3':
          if (formData.applicationType === 'machine') {
            return formData.machines.length > 0;
          } else if (formData.applicationType === 'infrastructure') {
            return !!(formData.infrastructure.powerAccessDescription && formData.infrastructure.infrastructureReplacement);
          }
          return false;
        case '4':
          return !!(formData.mitigatingMeasures && formData.consequencesOfRejection);
        case '5':
          return !!(formData.advisorAssessment || formData.advisorAttachment);
        default:
          return false;
      }
    };

    // If it's the active step, mark as current
    if (stepNumber === activeStep) {
      return 'current';
    }

    // Otherwise, check if completed
    return isStepComplete(stepNumber) ? 'completed' : 'incomplete';
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Stepper Sidebar - Hidden on mobile, visible on large screens */}
        <aside className="hidden lg:block lg:w-56 flex-shrink-0">
          <div className="sticky top-28">
            <PktStepper activeStep={activeStep} orientation="vertical">
              <PktStep
                title="Prosjektinformasjon"
                status={getStepStatus('1')}
                onClick={() => scrollToSection('1')}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Søknadsdetaljer"
                status={getStepStatus('2')}
                onClick={() => scrollToSection('2')}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Grunnlag for søknad"
                status={getStepStatus('3')}
                onClick={() => scrollToSection('3')}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Konsekvenser og tiltak"
                status={getStepStatus('4')}
                onClick={() => scrollToSection('4')}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Vurdering fra rådgiver"
                status={getStepStatus('5')}
                onClick={() => scrollToSection('5')}
                style={{ cursor: 'pointer' }}
              />
            </PktStepper>
          </div>
        </aside>

        {/* Form Content */}
        <div className="flex-1 min-w-0">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1 */}
        <fieldset ref={section1Ref} data-section="1" className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28">
            <legend className="text-lg font-semibold text-pri px-2">1. Prosjektinformasjon</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end mt-4">
                <PktTextinput
                    id="projectName"
                    label="Prosjektnavn"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleChange}
                    required
                />
                <PktTextinput
                    id="projectNumber"
                    label="Prosjektnummer"
                    name="projectNumber"
                    value={formData.projectNumber}
                    onChange={handleChange}
                    required
                />
                <PktTextinput
                    id="mainContractor"
                    label="Total- / Hovedentreprenør"
                    name="mainContractor"
                    value={formData.mainContractor}
                    onChange={handleChange}
                    required
                />
                <PktSelect
                    id="contractBasis"
                    label="Kontraktsgrunnlag"
                    name="contractBasis"
                    value={formData.contractBasis}
                    onChange={handleChange}
                    required
                >
                    <option value="">Velg...</option>
                    <option value="Kontrakt inngått FØR 1. jan 2025">Kontrakt inngått FØR 1. jan 2025</option>
                    <option value="Kontrakt inngått ETTER 1. jan 2025">Kontrakt inngått ETTER 1. jan 2025</option>
                </PktSelect>
            </div>
        </fieldset>

        {/* Section 2 */}
        <fieldset ref={section2Ref} data-section="2" className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28">
            <legend className="text-lg font-semibold text-pri px-2">2. Søknadsdetaljer</legend>
            <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <PktSelect
                    id="submittedBy"
                    label="Søknad sendes inn av"
                    name="submittedBy"
                    value={formData.submittedBy}
                    onChange={handleChange}
                    required
                >
                    <option value="">Velg...</option>
                    <option value="Byggherrens prosjektleder">Byggherrens prosjektleder</option>
                    <option value="Totalentreprenør">Totalentreprenør</option>
                </PktSelect>
                <PktTextinput
                    id="submitterName"
                    label="Navn på innsender"
                    name="submitterName"
                    value={formData.submitterName}
                    onChange={handleChange}
                    required
                />
                <PktSelect
                    id="primaryDriver"
                    label="Hovedårsak for søknad"
                    name="primaryDriver"
                    value={formData.primaryDriver}
                    onChange={handleChange}
                    required
                >
                    <option value="">Velg...</option>
                    <option value="Teknisk/Markedsmessig hindring">Teknisk/Markedsmessig hindring</option>
                    <option value="Kostnad">Kostnad</option>
                    <option value="Fremdrift">Fremdrift</option>
                </PktSelect>
                <PktDatepicker
                    id="deadline"
                    label="Frist for svar på søknad"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    required
                    fullwidth
                />
            </div>
            <div className="mt-6">
                <label className="block text-sm font-medium text-ink-dim mb-2">
                    Søknaden gjelder <span className="text-warn">*</span>
                </label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                    <PktRadioButton
                        id="applicationType-machine"
                        name="applicationType"
                        value="machine"
                        label="Spesifikk maskin / kjøretøy"
                        checked={formData.applicationType === 'machine'}
                        onChange={handleChange}
                    />
                    <PktRadioButton
                        id="applicationType-infrastructure"
                        name="applicationType"
                        value="infrastructure"
                        label="Elektrisk infrastruktur på byggeplass"
                        checked={formData.applicationType === 'infrastructure'}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border-color">
                <PktCheckbox
                    id="isUrgent"
                    name="isUrgent"
                    label="Akutt behov / Søknad sendes etter oppstart eller nært oppstart"
                    checked={formData.isUrgent}
                    onChange={handleChange}
                />
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

        {/* Section 3 - Animated conditional rendering */}
        <div ref={section3Ref} data-section="3" className={`transition-all duration-500 ease-in-out overflow-hidden scroll-mt-28 ${formData.applicationType ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          {formData.applicationType && (
              <fieldset className="bg-card-bg border border-border-color rounded-lg p-6">
                  <legend className="text-lg font-semibold text-pri px-2">
                    3. Grunnlag for søknad: {formData.applicationType === 'machine' ? 'Maskin/kjøretøy' : 'Infrastruktur'}
                  </legend>
                  <div className="mt-4 space-y-6">

                  {/* Section 3A */}
                  {formData.applicationType === 'machine' && (
                    <div className="space-y-6">
                      <p className="text-ink-dim">
                          Legg til alle maskiner eller kjøretøy det søkes fravik for. Hver maskin må legges inn separat med egen begrunnelse og dokumentasjon.
                      </p>
                      <MachineGallery machines={formData.machines} onEdit={handleOpenMachineModal} onDelete={handleDeleteMachine} />
                      <div className="text-left">
                          <PktButton
                            type="button"
                            onClick={() => handleOpenMachineModal()}
                            skin="secondary"
                            size="medium"
                          >
                              + Legg til maskin
                          </PktButton>
                      </div>
                    </div>
                  )}

                  {/* Section 3B */}
                  {formData.applicationType === 'infrastructure' && (
                      <div className="space-y-6">
                          <PktTextarea
                              id="powerAccessDescription"
                              label="Beskriv utfordringer med strømtilgang på byggeplassen"
                              name="powerAccessDescription"
                              value={formData.infrastructure.powerAccessDescription}
                              onChange={handleInfraTextChange}
                              placeholder="Beskriv kartlagt situasjon. Hvor er nærmeste tilkoblingspunkt? Hva er tilgjengelig elektrisk effekt (kW/kVA)?"
                              required
                              fullwidth
                              rows={4}
                          />
                          <PktTextarea
                              id="infrastructureReplacement"
                              label="Beskriv erstatningsløsning"
                              name="infrastructureReplacement"
                              value={formData.infrastructure.infrastructureReplacement}
                              onChange={handleInfraTextChange}
                              placeholder="F.eks. Dieselaggregat (Euro 6) på HVO100, etc."
                              required
                              fullwidth
                              rows={4}
                          />
                          <div>
                            <label className="block text-sm font-medium text-ink-dim mb-2">
                                Alternative løsninger som er vurdert:
                            </label>
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <PktCheckbox
                                    id="mobileBatteryConsidered"
                                    name="mobileBatteryConsidered"
                                    label="Mobile batteriløsninger"
                                    checked={formData.infrastructure.mobileBatteryConsidered}
                                    onChange={handleInfraCheckboxChange}
                                />
                                <PktCheckbox
                                    id="temporaryGridConsidered"
                                    name="temporaryGridConsidered"
                                    label="Midlertidig nett (transformatorstasjon)"
                                    checked={formData.infrastructure.temporaryGridConsidered}
                                    onChange={handleInfraCheckboxChange}
                                />
                            </div>
                          </div>
                           <PktTextarea
                              id="alternativeMethods"
                              label="Vurderte alternative løsninger (utover batteri/nett)"
                              name="alternativeMethods"
                              value={formData.infrastructure.alternativeMethods}
                              onChange={handleInfraTextChange}
                              placeholder="F.eks. endret arbeidsmetode, bruk av mindre maskiner som ikke krever like mye effekt, etc."
                              fullwidth
                              rows={4}
                          />
                          <PktTextarea
                              id="projectSpecificConditions"
                              label="Beskriv prosjektspesifikke forhold som påvirker"
                              name="projectSpecificConditions"
                              value={formData.infrastructure.projectSpecificConditions}
                              onChange={handleInfraTextChange}
                              placeholder="F.eks. plassmangel, HMS, støy etc."
                              required
                              fullwidth
                              rows={4}
                          />
                          <PktTextarea
                              id="costAssessment"
                              label="Vurdering av kostnader for alternative løsninger"
                              name="costAssessment"
                              value={formData.infrastructure.costAssessment}
                              onChange={handleInfraTextChange}
                              placeholder="Vær konkret. Er merkostnaden for utslippsfri drift >10% av prosjektkostnaden?"
                              required
                              fullwidth
                              rows={4}
                          />
                      </div>
                  )}
                  </div>
              </fieldset>
          )}
        </div>


        {/* Section 4 */}
        <fieldset ref={section4Ref} data-section="4" className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28">
            <legend className="text-lg font-semibold text-pri px-2">4. Konsekvenser og avbøtende tiltak</legend>
            <div className="mt-4 space-y-6">
                <PktTextarea
                    id="mitigatingMeasures"
                    label="Hvilke avbøtende tiltak er vurdert eller planlagt?"
                    name="mitigatingMeasures"
                    value={formData.mitigatingMeasures}
                    onChange={handleChange}
                    placeholder="F.eks. bruk av HVO100, optimalisering av logistikk, tidsbegrenset bruk etc."
                    required
                    rows={4}
                    fullwidth
                />
                <PktTextarea
                    id="consequencesOfRejection"
                    label="Hva er konsekvensene dersom søknaden IKKE innvilges?"
                    name="consequencesOfRejection"
                    value={formData.consequencesOfRejection}
                    onChange={handleChange}
                    placeholder="Beskriv konsekvenser for fremdrift, kostnader, og teknisk gjennomførbarhet."
                    required
                    rows={4}
                    fullwidth
                />
            </div>
        </fieldset>

        {/* Section 5 */}
        <fieldset ref={section5Ref} data-section="5" className="bg-card-bg border border-border-color rounded-lg p-6 scroll-mt-28">
            <legend className="text-lg font-semibold text-pri px-2">5. Vurdering fra rådgiver</legend>
            <div className="mt-4 space-y-6">
                 <PktTextarea
                    id="advisorAssessment"
                    label="Vurdering fra rådgiver i Bærekraft og Innovasjon (BOI)"
                    name="advisorAssessment"
                    value={formData.advisorAssessment}
                    onChange={handleAdvisorAssessmentChange}
                    placeholder="Søker skal her lime inn skriftlig vurdering mottatt fra BOI."
                    rows={6}
                    fullwidth
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
        </fieldset>

        {/* Submission State */}
        {renderSubmissionState()}

        {/* Submission */}
        <div className="space-y-4 pt-4">
             <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3">
                <PktButton
                    type="button"
                    onClick={handleFillWithExample}
                    skin="secondary"
                    size="medium"
                    className="w-full sm:w-auto"
                >
                    Fyll med eksempeldata
                </PktButton>
                 <PktButton
                    type="button"
                    onClick={handleReset}
                    skin="tertiary"
                    size="medium"
                    className="w-full sm:w-auto"
                >
                    Nullstill
                </PktButton>
                <PktButton
                    type="submit"
                    disabled={submissionState.status === 'submitting' || submissionState.status === 'validating'}
                    skin="primary"
                    size="medium"
                    isLoading={submissionState.status === 'submitting' || submissionState.status === 'validating'}
                    className="w-full sm:w-auto"
                >
                    {submissionState.status === 'submitting' ? 'Sender...' : submissionState.status === 'validating' ? 'Validerer...' : 'Send inn søknad'}
                </PktButton>
            </div>
        </div>

      </form>
      </div>
      </div>
      {isMachineModalOpen && (
        <Suspense fallback={<div>Laster...</div>}>
          <MachineModal
            isOpen={isMachineModalOpen}
            onClose={handleCloseMachineModal}
            onSave={handleSaveMachine}
            machineToEdit={editingMachine || null}
          />
        </Suspense>
      )}
    </>
  );
};

export default MainForm;
