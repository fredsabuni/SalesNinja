/**
 * Storage utilities for managing localStorage and sessionStorage operations
 * Provides type-safe storage with error handling and encryption support
 */

import { STORAGE_KEYS } from './constants';
import { EncryptionService } from './encryption';
import { createError } from './utils';

/**
 * Storage interface for type-safe operations
 */
interface StorageData {
  [STORAGE_KEYS.CURRENT_OFFICER]: string; // Officer ID
  [STORAGE_KEYS.APP_STATE]: AppStorageState;
  [STORAGE_KEYS.FORM_DRAFT]: FormDraftData;
  [STORAGE_KEYS.LAST_SYNC]: string; // ISO date string
}

interface AppStorageState {
  isOnline: boolean;
  lastSyncTime?: string;
  syncErrorCount: number;
  selectedOfficerId?: string;
}

interface FormDraftData {
  step: 'officer' | 'route' | 'details';
  officerId?: string;
  routeData?: {
    areaOfActivity: string;
    ward: string;
    gpsCoordinates?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
  };
  leadData?: {
    leadName: string;
    phoneContact: string;
    residence: string;
    interestedPhoneModel: string;
    nextContactDate: string; // ISO date string
  };
  timestamp: string; // ISO date string
}

/**
 * Storage service class
 */
export class StorageService {
  private static readonly ENCRYPTION_ENABLED = true;
  private static readonly SENSITIVE_KEYS = [
    STORAGE_KEYS.CURRENT_OFFICER,
    STORAGE_KEYS.FORM_DRAFT,
  ];

