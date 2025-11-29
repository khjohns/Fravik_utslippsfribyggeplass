import { useCallback } from 'react';
import type { FormData } from '../types';

interface UseFormStateReturn {
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string }}) => void;
  handleInfraCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInfraTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

/**
 * Custom hook for managing form state changes
 * Handles general form fields, infrastructure checkboxes, and infrastructure text fields
 */
export const useFormState = (
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
): UseFormStateReturn => {

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | { target: { name: string; value: string }}) => {
    const { name, value } = e.target;

    // Check if it's a checkbox based on the event object, not type string
    if (e.target instanceof HTMLInputElement && e.target.type === 'checkbox') {
      const { checked } = e.target;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, [setFormData]);

  const handleInfraCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      infrastructure: {
        ...prev.infrastructure,
        [name]: checked
      }
    }));
  }, [setFormData]);

  const handleInfraTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      infrastructure: {
        ...prev.infrastructure,
        [name]: value
      }
    }));
  }, [setFormData]);

  return {
    handleChange,
    handleInfraCheckboxChange,
    handleInfraTextChange
  };
};
