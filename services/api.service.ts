/**
 * React API Service - Frontend Integration
 * 
 * Dette servicet håndterer kommunikasjon mellom React-appen og Azure Functions API,
 * inkludert bygging av multipart/form-data payloads og error handling.
 */

import { FormData as AppFormData } from '../types';

/**
 * API Configuration
 */
const API_BASE_URL = '/api'; // SWA serves Functions under /api

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
  
  try {
    // Build multipart payload
    const payload = buildMultipartPayload(formData, files);
    
    console.log('Submitting application...');
    console.log('Project:', formData.projectName);
    console.log('Type:', formData.applicationType);
    console.log('Files:', {
      advisorAttachment: !!files.advisorAttachment,
      documentation: files.documentation?.length || 0,
    });
    
    // Send request
    // VIKTIG: Ikke sett Content-Type header manuelt!
    // Browser setter automatisk Content-Type: multipart/form-data med boundary
    const response = await fetch(`${API_BASE_URL}/SubmitApplication`, {
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
    
    console.log('✅ Submission successful:', data);
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
      console.log(`Submission attempt ${attempt}/${maxRetries}`);
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
        console.log(`Retrying in ${delay}ms...`);
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
    errors.push('Project name is required');
  }
  if (!formData.projectNumber) {
    errors.push('Project number is required');
  }
  if (!formData.deadline) {
    errors.push('Deadline is required');
  }
  
  // Urgent validation
  if (formData.isUrgent && !formData.urgencyReason) {
    errors.push('Urgency reason is required when marking as urgent');
  }
  
  // Machine-specific validation
  if (formData.applicationType === 'machine') {
    if (!formData.machines || formData.machines.length === 0) {
      errors.push('At least one machine is required for machine applications');
    }
    
    formData.machines?.forEach((machine, index) => {
      if (!machine.type) {
        errors.push(`Machine ${index + 1}: Type is required`);
      }
      if (!machine.startDate || !machine.endDate) {
        errors.push(`Machine ${index + 1}: Start and end dates are required`);
      }
      if (machine.reasons.length === 0) {
        errors.push(`Machine ${index + 1}: At least one reason is required`);
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
      errors.push(`Advisor attachment is too large (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`);
    }
    if (!ALLOWED_TYPES.includes(files.advisorAttachment.type)) {
      errors.push('Advisor attachment must be PDF, Word, or image file');
    }
  }
  
  // Validate documentation
  if (files.documentation) {
    files.documentation.forEach((file, index) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`Documentation file ${index + 1} is too large`);
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`Documentation file ${index + 1} has invalid type`);
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
