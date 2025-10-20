'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, Button, StepIndicator, FormField } from '@/components';
import { NetworkStatus } from '@/components/ui/error-display';
import { Skeleton } from '@/components/ui/loading-indicator';
// import { useToast } from '@/components/ui/toast';
// import { useApi } from '@/hooks/use-api';
import { useNetworkStatus } from '@/hooks/use-network-status';
import { Officer, Lead } from '@/types';

// Simple officer login functions
function getCurrentOfficer(): Officer | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('currentOfficer');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function setCurrentOfficer(officer: Officer) {
  localStorage.setItem('currentOfficer', JSON.stringify(officer));
}

function clearCurrentOfficer() {
  localStorage.removeItem('currentOfficer');
}

// Officer Login Component
function OfficerLogin({ onLogin }: { onLogin: (officer: Officer) => void }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Normalize phone number to +255 format
      let normalizedPhone = phone.replace(/\D/g, '');

      if (normalizedPhone.startsWith('0')) {
        // 0714276444 -> 714276444 -> +255714276444
        normalizedPhone = '255' + normalizedPhone.substring(1);
      } else if (normalizedPhone.startsWith('255')) {
        // 255714276444 -> +255714276444
        normalizedPhone = normalizedPhone;
      } else if (normalizedPhone.length === 9) {
        // 714276444 -> +255714276444
        normalizedPhone = '255' + normalizedPhone;
      } else {
        // Default: assume it needs 255 prefix
        normalizedPhone = '255' + normalizedPhone;
      }

      normalizedPhone = '+' + normalizedPhone;

      // Find officer by phone
      const response = await fetch('/api/officers?public=true');
      const officers = await response.json();

      // Debug: log what we're looking for and what we have
      console.log('Looking for phone:', normalizedPhone);
      console.log('Available officers:', officers.map((o: Officer) => ({ name: o.name, phone: o.phone })));

      // Try to find officer with flexible phone matching
      let officer = officers.find((o: Officer) => o.phone === normalizedPhone);

      // If not found, try other formats
      if (!officer) {
        const phoneWithoutPlus = normalizedPhone.replace('+', '');
        const phoneWithoutCountryCode = normalizedPhone.replace('+255', '0');
        const phoneJustDigits = normalizedPhone.replace(/\D/g, '').substring(3); // Remove +255

        officer = officers.find((o: Officer) =>
          o.phone === phoneWithoutPlus ||
          o.phone === phoneWithoutCountryCode ||
          o.phone === ('0' + phoneJustDigits) ||
          o.phone === phoneJustDigits
        );

        if (officer) {
          console.log('Found officer with alternative format:', officer.phone);
        }
      }

      if (officer) {
        setCurrentOfficer(officer);
        onLogin(officer);
      } else {
        setError('Officer not found. Please check your phone number.');
      }
    } catch {
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              Officer Login
            </h1>
            <p className="text-neutral-600">
              Enter your phone number to continue
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <FormField
              label="Phone Number"
              type="tel"
              placeholder="0714276444"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={error}
              required
            />

            <div className="text-xs text-neutral-600 space-y-1">
              <p>Supported formats:</p>
              <p>• 0714276444 • 714276444 • +255714276444</p>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={!phone.trim()}
            >
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple stat components with error handling
function LeadCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      try {
        const response = await fetch('/api/leads?public=true');
        if (response.ok && mounted) {
          const leads = await response.json();
          setCount(leads.length || 0);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCount();

    return () => { mounted = false; };
  }, []);

  if (error) return <span className="text-red-600">--</span>;
  if (loading) return <Skeleton className="w-8 h-4" />;
  return <span>{count}</span>;
}