  /**
   * Set item in localStorage with optional encryption
   */
  static async setItem<K extends keyof StorageData>(
    key: K,
    value: StorageData[K]
  ): Promise<void> {
    if (!this.isStorageAvailable()) {
      throw createError('storage_error', 'localStorage is not available');
    }

    try {
      const serialized = JSON.stringify(value);
      
      if (this.ENCRYPTION_ENABLED && this.isSensitiveKey(key)) {
        const encrypted = await EncryptionService.encrypt(serialized);
        localStorage.setItem(key, encrypted);
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch (_error) {
      console.error('Error setting storage item:', _error);
      throw createError('storage_error', `Failed to store ${key}`);
    }
  }

  /**
   * Get item from localStorage with optional decryption
   */
  static async getItem<K extends keyof StorageData>(
    key: K
  ): Promise<StorageData[K] | null> {
    if (!this.isStorageAvailable()) {
      return null;
    }

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      let serialized = stored;
      
      if (this.ENCRYPTION_ENABLED && this.isSensitiveKey(key)) {
        try {
          serialized = await EncryptionService.decrypt(stored);
        } catch {
          console.warn(`Failed to decrypt ${key}, assuming plain text`);
          // Fallback to plain text for backward compatibility
        }
      }

      return JSON.parse(serialized);
    } catch (_error) {
      console.error('Error getting storage item:', _error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  static removeItem<K extends keyof StorageData>(key: K): void {
    if (!this.isStorageAvailable()) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing storage item:', error);
    }
  }

  /**
   * Clear all application data from localStorage
   */
  static clearAll(): void {
    if (!this.isStorageAvailable()) return;

    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * Get storage usage information
   */
  static getStorageInfo(): {
    used: number;
    available: number;
    percentage: number;
  } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: 0, percentage: 0 };
    }

    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate available space (5MB is typical localStorage limit)
      const estimated = 5 * 1024 * 1024; // 5MB in bytes
      const available = Math.max(0, estimated - used);
      const percentage = (used / estimated) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  /**
   * Check if localStorage is available
   */
  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if key contains sensitive data
   */
  private static isSensitiveKey(key: string): boolean {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.SENSITIVE_KEYS.includes(key as any);
  }

  /**
   * Migrate old storage format to new format
   */
  static async migrateStorage(): Promise<void> {
    if (!this.isStorageAvailable()) return;

    try {
      // Check for old format data and migrate if needed
      const oldKeys = ['leadgen_officer', 'leadgen_draft', 'leadgen_state'];
      
      for (const oldKey of oldKeys) {
        const oldData = localStorage.getItem(oldKey);
        if (oldData) {
          // Migrate to new key format
          const newKey = this.mapOldKeyToNew(oldKey);
          if (newKey) {
            localStorage.setItem(newKey, oldData);
            localStorage.removeItem(oldKey);
          }
        }
      }
    } catch (error) {
      console.error('Error migrating storage:', error);
    }
  }

  /**
   * Map old storage keys to new keys
   */
  private static mapOldKeyToNew(oldKey: string): string | null {
    const mapping: Record<string, string> = {
      'leadgen_officer': STORAGE_KEYS.CURRENT_OFFICER,
      'leadgen_draft': STORAGE_KEYS.FORM_DRAFT,
      'leadgen_state': STORAGE_KEYS.APP_STATE,
    };

    return mapping[oldKey] || null;
  }
}

/**
 * Convenience functions for common storage operations
 */

/**
 * Save current officer ID
 */
export async function saveCurrentOfficer(officerId: string): Promise<void> {
  await StorageService.setItem(STORAGE_KEYS.CURRENT_OFFICER, officerId);
}

/**
 * Get current officer ID
 */
export async function getCurrentOfficer(): Promise<string | null> {
  return await StorageService.getItem(STORAGE_KEYS.CURRENT_OFFICER);
}

/**
 * Save form draft data
 */
export async function saveFormDraft(draft: FormDraftData): Promise<void> {
  await StorageService.setItem(STORAGE_KEYS.FORM_DRAFT, {
    ...draft,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Get form draft data
 */
export async function getFormDraft(): Promise<FormDraftData | null> {
  const draft = await StorageService.getItem(STORAGE_KEYS.FORM_DRAFT);
  
  if (!draft) return null;

  // Check if draft is too old (24 hours)
  const draftTime = new Date(draft.timestamp);
  const now = new Date();
  const hoursDiff = (now.getTime() - draftTime.getTime()) / (1000 * 60 * 60);
  
  if (hoursDiff > 24) {
    await StorageService.removeItem(STORAGE_KEYS.FORM_DRAFT);
    return null;
  }

  return draft;
}

/**
 * Clear form draft
 */
export async function clearFormDraft(): Promise<void> {
  StorageService.removeItem(STORAGE_KEYS.FORM_DRAFT);
}

/**
 * Save app state
 */
export async function saveAppState(state: AppStorageState): Promise<void> {
  await StorageService.setItem(STORAGE_KEYS.APP_STATE, state);
}

/**
 * Get app state
 */
export async function getAppState(): Promise<AppStorageState | null> {
  return await StorageService.getItem(STORAGE_KEYS.APP_STATE);
}

/**
 * Save last sync time
 */
export async function saveLastSyncTime(time: Date = new Date()): Promise<void> {
  await StorageService.setItem(STORAGE_KEYS.LAST_SYNC, time.toISOString());
}

/**
 * Get last sync time
 */
export async function getLastSyncTime(): Promise<Date | null> {
  const timeString = await StorageService.getItem(STORAGE_KEYS.LAST_SYNC);
  return timeString ? new Date(timeString) : null;
}

/**
 * Session storage utilities (for temporary data)
 */
export class SessionStorageService {
  /**
   * Set item in sessionStorage
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static setItem(key: string, value: any): void {
    if (!this.isAvailable()) return;

    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error setting session storage item:', error);
    }
  }

  /**
   * Get item from sessionStorage
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static getItem<T = any>(key: string): T | null {
    if (!this.isAvailable()) return null;

    try {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting session storage item:', error);
      return null;
    }
  }

  /**
   * Remove item from sessionStorage
   */
  static removeItem(key: string): void {
    if (!this.isAvailable()) return;

    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing session storage item:', error);
    }
  }

  /**
   * Check if sessionStorage is available
   */
  static isAvailable(): boolean {
    try {
      const test = '__session_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}

// Export types for external use
export type { StorageData, AppStorageState, FormDraftData };