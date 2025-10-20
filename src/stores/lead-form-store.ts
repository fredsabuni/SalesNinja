/**
 * Zustand store for managing lead collection form state
 */

import { create } from 'zustand';
import { Officer, FormStep } from '@/types';
// import { STORAGE_KEYS } from '@/lib/constants';

interface RouteData {
  areaOfActivity: string;
  ward: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

interface LeadData {
  leadName: string;
  phoneContact: string;
  residence: string;
  interestedPhoneModel: string;
  nextContactDate: Date | string | null;
}

interface LeadFormState {
  // Current step
  currentStep: FormStep;
  
  // Form data
  selectedOfficer: Officer | null;
  routeData: RouteData;
  leadData: LeadData;
  
  // UI state
  isSubmitting: boolean;
  
  // Actions
  setCurrentStep: (step: FormStep) => void;
  setSelectedOfficer: (officer: Officer | null) => void;
  updateRouteData: (data: Partial<RouteData>) => void;
  updateLeadData: (data: Partial<LeadData>) => void;
  setIsSubmitting: (submitting: boolean) => void;
  resetForm: () => void;
  canProceedToNextStep: () => boolean;
  getNextStep: () => FormStep | null;
  getPreviousStep: () => FormStep | null;
}

const initialRouteData: RouteData = {
  areaOfActivity: '',
  ward: '',
  gpsCoordinates: undefined,
};

const initialLeadData: LeadData = {
  leadName: '',
  phoneContact: '',
  residence: '',
  interestedPhoneModel: '',
  nextContactDate: '',
};

export const useLeadFormStore = create<LeadFormState>()(
  (set, get) => ({
    // Initial state
    currentStep: 'officer',
    selectedOfficer: null,
    routeData: initialRouteData,
    leadData: initialLeadData,
    isSubmitting: false,

    // Actions
    setCurrentStep: (step) => set({ currentStep: step }),

    setSelectedOfficer: (officer) => {
      console.log('Setting selected officer:', officer);
      set({ selectedOfficer: officer });
    },

    updateRouteData: (data) =>
      set((state) => ({
        routeData: { ...state.routeData, ...data },
      })),

    updateLeadData: (data) =>
      set((state) => ({
        leadData: { ...state.leadData, ...data },
      })),

    setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),

    resetForm: () =>
      set({
        currentStep: 'officer',
        selectedOfficer: null,
        routeData: initialRouteData,
        leadData: initialLeadData,
        isSubmitting: false,
      }),

    canProceedToNextStep: () => {
      const state = get();
      
      switch (state.currentStep) {
        case 'officer':
          const canProceed = state.selectedOfficer !== null;
          console.log('Can proceed from officer step:', canProceed, 'Selected officer:', state.selectedOfficer);
          return canProceed;
        
        case 'route':
          return (
            state.routeData.areaOfActivity.trim() !== '' &&
            state.routeData.ward.trim() !== ''
          );
        
        case 'details':
          return (
            state.leadData.leadName.trim() !== '' &&
            state.leadData.phoneContact.trim() !== '' &&
            state.leadData.residence.trim() !== '' &&
            state.leadData.interestedPhoneModel.trim() !== '' &&
            (typeof state.leadData.nextContactDate === 'string' 
              ? state.leadData.nextContactDate.trim() !== '' 
              : state.leadData.nextContactDate !== null)
          );
        
        default:
          return false;
      }
    },

    getNextStep: () => {
      const state = get();
      
      switch (state.currentStep) {
        case 'officer':
          return 'route';
        case 'route':
          return 'details';
        case 'details':
          return null; // Last step
        default:
          return null;
      }
    },

    getPreviousStep: () => {
      const state = get();
      
      switch (state.currentStep) {
        case 'officer':
          return null; // First step
        case 'route':
          return 'officer';
        case 'details':
          return 'route';
        default:
          return null;
      }
    },
  })
);