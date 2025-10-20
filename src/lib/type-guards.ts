/**
 * Type guards and validation utilities
 */

import { Officer, Lead, ErrorType, FormStep, LoadingState } from '@/types';

/**
 * Type guard for Officer
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isOfficer(obj: any): obj is Officer {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.phone === 'string' &&
    typeof obj.dealer_id === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

/**
 * Type guard for Lead
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isLead(obj: any): obj is Lead {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.officer_id === 'string' &&
    typeof obj.area_of_activity === 'string' &&
    typeof obj.ward === 'string' &&
    typeof obj.lead_name === 'string' &&
    typeof obj.phone_contact === 'string' &&
    typeof obj.residence === 'string' &&
    typeof obj.interested_phone_model === 'string' &&
    typeof obj.next_contact_date === 'string' &&
    typeof obj.created_at === 'string' &&
    typeof obj.updated_at === 'string'
  );
}

// Removed SyncQueueItem type guard as we're using direct Supabase integration

/**
 * Type guard for ErrorType
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isErrorType(value: any): value is ErrorType {
  return [
    'network_error',
    'validation_error',
    'storage_error',
    'api_error',
    'permission_error',
    'unknown_error'
  ].includes(value);
}

/**
 * Type guard for FormStep
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isFormStep(value: any): value is FormStep {
  return ['officer', 'route', 'details'].includes(value);
}

/**
 * Type guard for LoadingState
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isLoadingState(value: any): value is LoadingState {
  return ['idle', 'loading', 'success', 'error'].includes(value);
}

/**
 * Validate GPS coordinates
 */
export function isValidGPSCoordinates(
  latitude: number,
  longitude: number
): boolean {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (typeof phone !== 'string') return false;
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Check if it's a valid international format
  const internationalPattern = /^\+[1-9]\d{1,14}$/;
  
  // Check if it's at least 10 digits (without country code)
  const minDigits = cleaned.replace(/\+/g, '').length >= 10;
  
  return internationalPattern.test(cleaned) || minDigits;
}

/**
 * Validate email format (if needed for future features)
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: Date): boolean {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return false;
  }
  
  return date.getTime() > Date.now();
}

/**
 * Check if string is not empty or just whitespace
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isNonEmptyString(value: any): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a positive number
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isPositiveNumber(value: any): value is number {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  if (typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if object has required properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasRequiredProperties<T extends Record<string, any>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  requiredProps: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') return false;
  
  return requiredProps.every(prop => prop in obj);
}

/**
 * Sanitize and validate input string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sanitizeString(input: any, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if device supports geolocation
 */
export function supportsGeolocation(): boolean {
  return isBrowser() && 'geolocation' in navigator;
}

/**
 * Check if device supports service workers
 */
export function supportsServiceWorker(): boolean {
  return isBrowser() && 'serviceWorker' in navigator;
}

/**
 * Check if device supports IndexedDB
 */
export function supportsIndexedDB(): boolean {
  return isBrowser() && 'indexedDB' in window;
}