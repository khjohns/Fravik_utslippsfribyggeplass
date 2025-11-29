// Fix: Removed invalid CDATA wrapper from the file content.
import React, { useState, useRef, useEffect, lazy, Suspense, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { PktButton, PktTextinput, PktTextarea, PktSelect, PktCheckbox, PktRadioButton, PktDatepicker, PktStepper, PktStep, PktTag, PktAlert } from '@oslokommune/punkt-react';
import type { FormData, Machine, SubmissionMeta } from '../types';
import { FileUploadField } from './form/Fields';
import MachineGallery from './MachineGallery';
import { useFormPersistence, useUnsavedChangesWarning } from '../hooks';
import { useFormState } from '../hooks/useFormState';
import { useProcessingState } from '../hooks/useProcessingState';
import { useMachineDecisions } from '../hooks/useMachineDecisions';
import { useFormSubmission } from '../hooks/useFormSubmission';
import { logger } from '../utils/logger';
import { generateFravikPdf, generateFravikPdfBlob } from '../utils/FravikPdfDocument';
import PDFPreviewModal from './PDFPreviewModal';
import ApplicationTab from './tabs/ApplicationTab';
import ProcessingTab from './tabs/ProcessingTab';

const MachineModal = lazy(() => import('./MachineModal'));

interface MainFormProps {
  mode: 'submit' | 'process';
  submissionContext: SubmissionMeta;
  initialApplicationType: 'machine' | 'infrastructure' | '';
  initialData?: FormData;
}

type TabType = 'application' | 'processing';

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
  frameworkAgreement: 'Grunnarbeider',
  mainContractor: 'Byggmester AS',
  submitterName: 'Kari Nordmann',
  deadline: '2024-08-15',
  applicationType: 'machine',
  isUrgent: true,
  urgencyReason: 'Uforutsett hendelse på byggeplass krevde umiddelbar endring av utstyr. Søknad sendes så raskt som mulig etter at behovet oppstod.',
  submittedAt: new Date('2024-08-01T10:30:00').toISOString(),
  lastUpdatedAt: new Date('2024-08-02T14:15:00').toISOString(),
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
  processing: {
    status: 'approved',
    boiDocumentationSufficient: 'yes',
    boiAssessment: 'Markedsundersøkelsen er grundig og bekrefter utfordringer med leveringstid. Dokumentasjonen er tilstrekkelig.',
    boiRecommendation: 'approved',
    boiReviewedAt: new Date('2024-08-03T09:15:00').toISOString(),
    boiReviewedBy: 'Ola Hansen (BOI)',
    plDocumentationSufficient: 'yes',
    plAssessment: 'Prosjektleder støtter rådgivers anbefaling. Søknaden er godt begrunnet og nødvendig for prosjektets fremdrift.',
    plRecommendation: 'approved',
    plReviewedAt: new Date('2024-08-04T11:30:00').toISOString(),
    plReviewedBy: 'Line Olsen',
    groupRecommendation: 'approved',
    groupAssessment: 'Arbeidsgruppen har gjennomgått søknaden og dokumentasjonen. Vi bekrefter at markedsundersøkelsen er grundig utført og at det foreligger reelle utfordringer med tilgjengelighet av elektriske alternativer.',
    groupReviewedAt: new Date('2024-08-05T13:45:00').toISOString(),
    groupReviewedBy: 'Arbeidsgruppe for utslippsfri byggeplass',
    machineDecisions: {
      [exampleMachine.id]: {
        decision: 'approved',
        comment: 'Godkjent under forutsetning av at HVO100 benyttes',
      }
    },
    ownerAgreesWithGroup: 'yes',
    ownerJustification: '',
    ownerDecidedAt: new Date('2024-08-06T15:00:00').toISOString(),
    ownerDecidedBy: 'Per Andersen',
  }
};


const initialFormData: FormData = {
  projectName: '',
  projectNumber: '',
  frameworkAgreement: '',
  mainContractor: '',
  submitterName: '',
  deadline: '',
  applicationType: '',
  isUrgent: false,
  urgencyReason: '',
  submittedAt: undefined,
  lastUpdatedAt: undefined,
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
  processing: {
    status: '',
    boiDocumentationSufficient: '',
    boiAssessment: '',
    boiRecommendation: '',
    boiReviewedAt: undefined,
    boiReviewedBy: undefined,
    plDocumentationSufficient: '',
    plAssessment: '',
    plRecommendation: '',
    plReviewedAt: undefined,
    plReviewedBy: undefined,
    groupRecommendation: '',
    groupAssessment: '',
    groupReviewedAt: undefined,
    groupReviewedBy: undefined,
    machineDecisions: {},
    ownerAgreesWithGroup: '',
    ownerJustification: '',
    ownerDecidedAt: undefined,
    ownerDecidedBy: undefined,
  }
};

