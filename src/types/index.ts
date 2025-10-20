// Core data models for the lead generation tool

export interface Dealer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface Officer {
  id: string;
  name: string;
  phone: string;
  dealer_id: string;
  dealer?: Dealer;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  officer_id: string;
  officer?: Officer;
  
  // Route Information
  area_of_activity: string;
  ward: string;
  gps_latitude?: number;
  gps_longitude?: number;
  gps_accuracy?: number;
  
  // Lead Details
  lead_name: string;
  phone_contact: string;
  residence: string;
  interested_phone_model: string;
  next_contact_date: string;
  
  // Metadata
  created_at: string;
  updated_at: string;
}





// Form data interfaces
export interface OfficerSelectionForm {
  officerId: string;
}

export interface RouteInformationForm {
  areaOfActivity: string;
  ward: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface LeadDetailsForm {
  leadName: string;
  phoneContact: string;
  residence: string;
  interestedPhoneModel: string;
  nextContactDate: Date;
}

// Application state interfaces
export interface AppState {
  currentOfficer: Officer | null;
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error';
  pendingSyncCount: number;
}

// Error types
export type ErrorType = 
  | 'network_error'
  | 'validation_error'
  | 'storage_error'
  | 'api_error'
  | 'permission_error'
  | 'unknown_error';

export interface AppError {
  type: ErrorType;
  message: string;
  details?: string;
  timestamp: Date;
}

// Configuration interfaces
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface DatabaseConfig {
  name: string;
  version: number;
  stores: {
    leads: string;
    officers: string;
    syncQueue: string;
  };
}

// Utility types
export type FormStep = 'officer' | 'route' | 'details';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';