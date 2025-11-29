import { useState, useCallback } from 'react';
import type { FormData, SubmissionMeta } from '../types';
import { submitApplicationWithRetry, validateBeforeSubmit, APIError } from '../services/api.service';
import { logger } from '../utils/logger';

type SubmissionState =
  | { status: 'idle' }
  | { status: 'validating' }
  | { status: 'submitting'; progress: number }
  | { status: 'success'; applicationId: number }
  | { status: 'error'; error: string };

interface UseFormSubmissionReturn {
  submissionState: SubmissionState;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setSubmissionState: React.Dispatch<React.SetStateAction<SubmissionState>>;
}

/**
 * Custom hook for managing form submission
 * Handles validation, API submission with retry logic, and submission state
 */
export const useFormSubmission = (
  formData: FormData,
  files: { advisorAttachment?: File; documentation?: File[] },
  submissionContext: SubmissionMeta,
  clearSaved: () => void
): UseFormSubmissionReturn => {

  const [submissionState, setSubmissionState] = useState<SubmissionState>({ status: 'idle' });

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
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

      // Merge formData with submissionContext
      const submissionData = {
        ...formData,
        submissionMeta: submissionContext
      };

      // Submit application
      const response = await submitApplicationWithRetry(
        submissionData as any, // Type assertion needed due to added meta field
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

      logger.log('✅ Application submitted:', response);

      // Clear saved data from localStorage
      clearSaved();

    } catch (error) {
      const apiError = error as APIError;

      logger.error('❌ Submission failed:', apiError);

      setSubmissionState({
        status: 'error',
        error: apiError.message + (apiError.details ? `\n\n${apiError.details}` : ''),
      });
    }
  }, [formData, files, submissionContext, clearSaved]);

  return {
    submissionState,
    handleSubmit,
    setSubmissionState
  };
};
