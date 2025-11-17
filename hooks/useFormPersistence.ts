import { useState, useEffect } from 'react';
import { FormData } from '../types';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'fravik-form-draft';
const AUTOSAVE_DELAY = 2000; // 2 sekunder
const MAX_AGE_DAYS = 7;

interface StoredFormData {
  data: FormData;
  timestamp: number;
}

/**
 * Custom hook for å håndtere form persistence i localStorage
 * Auto-lagrer formdata hvert 2. sekund og laster inn tidligere data ved oppstart
 */
export const useFormPersistence = (initialData: FormData) => {
  const [formData, setFormData] = useState<FormData>(() => {
    // Prøv å laste fra localStorage ved mount
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StoredFormData = JSON.parse(saved);

        // Sjekk om lagrede data er nylige (< 7 dager gamle)
        const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        if (parsed.timestamp && Date.now() - parsed.timestamp < maxAge) {
          logger.log('Lastet lagret formdata fra localStorage');
          return parsed.data;
        } else {
          logger.log('Lagrede data er for gamle, bruker initial data');
        }
      }
    } catch (e) {
      logger.error('Kunne ikke parse lagrede formdata:', e);
    }

    return initialData;
  });

  const [hasSavedData, setHasSavedData] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StoredFormData = JSON.parse(saved);
        const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
        return parsed.timestamp && Date.now() - parsed.timestamp < maxAge;
      }
    } catch {
      return false;
    }
    return false;
  });

  // Autosave til localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const dataToSave: StoredFormData = {
          data: formData,
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        setHasSavedData(true);
      } catch (e) {
        logger.error('Kunne ikke lagre formdata til localStorage:', e);
      }
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [formData]);

  // Fjern lagrede data
  const clearSaved = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasSavedData(false);
      logger.log('Fjernet lagrede formdata');
    } catch (e) {
      logger.error('Kunne ikke fjerne lagrede formdata:', e);
    }
  };

  return { formData, setFormData, clearSaved, hasSavedData };
};
