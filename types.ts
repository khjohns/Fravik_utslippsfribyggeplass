// Fix: Removed file content delimiters from the start and end of the file.
export interface Machine {
  id: string;
  type: 'Gravemaskin' | 'Hjullaster' | 'Lift' | 'Annet' | '';
  otherType?: string;
  startDate: string;
  endDate:string;
  reasons: string[];
  marketSurveyConfirmed: boolean;
  surveyedCompanies: string;
  detailedReasoning: string;
  documentation: File | null;
  replacementMachine: string;
  replacementFuel: 'HVO100' | 'Annet biodrivstoff' | 'Diesel (Euro 6)' | '';
  workDescription: string;
  alternativeSolutions: string;
}

export interface FormData {
  // Section 1
  projectName: string;
  projectNumber: string;
  mainContractor: string;
  contractBasis: 'Kontrakt inngått FØR 1. jan 2025' | 'Kontrakt inngått ETTER 1. jan 2025' | '';

  // Section 2
  submittedBy: 'Byggherrens prosjektleder' | 'Totalentreprenør' | '';
  submitterName: string;
  primaryDriver: 'Teknisk/Markedsmessig hindring' | 'Kostnad' | 'Fremdrift' | '';
  deadline: string;
  applicationType: 'machine' | 'infrastructure' | '';
  isUrgent: boolean;
  urgencyReason: string;
  
  // Section 3A
  machines: Machine[];
  
  // Section 3B
  infrastructure: {
    powerAccessDescription: string;
    mobileBatteryConsidered: boolean;
    temporaryGridConsidered: boolean;
    projectSpecificConditions: string;
    costAssessment: string;
    infrastructureReplacement: string;
    alternativeMethods: string;
  };
  
  // Section 4
  mitigatingMeasures: string;
  consequencesOfRejection: string;
  
  // Section 5
  advisorAssessment: string;
  advisorAttachment: File | null;
}
