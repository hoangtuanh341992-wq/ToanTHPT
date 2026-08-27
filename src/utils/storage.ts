/**
 * DORETA'S EXAM - Centralized Persistent Storage Manager
 * Ensures zero-data-loss across page reloads, tab closes, and offline network state.
 */

export const STORAGE_KEYS = {
  QBANK: 'doreta_qbank',
  EXAMS: 'doreta_exams',
  RESULTS: 'doreta_results',
  PIN: 'doreta_pin',
  DRAFT_QUESTIONS: 'doreta_draft_questions',
  DRAFT_FORM: 'doreta_draft_form',
  ACTIVE_SESSION: 'doreta_active_session',
  IS_ADMIN: 'doreta_is_admin',
} as const;

/**
 * Safe get from LocalStorage with fallback and error handling
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[Storage] Failed to read key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Safe set to LocalStorage with quota protection & error handling
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to write key "${key}":`, error);
    return false;
  }
}

/**
 * Safe remove key from LocalStorage
 */
export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`[Storage] Failed to delete key "${key}":`, error);
  }
}

/**
 * Interface for active student exam session persistence
 */
export interface ActiveExamSession {
  exam: any;
  questions: any[];
  answers: Record<string | number, any>;
  secondsLeft: number;
  examStartTime: number;
  tabSwitchCount: number;
  studentName: string;
  studentSbd?: string; // Số báo danh
  studentClass: string;
  examCode: string;
  savedTimestamp: number;
}
