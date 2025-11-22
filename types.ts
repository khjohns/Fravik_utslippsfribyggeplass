// Fix: Removed file content delimiters from the start and end of the file.
export interface SubmissionMeta {
  source: 'catenda' | 'standalone' | 'invited' | 'processing';
  submissionId?: string; // Internal UUID for storage (CSV/Dataverse)
  externalCaseId?: string; // For Catenda
  projectId?: string;
  originUrl?: string;
  // If authenticated via EntraID/Catenda or other means:
  user?: {
    name: string;
    email: string;
  };
}

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
  frameworkAgreement: 'Ikke aktuelt' | 'Grunnarbeider' | 'Utomhusarbeider' | 'Sammensatte håndverkertjenester' | '';
  mainContractor: string;

  // Section 2
  submitterName: string;
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

  // Processing Tab (Internal use - Oslobygg KF)
  processing: {
    groupAssessment: string;
    projectLeaderDecision: 'approved' | 'rejected' | '';
    decisionComment: string;
  };
}
