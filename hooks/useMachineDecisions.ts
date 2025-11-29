import { useEffect } from 'react';
import type { FormData } from '../types';

/**
 * Custom hook for automatically calculating groupRecommendation
 * based on individual machine decisions
 *
 * Logic:
 * - All machines approved → groupRecommendation: 'approved'
 * - All machines rejected → groupRecommendation: 'rejected'
 * - Mixed decisions → groupRecommendation: 'partially_approved'
 *
 * Only applies to machine applications
 */
export const useMachineDecisions = (
  formData: FormData,
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
): void => {

  useEffect(() => {
    // Only calculate for machine applications with machines
    if (formData.applicationType !== 'machine' || formData.machines.length === 0) {
      return;
    }

    const decisions = formData.processing.machineDecisions;
    if (!decisions) {
      return;
    }

    // Get all machine decisions
    const machineDecisions = formData.machines.map(m => decisions[m.id]?.decision).filter(Boolean);

    // If no decisions have been made yet, don't update
    if (machineDecisions.length === 0) {
      return;
    }

    // Calculate overall recommendation
    let newRecommendation: 'approved' | 'partially_approved' | 'rejected' | '' = '';

    const approvedCount = machineDecisions.filter(d => d === 'approved').length;
    const rejectedCount = machineDecisions.filter(d => d === 'rejected').length;
    const totalDecisions = machineDecisions.length;

    if (totalDecisions === formData.machines.length) {
      // All machines have been decided
      if (approvedCount === formData.machines.length) {
        newRecommendation = 'approved';
      } else if (rejectedCount === formData.machines.length) {
        newRecommendation = 'rejected';
      } else {
        newRecommendation = 'partially_approved';
      }

      // Update groupRecommendation if it's different
      if (newRecommendation !== formData.processing.groupRecommendation) {
        setFormData(prev => ({
          ...prev,
          processing: {
            ...prev.processing,
            groupRecommendation: newRecommendation
          }
        }));
      }
    }
  }, [formData.applicationType, formData.machines, formData.processing.machineDecisions, formData.processing.groupRecommendation, setFormData]);
};
