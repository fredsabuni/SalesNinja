/**
 * Officer Selection Component - First step of lead collection
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  AppShell,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  SearchableDropdown,
  StepIndicator
} from '@/components';
import { NetworkStatus } from '@/components/ui/error-display';
import { useToastHelpers } from '@/components/ui/toast';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { useLeadFormStore } from '@/stores/lead-form-store';
import { getCurrentDealer } from '@/lib/auth';
import { Officer } from '@/types';


const steps = [
  { id: 'officer', title: 'Officer' },
  { id: 'route', title: 'Route' },
  { id: 'details', title: 'Details' },
];

export const OfficerSelection: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');

  // Get current dealer for filtering officers
  const currentDealer = getCurrentDealer();

  // Network status
  const { isOnline, isConnected, checkConnection } = useNetworkStatus();

  // Toast notifications
  const { showLoadingError } = useToastHelpers();

  // Officers state
  const [officers, setOfficers] = React.useState<Officer[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Form state
  const {
    selectedOfficer,
    setSelectedOfficer,
    setCurrentStep,
    // canProceedToNextStep,
    // getNextStep,
  } = useLeadFormStore();

  // Load officers function
  const loadOfficers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Load officers filtered by current dealer
      let url = '/api/officers';
      if (currentDealer) {
        url += `?dealer_id=${currentDealer.id}`;
      } else {
        // Fallback to public access if no dealer authenticated
        url += '?public=true';
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load officers: ${response.status}`);
      }
      const data = await response.json();
      setOfficers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load officers';
      setError(errorMessage);
      showLoadingError('officers');
    } finally {
      setLoading(false);
    }
  }, [currentDealer, showLoadingError]);

  // Load officers on component mount
  React.useEffect(() => {
    loadOfficers();
  }, [loadOfficers]);

  // Filter officers based on search query
  const filteredOfficers = React.useMemo(() => {
    if (!officers.length) return [];

    if (!searchQuery.trim()) return officers;

    const query = searchQuery.toLowerCase();
    return officers.filter(officer =>
      officer.name.toLowerCase().includes(query) ||
      officer.phone.toLowerCase().includes(query)
    );
  }, [officers, searchQuery]);

  // Convert officers to dropdown options
  const officerOptions = React.useMemo(() => {
    return filteredOfficers.map(officer => ({
      value: officer.id,
      label: officer.name,
      description: officer.phone,
    }));
  }, [filteredOfficers]);

  // Handle officer selection
  const handleOfficerSelect = (officerId: string) => {
    const officer = officers.find(o => o.id === officerId);
    if (officer) {
      console.log('Officer selected:', officer);
      setSelectedOfficer(officer);
    }
  };

  // Handle next step
  const handleNext = () => {
    console.log('Next button clicked. Selected officer:', selectedOfficer);

    if (selectedOfficer) {
      console.log('Navigating to /lead/route');
      setCurrentStep('route');
      router.push('/lead/route');
    } else {
      console.log('No officer selected');
    }
  };

  // Handle back to dashboard
  const handleBack = () => {
    router.push('/');
  };

  // Handle retry on error
  const handleRetry = () => {
    loadOfficers();
  };

  return (
    <AppShell
      title="New Lead"
      showBackButton
      onBackClick={handleBack}
      isOnline={isOnline}
      syncStatus="idle"
    >
      <div className="space-y-6">
        {/* Network Status */}
        <NetworkStatus
          isOnline={isOnline}
          isConnected={isConnected}
          onRetryConnection={checkConnection}
        />

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={1} />

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Select Officer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <svg className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900 mb-1">Failed to load officers</h4>
                    <p className="text-sm text-red-700 mb-3">{error}</p>
                    <Button size="sm" variant="outline" onClick={handleRetry} loading={loading}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Officer Selection */}
            <div className="space-y-4">
              {loading && officers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-2 text-neutral-600">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading officers...
                  </div>
                </div>
              ) : !loading && officers.length === 0 && !error ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">No officers found</h3>
                  <p className="text-neutral-600 mb-4">Unable to load officer data. Please check your connection and try again.</p>
                  <Button variant="outline" onClick={handleRetry}>Refresh</Button>
                </div>
              ) : (
                <SearchableDropdown
                  label="Choose your officer profile"
                  placeholder="Select an officer..."
                  searchPlaceholder="Search by name or phone..."
                  options={officerOptions}
                  value={selectedOfficer?.id || ''}
                  onValueChange={handleOfficerSelect}
                  onSearch={setSearchQuery}
                  loading={loading}
                  required
                  error={!selectedOfficer && filteredOfficers.length > 0 ? 'Please select an officer to continue' : undefined}
                />
              )}

              {/* Selected Officer Info */}
              {selectedOfficer && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
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
                    <div className="flex-1">
                      <h4 className="font-semibold text-primary-900">
                        {selectedOfficer.name}
                      </h4>
                      <p className="text-sm text-primary-700">
                        {selectedOfficer.phone}
                      </p>
                      <p className="text-sm text-primary-600">
                        Officer ID: {selectedOfficer.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={handleBack}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleNext}
                disabled={!selectedOfficer || loading}
              >
                Next: Route Info
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
          Select your officer profile to track who collected this lead data.
        </div>
      </div>
    </AppShell>
  );
};