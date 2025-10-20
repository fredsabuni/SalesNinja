/**
 * Route Information Component - Second step of lead collection
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AppShell,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  FormField,
  StepIndicator,
  GPSCapture
} from '@/components';
import { useLeadFormStore } from '@/stores/lead-form-store';
import { routeInformationSchema, type RouteFormData } from '@/lib/schemas';

const steps = [
  { id: 'route', title: 'Route' },
  { id: 'details', title: 'Details' },
];

export const RouteInformation: React.FC = () => {
  const router = useRouter();
  const {
    selectedOfficer,
    routeData,
    updateRouteData,
    setCurrentStep,
    canProceedToNextStep,
    getNextStep,
    // getPreviousStep,
  } = useLeadFormStore();

  // Form setup
  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<RouteFormData>({
    resolver: zodResolver(routeInformationSchema),
    defaultValues: {
      areaOfActivity: routeData.areaOfActivity,
      ward: routeData.ward,
      gpsCoordinates: routeData.gpsCoordinates,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Update store when form values change
  React.useEffect(() => {
    const { areaOfActivity, ward, gpsCoordinates } = watchedValues;
    updateRouteData({ areaOfActivity, ward, gpsCoordinates });
  }, [watchedValues.areaOfActivity, watchedValues.ward, watchedValues.gpsCoordinates, updateRouteData]);

  // Auto-set current officer from localStorage
  React.useEffect(() => {
    if (!selectedOfficer) {
      // Get current officer from localStorage
      try {
        const stored = localStorage.getItem('currentOfficer');
        if (stored) {
          const officer = JSON.parse(stored);
          useLeadFormStore.getState().setSelectedOfficer(officer);
        } else {
          // No officer logged in, redirect to home
          router.push('/');
        }
      } catch {
        router.push('/');
      }
    }
  }, [selectedOfficer, router]);

  // Handle GPS location capture
  const handleLocationCapture = React.useCallback((coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => {
    setValue('gpsCoordinates', coordinates, { shouldValidate: true });
    updateRouteData({ gpsCoordinates: coordinates });
  }, [setValue, updateRouteData]);

  // Handle GPS location clear
  const handleLocationClear = React.useCallback(() => {
    setValue('gpsCoordinates', undefined, { shouldValidate: true });
    updateRouteData({ gpsCoordinates: undefined });
  }, [setValue, updateRouteData]);

  // Handle next step
  const handleNext = () => {
    if (canProceedToNextStep()) {
      const nextStep = getNextStep();
      if (nextStep) {
        setCurrentStep(nextStep);
        router.push('/lead/details');
      }
    }
  };

  // Handle previous step (go back to dashboard)
  const handlePrevious = () => {
    router.push('/');
  };

  // Handle back to dashboard
  const handleBack = () => {
    router.push('/');
  };

  if (!selectedOfficer) {
    return null; // Will redirect
  }

  return (
    <AppShell
      title="Route Information"
      showBackButton
      onBackClick={handleBack}
      isOnline={true}
      syncStatus="idle"
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={1} />

        {/* Officer Info */}
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium text-primary-900">{selectedOfficer.name}</p>
              <p className="text-sm text-primary-700">{selectedOfficer.phone}</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form className="space-y-6">
              {/* Area of Activity */}
              <FormField
                label="Area of Activity"
                placeholder="e.g., Mbezi Jogoo, Mwenge, etc."
                required
                error={errors.areaOfActivity?.message}
                {...register('areaOfActivity')}
              />

              {/* Ward */}
              <FormField
                label="Ward"
                placeholder="e.g., Ilala, Kinondoni, etc."
                required
                error={errors.ward?.message}
                {...register('ward')}
              />

              {/* GPS Coordinates Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-neutral-900">
                    GPS Coordinates
                  </label>
                  <span className="text-xs text-neutral-600">Optional</span>
                </div>

                <GPSCapture
                  onLocationCapture={handleLocationCapture}
                  onLocationClear={handleLocationClear}
                  initialCoordinates={routeData.gpsCoordinates}
                />
              </div>
            </form>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={handlePrevious}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back
              </Button>
              <Button
                fullWidth
                onClick={handleNext}
                disabled={!isValid || !canProceedToNextStep()}
              >
                Next: Lead Details
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-neutral-500">
          Provide the area and ward information to help track lead distribution.
          GPS coordinates are optional but help with route optimization.
        </div>
      </div>
    </AppShell>
  );
};