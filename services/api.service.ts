/**
 * React API Service - Frontend Integration
 *
 * Dette servicet håndterer kommunikasjon mellom React-appen og Azure Functions API,
 * inkludert bygging av multipart/form-data payloads og error handling.
 */

import { FormData as AppFormData } from '../types';
import { logger } from '../utils/logger';

/**
 * API Configuration
 *
 * For lokal utvikling med ngrok:
 * - Sett VITE_API_URL i .env til din ngrok URL (f.eks. https://abc123.ngrok.io/api)
 * - Sett VITE_MOCK_API=false for å bruke ekte backend
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const MOCK_API = import.meta.env.VITE_MOCK_API !== 'false'; // Standard: true (mock mode)

async function mockSubmit(payload: FormData): Promise<SubmitResponse> {
  logger.log("MOCK SUBMIT:", payload);

  // Simuler en forsinkelse
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simuler suksess
  return {
    success: true,
    id: 12345,
    status: 'submitted',
    message: 'Søknad (MOCK) sendt inn!',
    idempotencyKey: 'mock-key-123',
    submittedBy: 'test@bruker.no',
    submittedAt: new Date().toISOString(),
  };

  /*
  // Simuler en feil
  throw new APIError(
    'Dette er en dummy-feilmelding.',
    500,
    'MockError',
    'Mer detaljer om feilen her.'
  );
  */
}
// SLUTT PÅ DUMMY-KODE

/**
 * API Response Types
 */
interface SubmitResponse {
  success: boolean;
  id: number;
  status: string;
  message: string;
  idempotencyKey: string;
  submittedBy: string;
  submittedAt: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  details?: string;
  applicationId?: number;
}

/**
 * Custom Error Class for API Errors
 */
export class APIError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: string;
  public applicationId?: number;

  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    details?: string,
    applicationId?: number
  ) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.applicationId = applicationId;
  }
}

/**
 * Generate idempotency key for preventing duplicate submissions
 * 
 * Bruker kombinasjon av timestamp og random for å sikre unikhet
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Build multipart/form-data payload from FormData
 * 
 * Dette er kjernen i multipart-implementeringen på frontend-siden.
 * Vi bygger en FormData-instans (browser API) som inneholder både
 * JSON-data og filer.
 */
export function buildMultipartPayload(
  formData: AppFormData,
  files: {
    advisorAttachment?: File;
    documentation?: File[];
  }
): FormData {
  
  const payload = new FormData(); // Browser FormData API
  
  // 1. Add idempotency key if not present
  const dataWithKey = {
    ...formData,
    idempotencyKey: formData.idempotencyKey || generateIdempotencyKey(),
  };
  
  // 2. Add JSON data as a single part
  // VIKTIG: Vi serialiserer alt unntatt filer til JSON
  const jsonData = JSON.stringify(dataWithKey);
  payload.append('application', jsonData);
  
  // 3. Add files as separate parts
  if (files.advisorAttachment) {
    payload.append('advisorAttachment', files.advisorAttachment);
  }
  
  if (files.documentation && files.documentation.length > 0) {
    files.documentation.forEach((file, index) => {
      payload.append(`documentation_${index}`, file);
    });
  }
  
  return payload;
}

/**
 * Submit application to API
 * 
 * @param formData - Application form data
 * @param files - Files to upload
 * @returns Submission response
 * @throws APIError on failure
 */
export async function submitApplication(
  formData: AppFormData,
  files: {
    advisorAttachment?: File;
    documentation?: File[];
  }
): Promise<SubmitResponse> {

  // MIDLERTIDIG DUMMY-KODE FOR TESTING
  if (MOCK_API) {
    const payload = buildMultipartPayload(formData, files);
    return mockSubmit(payload);
  }
  // SLUTT PÅ DUMMY-KODE

  try {
    // Build multipart payload
    const payload = buildMultipartPayload(formData, files);

    logger.log('Submitting application...');
    logger.log('Project:', formData.projectName);
    logger.log('Type:', formData.applicationType);
    logger.log('Files:', {
      advisorAttachment: !!files.advisorAttachment,
      documentation: files.documentation?.length || 0,
    });

    // Send request
    // VIKTIG: Ikke sett Content-Type header manuelt!
    // Browser setter automatisk Content-Type: multipart/form-data med boundary
    const response = await fetch(`${API_BASE_URL}/submit`, {
      method: 'POST',
      body: payload,
      // credentials: 'include', // Hvis du trenger cookies
    });
    
    // Parse response
    const data = await response.json();
    
    // Handle errors
    if (!response.ok) {
      const errorData = data as ErrorResponse;
      throw new APIError(
        errorData.message || 'Submission failed',
        response.status,
        errorData.error || 'UnknownError',
        errorData.details,
        errorData.applicationId
      );
    }

    logger.log('✅ Submission successful:', data);
    return data as SubmitResponse;
    
  } catch (error) {
    // Re-throw APIError
    if (error instanceof APIError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError) {
      throw new APIError(
        'Network error. Please check your connection.',
        0,
        'NetworkError'
      );
    }
    
    // Handle other errors
    throw new APIError(
      'An unexpected error occurred',
      500,
      'UnknownError',
      (error as Error).message
    );
  }
}