const MainForm: React.FC<MainFormProps> = ({ mode, submissionContext, initialApplicationType, initialData }) => {
  // Use custom hooks for form persistence (only in submit mode)
  const { formData, setFormData, clearSaved, hasSavedData } = useFormPersistence(initialFormData);

  // Default to 'processing' tab when in process mode, 'application' otherwise
  const [activeTab, setActiveTab] = useState<TabType>(mode === 'process' ? 'processing' : 'application');
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [editingMachineId, setEditingMachineId] = useState<string | null>(null);
  const [advisorAttachmentName, setAdvisorAttachmentName] = useState<string | null>(null);
  const [advisorValidationError, setAdvisorValidationError] = useState<string | null>(null);
  const [isLoadingExample, setIsLoadingExample] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // PDF Preview Modal state
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfPreviewBlob, setPdfPreviewBlob] = useState<Blob | null>(null);

  // Load initial data when in process mode
  useEffect(() => {
    if (mode === 'process' && initialData) {
      logger.log('Loading submission data for processing:', initialData);
      setFormData(initialData);
    }
  }, [mode, initialData]);

  // Set initial application type and handle invited project data
  useEffect(() => {
    // IMPORTANT: Always override applicationType when coming from StartScreen
    // This ensures the correct form is shown even if old data exists in localStorage
    if (initialApplicationType) {
      setFormData(prev => {
        // If changing application type, reset relevant sections
        if (prev.applicationType && prev.applicationType !== initialApplicationType) {
          return {
            ...prev,
            applicationType: initialApplicationType,
            // Reset machines if switching away from machine
            machines: initialApplicationType === 'machine' ? prev.machines : [],
            // Reset infrastructure if switching away from infrastructure
            infrastructure: initialApplicationType === 'infrastructure' ? prev.infrastructure : {
              powerAccessDescription: '',
              mobileBatteryConsidered: false,
              temporaryGridConsidered: false,
              projectSpecificConditions: '',
              costAssessment: '',
              infrastructureReplacement: '',
              alternativeMethods: '',
            }
          };
        }
        return { ...prev, applicationType: initialApplicationType };
      });
    }

    // Handle invited project data
    if (submissionContext.source === 'invited' && (window as any).__invitedProjectData) {
      const invitedData = (window as any).__invitedProjectData;
      setFormData(prev => ({
        ...prev,
        projectName: invitedData.projectName || prev.projectName,
        projectNumber: invitedData.projectNumber || prev.projectNumber,
        applicationType: invitedData.applicationType || prev.applicationType
      }));
      // Clean up
      delete (window as any).__invitedProjectData;
    }
  }, [initialApplicationType, submissionContext]);

  // File state
  const [files, setFiles] = useState<{
    advisorAttachment?: File;
    documentation?: File[];
  }>({});

  // Custom hooks for state management
  const { handleChange, handleInfraCheckboxChange, handleInfraTextChange } = useFormState(setFormData);
  const { handleProcessingChange, handleMachineDecisionChange } = useProcessingState(setFormData);
  const { submissionState, handleSubmit, setSubmissionState } = useFormSubmission(formData, files, submissionContext, clearSaved);

  // Auto-calculate groupRecommendation based on machine decisions
  useMachineDecisions(formData, setFormData);

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

  /**
   * Format ISO timestamp to Norwegian date/time
   */
  const formatTimestamp = (isoTimestamp?: string): string => {
    if (!isoTimestamp) return '';
    try {
      const date = new Date(isoTimestamp);
      const dateStr = date.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('no-NO', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateStr} kl. ${timeStr}`;
    } catch {
      return '';
    }
  };

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
  
  const handleFillWithExample = useCallback(async () => {
    setIsLoadingExample(true);
    // Simulate async operation (e.g., fetching from API)
    await new Promise(resolve => setTimeout(resolve, 300));
    setFormData(exampleData);
    setAdvisorAttachmentName(null);
    setAdvisorValidationError(null);
    setIsLoadingExample(false);
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Er du sikker på at du vil nullstille hele skjemaet? All data vil bli slettet.')) {
      setFormData(initialFormData);
      setFiles({});
      setAdvisorAttachmentName(null);
      setSubmissionState({ status: 'idle' });
      setAdvisorValidationError(null);
    }
  }, []);

  const handlePreviewPdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generateFravikPdfBlob(formData);
      setPdfPreviewBlob(blob);
      setShowPdfPreview(true);
    } catch (error) {
      logger.error('PDF generation failed:', error);
      alert('Kunne ikke generere PDF. Vennligst prøv igjen.');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [formData]);

  const handleClosePdfPreview = useCallback(() => {
    setShowPdfPreview(false);
    setPdfPreviewBlob(null);
  }, []);

  const handleOpenMachineModal = useCallback((id?: string) => {
    setEditingMachineId(id || null);
    setIsMachineModalOpen(true);
  }, []);

  const handleCloseMachineModal = useCallback(() => {
    setIsMachineModalOpen(false);
    setEditingMachineId(null);
  }, []);

  const handleSaveMachine = useCallback((machine: Machine) => {
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
  }, [editingMachineId, handleCloseMachineModal]);

  const handleDeleteMachine = useCallback((id: string) => {
    if (window.confirm('Er du sikker på at du vil slette denne maskinen?')) {
        setFormData((prev) => ({
        ...prev,
        machines: prev.machines.filter((m) => m.id !== id),
        }));
    }
  }, []);

  /**
   * Render submission state UI
   */
  const renderSubmissionState = () => {
    switch (submissionState.status) {
      case 'idle':
        return null;

      case 'validating':
        return (
          <PktAlert
            title="Validerer"
            skin="info"
            compact
            ariaLive="polite"
          >
            <span>Validerer skjemadata...</span>
          </PktAlert>
        );

      case 'submitting':
        return (
          <PktAlert
            title="Sender inn søknad"
            skin="info"
            compact
            ariaLive="polite"
          >
            <div>
              <div className="w-full bg-blue-200 rounded-full h-2 mb-2" role="progressbar" aria-valuenow={submissionState.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Innsendingsprogress">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${submissionState.progress}%` }}
                />
              </div>
              <span className="text-sm">Vennligst ikke lukk dette vinduet</span>
            </div>
          </PktAlert>
        );

      case 'success':
        return (
          <PktAlert
            title="Søknad sendt inn!"
            skin="success"
            compact
            ariaLive="polite"
          >
            <div>
              <p>Søknads-ID: <strong>{submissionState.applicationId}</strong></p>
              <p className="text-sm mt-2">Du vil motta en bekreftelse på e-post snart.</p>
            </div>
          </PktAlert>
        );

      case 'error':
        return (
          <PktAlert
            title="Innsending feilet"
            skin="error"
            compact
            ariaLive="assertive"
          >
            <div>
              <pre className="text-sm whitespace-pre-wrap mb-4">
                {submissionState.error}
              </pre>
              <PktButton
                onClick={() => setSubmissionState({ status: 'idle' })}
                skin="primary"
                color="red"
                size="medium"
              >
                Prøv igjen
              </PktButton>
            </div>
          </PktAlert>
        );
    }
  };

  const editingMachine = useMemo(
    () => editingMachineId ? formData.machines.find(m => m.id === editingMachineId) : null,
    [editingMachineId, formData.machines]
  );

  const applicationTypeOptions = useMemo(() => [
      { value: 'machine', label: 'Spesifikk maskin / kjøretøy' },
      { value: 'infrastructure', label: 'Elektrisk infrastruktur på byggeplass' }
  ], []);

  // Scroll to section when step is clicked
  const scrollToSection = useCallback((stepNumber: string) => {
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
  }, []);

  // Calculate step status based on form data completion
  const getStepStatus = useCallback((stepNumber: string): 'completed' | 'current' | 'incomplete' => {
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
  }, [activeStep, formData]);

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
        {/* Stepper Sidebar - Hidden on mobile, visible on large screens */}
        <aside className="hidden lg:block lg:w-56 flex-shrink-0" aria-label="Søknadsprogresjon">
          <div className="sticky top-28">
            <PktStepper activeStep={activeStep} orientation="vertical">
              <PktStep
                title="Prosjektinformasjon"
                status={getStepStatus('1')}
                onClick={() => scrollToSection('1')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection('1');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-current={activeStep === '1' ? 'step' : undefined}
                aria-label={`Steg 1: Prosjektinformasjon - ${getStepStatus('1')}`}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Søknadsdetaljer"
                status={getStepStatus('2')}
                onClick={() => scrollToSection('2')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection('2');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-current={activeStep === '2' ? 'step' : undefined}
                aria-label={`Steg 2: Søknadsdetaljer - ${getStepStatus('2')}`}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Grunnlag for søknad"
                status={getStepStatus('3')}
                onClick={() => scrollToSection('3')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection('3');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-current={activeStep === '3' ? 'step' : undefined}
                aria-label={`Steg 3: Grunnlag for søknad - ${getStepStatus('3')}`}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Konsekvenser og tiltak"
                status={getStepStatus('4')}
                onClick={() => scrollToSection('4')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection('4');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-current={activeStep === '4' ? 'step' : undefined}
                aria-label={`Steg 4: Konsekvenser og tiltak - ${getStepStatus('4')}`}
                style={{ cursor: 'pointer' }}
              />
              <PktStep
                title="Vurdering fra rådgiver"
                status={getStepStatus('5')}
                onClick={() => scrollToSection('5')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToSection('5');
                  }
                }}
                tabIndex={0}
                role="button"
                aria-current={activeStep === '5' ? 'step' : undefined}
                aria-label={`Steg 5: Vurdering fra rådgiver - ${getStepStatus('5')}`}
                style={{ cursor: 'pointer' }}
              />
            </PktStepper>
          </div>
        </aside>

        {/* Form Content */}
        <div className="flex-1 min-w-0">
          {/* Tab Navigation */}
          <div className="bg-card-bg border border-border-color rounded-lg mb-8 p-2" role="tablist" aria-label="Søknadsfaner">
            <div className="flex gap-2">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'application'}
                aria-controls="application-panel"
                onClick={() => setActiveTab('application')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  activeTab === 'application'
                    ? 'bg-pri text-white'
                    : 'bg-transparent text-ink-dim hover:bg-pri-light'
                }`}
              >
                Søknad
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'processing'}
                aria-controls="processing-panel"
                onClick={() => setActiveTab('processing')}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all ${
                  activeTab === 'processing'
                    ? 'bg-pri text-white'
                    : 'bg-transparent text-ink-dim hover:bg-pri-light'
                }`}
              >
                Behandling
              </button>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="space-y-8" aria-label="Søknadsskjema">
        {/* Application Tab */}
        <div
          role="tabpanel"
          id="application-panel"
          aria-labelledby="application-tab"
          className={activeTab === 'application' ? '' : 'hidden'}
        >
          <ApplicationTab
            formData={formData}
            handleChange={handleChange}
            handleInfraCheckboxChange={handleInfraCheckboxChange}
            handleInfraTextChange={handleInfraTextChange}
            handleOpenMachineModal={handleOpenMachineModal}
            handleDeleteMachine={handleDeleteMachine}
            submissionContext={submissionContext}
            formatTimestamp={formatTimestamp}
            mode={mode}
            section1Ref={section1Ref}
            section2Ref={section2Ref}
            section3Ref={section3Ref}
            section4Ref={section4Ref}
          />
        </div>
        {/* End of Application Tab */}

        {/* Processing Tab */}
        <div
          role="tabpanel"
          id="processing-panel"
          aria-labelledby="processing-tab"
          className={activeTab === 'processing' ? '' : 'hidden'}
        >
          <ProcessingTab
            formData={formData}
            handleProcessingChange={handleProcessingChange}
            handleMachineDecisionChange={handleMachineDecisionChange}
            formatTimestamp={formatTimestamp}
            section5Ref={section5Ref}
          />
        </div>
        {/* End of Processing Tab */}


        {/* Submission State */}
        {renderSubmissionState()}

        {/* Bot Protection (CAPTCHA) */}
        {(submissionContext.source === 'standalone' || submissionContext.source === 'invited') && !submissionContext.user && (
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 text-center">
            <div className="bg-white border-2 border-dashed border-gray-400 rounded-lg p-8">
              <p className="text-gray-600 font-medium mb-2">🛡️ Bot-beskyttelse</p>
              <p className="text-sm text-gray-500">
                [CAPTCHA vil bli vist her - Turnstile/ReCAPTCHA]
              </p>
            </div>
          </div>
        )}

        {/* Submission */}
        <div className="space-y-4 pt-4">
             <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3">
                <PktButton
                    type="button"
                    onClick={handleFillWithExample}
                    skin="secondary"
                    size="medium"
                    className="w-full sm:w-auto"
                    disabled={isLoadingExample}
                    aria-busy={isLoadingExample}
                >
                    {isLoadingExample ? 'Laster...' : 'Fyll med eksempeldata'}
                </PktButton>
                <PktButton
                    type="button"
                    onClick={handlePreviewPdf}
                    skin="secondary"
                    size="medium"
                    className="w-full sm:w-auto"
                    disabled={isGeneratingPdf}
                    aria-busy={isGeneratingPdf}
                >
                    {isGeneratingPdf ? 'Genererer...' : 'Forhåndsvis PDF'}
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
                    {submissionState.status === 'submitting' ? 'Sender...' : submissionState.status === 'validating' ? 'Validerer...' : mode === 'process' ? 'Lagre vedtak' : 'Send inn søknad'}
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

      {/* PDF Preview Modal */}
      {showPdfPreview && (
        <PDFPreviewModal
          pdfBlob={pdfPreviewBlob}
          onClose={handleClosePdfPreview}
          onSubmit={handleSubmit}
          mode={mode}
        />
      )}
    </>
  );
};

export default MainForm;
