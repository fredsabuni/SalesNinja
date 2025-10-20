/**
 * Lead Details Component - Final step of lead collection
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
  StepIndicator
} from '@/components';
import { NetworkStatus } from '@/components/ui/error-display';
import { ValidationSummary, ValidationError } from '@/components/ui/form-validation';
import { useToastHelpers } from '@/components/ui/toast';
import { LoadingOverlay } from '@/components/ui/loading-indicator';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { useAsyncOperation } from '@/hooks/use-loading-state';
import { FormErrorBoundary } from '@/components/form-error-boundary';
import { useErrorReporting } from '@/lib/error-reporting';
import { useLeadFormStore } from '@/stores/lead-form-store';
import { leadDetailsSchema, POPULAR_PHONE_MODELS } from '@/lib/schemas';
import { transformFormDataToLead } from '@/lib/transformers';
import { SearchableDropdown } from '@/components';
import { z } from 'zod';

const steps = [
  { id: 'route', title: 'Route' },
  { id: 'details', title: 'Details' },
];

// Use z.input<typeof leadDetailsSchema> for form
// nextContactDate is string for form/store, Date after validation in submit
type LeadDetailsFormData = z.input<typeof leadDetailsSchema>;

export const LeadDetails: React.FC = () => {
  const router = useRouter();

  // Network status
  const { isOnline, isConnected, checkConnection } = useNetworkStatus();

  // Toast notifications
  const { showSaveSuccess, showSaveError } = useToastHelpers();

  // Error reporting
  const { trackAction, reportError } = useErrorReporting();

  // Form validation errors
  const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);

  // API state for lead submission
  const saveOperation = useAsyncOperation();

  // Phone model search state
  const [phoneModelSearch, setPhoneModelSearch] = React.useState('');

  const {
    selectedOfficer,
    routeData,
    leadData,
    updateLeadData,
    setCurrentStep,
    getPreviousStep,
    resetForm,
  } = useLeadFormStore();

  // Form setup
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LeadDetailsFormData>({
    resolver: zodResolver(leadDetailsSchema),
    defaultValues: {
      leadName: leadData.leadName,
      phoneContact: leadData.phoneContact,
      residence: leadData.residence,
      interestedPhoneModel: leadData.interestedPhoneModel,
      nextContactDate: leadData.nextContactDate ? (typeof leadData.nextContactDate === 'string' ? leadData.nextContactDate : (leadData.nextContactDate instanceof Date ? leadData.nextContactDate.toISOString().substring(0, 10) : '')) : '',
    },
    mode: 'onChange',
  });

  // Watch the phone model value from the form
  const watchedPhoneModel = watch('interestedPhoneModel');

  // Create phone model options for dropdown
  const phoneModelOptions = React.useMemo(() => {
    const filteredModels = phoneModelSearch.trim()
      ? POPULAR_PHONE_MODELS.filter(model =>
        model.toLowerCase().includes(phoneModelSearch.toLowerCase())
      )
      : POPULAR_PHONE_MODELS;

    return filteredModels.map(model => ({
      value: model,
      label: model,
    }));
  }, [phoneModelSearch]);

  // Handle phone model selection
  const handlePhoneModelSelect = (model: string) => {
    updateLeadData({ interestedPhoneModel: model });
    setValue('interestedPhoneModel', model, { shouldValidate: true }); // Update form value and trigger validation
  };

  // Sync store value with form value for phone model
  React.useEffect(() => {
    if (leadData.interestedPhoneModel && leadData.interestedPhoneModel !== watchedPhoneModel) {
      setValue('interestedPhoneModel', leadData.interestedPhoneModel, { shouldValidate: true });
    }
  }, [leadData.interestedPhoneModel, setValue, watchedPhoneModel]);

  // Auto-set current officer and check route data
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
          return;
        }
      } catch {
        router.push('/');
        return;
      }
    }

    if (!routeData.areaOfActivity || !routeData.ward) {
      router.push('/lead/route');
    }
  }, [selectedOfficer, routeData.areaOfActivity, routeData.ward, router]);

  // Handle form submission
  // Submit handler - here data is of type z.output<typeof leadDetailsSchema>, nextContactDate is a Date
  const onSubmit = handleSubmit(async (data) => {
    if (!selectedOfficer) return;
    setValidationErrors([]);
    // Convert string to Date for transformer
    const leadPayload = transformFormDataToLead(
      selectedOfficer.id,
      routeData,
      { ...data, nextContactDate: new Date(data.nextContactDate) }
    );
    await saveOperation.execute(
      () => fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to save lead');
        }
        return response.json();
      }),
      {
        message: 'Saving your lead...',
        minDuration: 1000,
        onSuccess: () => {
          trackAction('lead_saved', { officerId: selectedOfficer.id });
          showSaveSuccess('lead');
          resetForm();
          router.push('/success');
        },
        onError: (error: Error) => {
          reportError(error, { component: 'LeadDetails', action: 'save_lead' }, 'high');
          showSaveError('lead', () => onSubmit());
          console.error('Failed to save lead:', error);
        },
      }
    );
  });

  // Handle previous step
  const handlePrevious = () => {
    const previousStep = getPreviousStep();
    if (previousStep) {
      setCurrentStep(previousStep);
      router.push('/lead/route');
    }
  };

  if (!selectedOfficer || !routeData.areaOfActivity) {
    return null; // Will redirect
  }

  return (
    <AppShell
      title="Lead Details"
      showBackButton
      onBackClick={() => router.push('/')}
      isOnline={isOnline}
      syncStatus="idle"
    >
      <FormErrorBoundary
        onReset={() => {
          setValidationErrors([]);
          saveOperation.reset();
        }}
        onGoBack={handlePrevious}
        fallbackTitle="Form Error"
        fallbackMessage="There was an error with the lead details form. Please try again or go back to the previous step."
      >
        <div className="space-y-6">
          {/* Network Status */}
          <NetworkStatus
            isOnline={isOnline}
            isConnected={isConnected}
            onRetryConnection={checkConnection}
          />

          {/* Step Indicator */}
          <StepIndicator steps={steps} currentStep={2} />



          {/* Context Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-900">Officer:</span>
                <span className="text-sm text-primary-700">{selectedOfficer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-primary-900">Area:</span>
                <span className="text-sm text-primary-700">{routeData.areaOfActivity}, {routeData.ward}</span>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Information</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingOverlay
                isLoading={saveOperation.isLoading}
                message={saveOperation.loadingMessage}
                progress={saveOperation.progress}
              >
                {/* Validation Summary */}
                {validationErrors.length > 0 && (
                  <ValidationSummary
                    errors={validationErrors}
                    onDismiss={() => setValidationErrors([])}
                    className="mb-6"
                  />
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                  {/* Lead Name */}
                  <FormField
                    label="Lead Name"
                    placeholder="Enter lead's full name"
                    required
                    error={errors.leadName?.message}
                    {...register('leadName')}
                  />

                  {/* Phone Contact */}
                  <FormField
                    label="Phone Number"
                    type="tel"
                    placeholder="0712345678"
                    required
                    error={errors.phoneContact?.message}
                    {...register('phoneContact', {
                      onChange: (e) => {
                        // Only allow digits and limit to 10 characters
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        e.target.value = value;
                      }
                    })}
                  />

                  {/* Residence */}
                  <FormField
                    label="Residence"
                    placeholder="Enter residence area"
                    required
                    error={errors.residence?.message}
                    {...register('residence')}
                  />

                  {/* Interested Phone Model */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-neutral-900">
                      Interested Phone Model
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <SearchableDropdown
                      placeholder="Search for a phone model..."
                      searchPlaceholder="Type to search phone models..."
                      options={phoneModelOptions}
                      value={watchedPhoneModel || leadData.interestedPhoneModel}
                      onValueChange={handlePhoneModelSelect}
                      onSearch={setPhoneModelSearch}
                      required
                      error={errors.interestedPhoneModel?.message}
                    />
                  </div>

                  {/* Next Contact Date */}
                  <FormField
                    label="Next Contact Date"
                    type="date"
                    required
                    error={errors.nextContactDate?.message}
                    {...register('nextContactDate')}
                  />

                  {/* Navigation */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={handlePrevious}
                      disabled={saveOperation.isLoading}
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
                      Previous
                    </Button>
                    <Button
                      type="submit"
                      fullWidth
                      loading={saveOperation.isLoading}
                      disabled={saveOperation.isLoading}
                    >
                      Save Lead
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
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </Button>
                  </div>
                </form>
              </LoadingOverlay>
            </CardContent>
          </Card>

          {/* Help Text */}
          <div className="text-center text-sm text-neutral-500">
            Fill in all lead details to complete the collection process.
          </div>
        </div>
      </FormErrorBoundary>
    </AppShell>
  );
};