import { RetryConfig, DatabaseConfig } from '@/types';

// Sync status constants
export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  FAILED: 'failed',
} as const;

// Form step constants
export const FORM_STEPS = {
  OFFICER: 'officer',
  ROUTE: 'route',
  DETAILS: 'details',
} as const;

// Error type constants
export const ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  VALIDATION_ERROR: 'validation_error',
  STORAGE_ERROR: 'storage_error',
  API_ERROR: 'api_error',
  PERMISSION_ERROR: 'permission_error',
  UNKNOWN_ERROR: 'unknown_error',
} as const;

// Loading state constants
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

// Retry configuration
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
};

// Database configuration
export const DATABASE_CONFIG: DatabaseConfig = {
  name: 'LeadGenerationDB',
  version: 1,
  stores: {
    leads: 'leads',
    officers: 'officers',
    syncQueue: 'syncQueue',
  },
};

// API endpoints (will be configured via environment variables)
export const API_ENDPOINTS = {
  OFFICERS: '/api/officers',
  LEADS: '/api/leads',
  SYNC: '/api/sync',
  N8N_WEBHOOK: process.env.N8N_WEBHOOK_URL || '',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  CURRENT_OFFICER: 'leadgen_current_officer',
  APP_STATE: 'leadgen_app_state',
  FORM_DRAFT: 'leadgen_form_draft',
  LAST_SYNC: 'leadgen_last_sync',
} as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please select a valid date',
  FUTURE_DATE: 'Date must be in the future',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must be no more than ${max} characters`,
  INVALID_GPS: 'Invalid GPS coordinates',
} as const;

// UI constants
export const UI_CONSTANTS = {
  MIN_TOUCH_TARGET: 44, // pixels
  MOBILE_BREAKPOINT: 768, // pixels
  TABLET_BREAKPOINT: 1024, // pixels
  MAX_CONTENT_WIDTH: 448, // pixels (max-w-md)
  ANIMATION_DURATION: 200, // milliseconds
} as const;

// GPS constants
export const GPS_CONSTANTS = {
  TIMEOUT: 10000, // 10 seconds
  MAX_AGE: 300000, // 5 minutes
  HIGH_ACCURACY: true,
  ACCURACY_THRESHOLD: 100, // meters
} as const;

// Sync constants
export const SYNC_CONSTANTS = {
  BATCH_SIZE: 10,
  SYNC_INTERVAL: 30000, // 30 seconds
  OFFLINE_CHECK_INTERVAL: 5000, // 5 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_BASE: 1000, // 1 second
} as const;

// Phone number patterns
export const PHONE_PATTERNS = {
  INTERNATIONAL: /^\+[1-9]\d{1,14}$/,
  DIGITS_ONLY: /^\d+$/,
  FORMATTED: /^\+?[\d\s\-\(\)]+$/,
} as const;

// Date formats
export const DATE_FORMATS = {
  API: 'yyyy-MM-dd',
  DISPLAY: 'MMM dd, yyyy',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  TIME: 'HH:mm',
} as const;

// Application metadata
export const APP_METADATA = {
  NAME: 'Lead Generation Tool',
  VERSION: '1.0.0',
  DESCRIPTION: 'Mobile-first lead generation tool with Notion integration',
  AUTHOR: 'Sales Team',
} as const;

// Feature flags (for progressive enhancement)
export const FEATURE_FLAGS = {
  GPS_ENABLED: true,
  OFFLINE_MODE: true,
  PUSH_NOTIFICATIONS: false,
  ANALYTICS: false,
  DEBUG_MODE: process.env.NODE_ENV === 'development',
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  FIRST_CONTENTFUL_PAINT: 1500, // ms
  LARGEST_CONTENTFUL_PAINT: 2500, // ms
  CUMULATIVE_LAYOUT_SHIFT: 0.1,
  FIRST_INPUT_DELAY: 100, // ms
} as const;

// Cache durations
export const CACHE_DURATIONS = {
  OFFICERS: 3600000, // 1 hour
  STATIC_ASSETS: 86400000, // 24 hours
  API_RESPONSES: 300000, // 5 minutes
} as const;