/**
 * Health check - Test API connectivity
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/Health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Retry logic wrapper (for transient failures)
 * 
 * Brukes for å håndtere midlertidige feil som network timeouts
 */
export async function submitApplicationWithRetry(
  formData: AppFormData,
  files: {
    advisorAttachment?: File;
    documentation?: File[];
  },
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<SubmitResponse> {
  
  let lastError: APIError | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`Submission attempt ${attempt}/${maxRetries}`);
      return await submitApplication(formData, files);
      
    } catch (error) {
      lastError = error as APIError;
      
      // Don't retry on client errors (4xx)
      if (lastError.statusCode >= 400 && lastError.statusCode < 500) {
        throw lastError;
      }
      
      // Don't retry if this was a duplicate (idempotency key matched)
      if (lastError.errorCode === 'DuplicateSubmission') {
        throw lastError;
      }
      
      // Wait before retry (with exponential backoff)
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        logger.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries failed
  throw lastError!;
}

/**
 * Validation helpers (run before submission)
 */
export function validateFormData(formData: AppFormData): string[] {
  const errors: string[] = [];

  // Required fields
  if (!formData.projectName) {
    errors.push('Prosjektnavn er påkrevd');
  }
  if (!formData.projectNumber) {
    errors.push('Prosjektnummer er påkrevd');
  }
  if (!formData.deadline) {
    errors.push('Frist for svar er påkrevd');
  }

  // Urgent validation
  if (formData.isUrgent && !formData.urgencyReason) {
    errors.push('Begrunnelse for hastebehandling er påkrevd');
  }

  // Machine-specific validation
  if (formData.applicationType === 'machine') {
    if (!formData.machines || formData.machines.length === 0) {
      errors.push('Minst én maskin er påkrevd for maskinsøknader');
    }

    formData.machines?.forEach((machine, index) => {
      if (!machine.type) {
        errors.push(`Maskin ${index + 1}: Maskintype er påkrevd`);
      }
      if (!machine.startDate || !machine.endDate) {
        errors.push(`Maskin ${index + 1}: Start- og sluttdato er påkrevd`);
      }
      if (machine.reasons.length === 0) {
        errors.push(`Maskin ${index + 1}: Minst én begrunnelse er påkrevd`);
      }
    });
  }

  return errors;
}

/**
 * File size validation
 */
export function validateFiles(files: {
  advisorAttachment?: File;
  documentation?: File[];
}): string[] {
  
  const errors: string[] = [];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ];
  
  // Validate advisor attachment
  if (files.advisorAttachment) {
    if (files.advisorAttachment.size > MAX_FILE_SIZE) {
      errors.push(`Rådgivervedlegg er for stort (maks ${MAX_FILE_SIZE / 1024 / 1024} MB)`);
    }
    if (!ALLOWED_TYPES.includes(files.advisorAttachment.type)) {
      errors.push('Rådgivervedlegg må være PDF, Word eller bildefil');
    }
  }

  // Validate documentation
  if (files.documentation) {
    files.documentation.forEach((file, index) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`Dokumentasjonsfil ${index + 1} er for stor`);
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`Dokumentasjonsfil ${index + 1} har ugyldig filtype`);
      }
    });
  }
  
  return errors;
}

/**
 * Complete validation before submission
 */
export function validateBeforeSubmit(
  formData: AppFormData,
  files: {
    advisorAttachment?: File;
    documentation?: File[];
  }
): { valid: boolean; errors: string[] } {
  
  const dataErrors = validateFormData(formData);
  const fileErrors = validateFiles(files);
  const allErrors = [...dataErrors, ...fileErrors];
  
  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Export all functions
 */
export default {
  submitApplication,
  submitApplicationWithRetry,
  checkAPIHealth,
  validateFormData,
  validateFiles,
  validateBeforeSubmit,
  buildMultipartPayload,
  generateIdempotencyKey,
};
