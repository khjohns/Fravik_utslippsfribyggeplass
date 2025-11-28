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
    // Overall application status
    status: 'submitted' | 'awaiting_boi_review' | 'awaiting_ent_revision' | 'awaiting_pl_review' | 'awaiting_group_review' | 'awaiting_owner_decision' | 'approved' | 'partially_approved' | 'rejected' | '';

    // BOI Advisor Review (Section 5)
    boiDocumentationSufficient: 'yes' | 'no' | '';
    boiAssessment: string; // Either recommendation or request for more documentation
    boiRecommendation: 'approved' | 'partially_approved' | 'rejected' | ''; // Only if 'yes' above

    // Project Leader Review (Section 6)
    plDocumentationSufficient: 'yes' | 'no' | '';
    plAssessment: string; // Either recommendation or request for more documentation
    plRecommendation: 'approved' | 'partially_approved' | 'rejected' | ''; // Only if 'yes' above

    // Working Group Assessment (Section 7)
    groupRecommendation: 'approved' | 'partially_approved' | 'rejected' | '';
    groupAssessment: string;

    // Project Owner Decision (Section 8)
    ownerAgreesWithGroup: 'yes' | 'no' | '';
    ownerJustification: string; // Only required if 'no' above
  };
}
