/**
 * Logger utility for å håndtere logging basert på miljø
 * I produksjon logges kun errors, i utvikling logges alt
 */

const isDev = import.meta.env.DEV;

export const logger = {
  /**
   * Logg generell informasjon (kun i development)
   */
  log: (...args: any[]) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Logg advarsler (kun i development)
   */
  warn: (...args: any[]) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Logg errors (alltid, også i produksjon)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Logg debug informasjon (kun i development)
   */
  debug: (...args: any[]) => {
    if (isDev) {
      console.debug(...args);
    }
  },

  /**
   * Logg info med ikon (kun i development)
   */
  info: (...args: any[]) => {
    if (isDev) {
      console.info(...args);
    }
  },
};
