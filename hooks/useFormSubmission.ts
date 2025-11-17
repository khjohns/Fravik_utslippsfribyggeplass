import { useState } from 'react';
import { FormData } from '../types';
import { submitApplication } from '../services/api.service';

export type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success'; message: string }
  | { status: 'error'; error: string };

/**
 * Custom hook for å håndtere form submission
 */
export const useFormSubmission = () => {
  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });

  const handleSubmit = async (
    formData: FormData,
    files: { advisorAttachment?: File; documentation?: File[] },
    onSuccess?: () => void
  ) => {
    setSubmissionState({ status: 'submitting' });

    try {
      // Valider at påkrevde felt er utfylt
      if (!formData.projectName || !formData.projectNumber) {
        throw new Error('Prosjektnavn og prosjektnummer er påkrevd');
      }

      if (formData.applicationType === 'machine' && formData.machines.length === 0) {
        throw new Error('Du må legge til minst én maskin');
      }

      if (!formData.advisorAssessment && !formData.advisorAttachment) {
        throw new Error('Du må legge til vurdering fra rådgiver (tekst eller fil)');
      }

      // Send inn søknaden
      const response = await submitApplication(formData, files);

      setSubmissionState({
        status: 'success',
        message: response.message || 'Søknaden ble sendt inn!',
      });

      // Kall onSuccess callback hvis den finnes
      if (onSuccess) {
        onSuccess();
      }

      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'En ukjent feil oppstod';

      setSubmissionState({
        status: 'error',
        error: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  const resetSubmissionState = () => {
    setSubmissionState({ status: 'idle' });
  };

  return {
    submissionState,
    handleSubmit,
    resetSubmissionState,
  };
};