function TodayLeadCount() {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadCount = async () => {
      try {
        const response = await fetch('/api/leads?public=true');
        if (response.ok && mounted) {
          const leads = await response.json();
          const today = new Date().toISOString().split('T')[0];
          const todayLeads = leads.filter((lead: Lead) =>
            lead.created_at?.startsWith(today)
          );
          setCount(todayLeads.length || 0);
          setError(false);
        }
      } catch {
        if (mounted) setError(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCount();

    return () => { mounted = false; };
  }, []);

  if (error) return <span className="text-red-600">--</span>;
  if (loading) return <Skeleton className="w-8 h-4" />;
  return <span>{count}</span>;
}

export default function Home() {
  const { isOnline, isConnected, checkConnection } = useNetworkStatus();
  const router = useRouter();
  const [currentOfficer, setCurrentOfficerState] = useState<Officer | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if officer is already logged in
  useEffect(() => {
    const officer = getCurrentOfficer();
    setCurrentOfficerState(officer);
    setLoading(false);
  }, []);

  const handleOfficerLogin = (officer: Officer) => {
    setCurrentOfficerState(officer);
  };

  const handleLogout = () => {
    clearCurrentOfficer();
    setCurrentOfficerState(null);
  };

  // Show loading
  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="w-32 h-8" />
        </div>
      </AppShell>
    );
  }

  // Show login if no officer
  if (!currentOfficer) {
    return (
      <AppShell>
        <OfficerLogin onLogin={handleOfficerLogin} />
      </AppShell>
    );
  }

  return (
    <AppShell
      isOnline={isOnline}
      syncStatus="idle"
      pendingCount={0}
    >
      <div className="space-y-6">
        {/* Network Status */}
        <NetworkStatus
          isOnline={isOnline}
          isConnected={isConnected}
          onRetryConnection={checkConnection}
        />
        {/* Welcome Section */}
        <div className="text-center space-y-2 mt-8 mb-2">
          <h1 className="text-3xl font-extrabold text-neutral-900 mb-1">
            Welcome, <span className="underline decoration-primary-400 decoration-4 underline-offset-4">{currentOfficer.name}</span>
          </h1>
          <p className="text-neutral-600 text-lg">{currentOfficer.phone}</p>
          <button
            onClick={handleLogout}
            className="text-sm text-neutral-500 hover:text-neutral-700 underline"
          >
            Switch Officer
          </button>
        </div>
        {/* Stats Card (Refreshed) */}
        <Card>
          <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 p-8">
            <div className="flex flex-col items-center">
              <div className="text-5xl font-extrabold text-primary-600 mb-2">
                <LeadCount />
              </div>
              <p className="uppercase text-sm tracking-wider text-primary-800 font-bold">Total Leads</p>
            </div>
            <div className="h-12 w-px bg-primary-100 mx-8 hidden md:block" />
            <div className="flex flex-col items-center">
              <div className="text-4xl font-bold text-primary-400 mb-2">
                <TodayLeadCount />
              </div>
              <p className="uppercase text-xs tracking-wide text-neutral-500 font-semibold">Added Today</p>
            </div>
          </CardContent>
        </Card>
        {/* Action Buttons and rest as before */}
        <div className="space-y-3">
          <Button
            fullWidth
            variant="default"
            size="lg"
            className="h-14"
            onClick={() => router.push('/lead/route')}
          >
            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Lead
          </Button>
          <Button
            fullWidth
            variant="outline"
            size="lg"
            className="h-12"
            onClick={async () => {
              try {
                const response = await fetch('/api/leads?public=true');
                if (response.ok) {
                  const leads = await response.json();

                  // Convert to CSV
                  if (leads.length === 0) {
                    alert('No leads to export');
                    return;
                  }

                  // CSV headers
                  const headers = [
                    'Lead Name',
                    'Phone Contact',
                    'Residence',
                    'Interested Phone Model',
                    'Next Contact Date',
                    'Area of Activity',
                    'Ward',
                    'GPS Latitude',
                    'GPS Longitude',
                    'Officer Name',
                    'Officer Phone',
                    'Created Date'
                  ];

                  // CSV rows
                  const csvRows = leads.map((lead: any) => [
                    lead.lead_name || '',
                    lead.phone_contact || '',
                    lead.residence || '',
                    lead.interested_phone_model || '',
                    lead.next_contact_date || '',
                    lead.area_of_activity || '',
                    lead.ward || '',
                    lead.gps_latitude || '',
                    lead.gps_longitude || '',
                    lead.officer?.name || '',
                    lead.officer?.phone || '',
                    lead.created_at ? new Date(lead.created_at).toLocaleDateString() : ''
                  ]);

                  // Combine headers and rows
                  const csvContent = [headers, ...csvRows]
                    .map((row: string[]) => row.map((field: string) => `"${String(field).replace(/"/g, '""')}"`).join(','))
                    .join('\n');

                  // Create and download CSV
                  const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(dataBlob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }
              } catch (error) {
                console.error('Export failed:', error);
                alert('Export failed. Please try again.');
              }
            }}
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Data
          </Button>
        </div>
        {/* Process Preview */}
        <Card>
          <CardContent className="space-y-4">
            <h3 className="font-semibold text-neutral-900">Lead Collection Process</h3>
            <StepIndicator
              steps={[
                { id: 'route', title: 'Route' },
                { id: 'details', title: 'Details' },
              ]}
              currentStep={1}
            />
            <p className="text-sm text-neutral-700">
              Simple 2-step process to collect lead data quickly.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}