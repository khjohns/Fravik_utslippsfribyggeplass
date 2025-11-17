import { useState, useCallback, RefObject } from 'react';
import { FormData } from '../types';

type StepStatus = 'completed' | 'current' | 'incomplete';

interface StepRefs {
  '1': RefObject<HTMLFieldSetElement>;
  '2': RefObject<HTMLFieldSetElement>;
  '3': RefObject<HTMLFieldSetElement>;
  '4': RefObject<HTMLFieldSetElement>;
  '5': RefObject<HTMLFieldSetElement>;
}

/**
 * Custom hook for å håndtere stepper-navigasjon og status
 */
export const useStepperNavigation = (
  formData: FormData,
  stepRefs: StepRefs
) => {
  const [activeStep, setActiveStep] = useState('1');

  /**
   * Scroll til en spesifikk seksjon
   */
  const scrollToSection = useCallback((stepNumber: string) => {
    setActiveStep(stepNumber);
    const targetRef = stepRefs[stepNumber as keyof StepRefs];
    if (targetRef?.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [stepRefs]);

  /**
   * Bestem status for et steg basert på formdata og aktivt steg
   */
  const getStepStatus = useCallback((stepNumber: string): StepStatus => {
    const stepNum = parseInt(stepNumber);
    const activeNum = parseInt(activeStep);

    // Sjekk om steget er ferdig utfylt
    const isStepComplete = (step: string): boolean => {
      switch (step) {
        case '1': // Prosjektinformasjon
          return !!(
            formData.projectName &&
            formData.projectNumber &&
            formData.propertyNumber &&
            formData.constructionAddress &&
            formData.applicationType
          );

        case '2': // Søknadens omfang
          if (formData.applicationType === 'machine') {
            return formData.machines.length > 0;
          } else if (formData.applicationType === 'phase') {
            return !!(formData.phaseDescription && formData.phaseStartDate && formData.phaseEndDate);
          } else if (formData.applicationType === 'project') {
            return !!formData.projectJustification;
          }
          return false;

        case '3': // Grunnlag for søknaden
          if (formData.applicationType === 'machine') {
            return formData.machines.length > 0 && formData.machines.every(m =>
              m.type && m.startDate && m.endDate && m.reasons.length > 0
            );
          }
          return !!(formData.justification && formData.consequenceAssessment);

        case '4': // Konsekvenser
          return !!(formData.environmentalImpact && formData.mitigationMeasures);

        case '5': // Vurdering fra rådgiver
          return !!(formData.advisorAssessment || formData.advisorAttachment);

        default:
          return false;
      }
    };

    // Hvis steget er aktivt
    if (stepNum === activeNum) {
      return 'current';
    }

    // Hvis steget er fullført
    if (isStepComplete(stepNumber)) {
      return 'completed';
    }

    // Ellers er det ufullstendig
    return 'incomplete';
  }, [activeStep, formData]);

  return {
    activeStep,
    setActiveStep,
    scrollToSection,
    getStepStatus,
  };
};
