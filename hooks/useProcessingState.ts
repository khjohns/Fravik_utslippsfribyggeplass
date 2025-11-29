import { useCallback } from 'react';
import type { FormData } from '../types';

interface UseProcessingStateReturn {
  handleProcessingChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string }}) => void;
  handleMachineDecisionChange: (machineId: string, field: 'decision' | 'comment', value: string) => void;
}

/**
 * Custom hook for managing processing (internal review) state changes
 * Handles BOI, PL, Working Group, and Project Owner fields
 * Also handles machine-specific decisions for working group
 */
export const useProcessingState = (
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
): UseProcessingStateReturn => {

  const handleProcessingChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string }}) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        [name]: value
      }
    }));
  }, [setFormData]);

  const handleMachineDecisionChange = useCallback((machineId: string, field: 'decision' | 'comment', value: string) => {
    setFormData(prev => ({
      ...prev,
      processing: {
        ...prev.processing,
        machineDecisions: {
          ...prev.processing.machineDecisions,
          [machineId]: {
            ...prev.processing.machineDecisions?.[machineId],
            [field]: value
          }
        }
      }
    }));
  }, [setFormData]);

  return {
    handleProcessingChange,
    handleMachineDecisionChange
  };
};
