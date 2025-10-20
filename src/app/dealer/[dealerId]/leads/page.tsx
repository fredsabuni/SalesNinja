/**
 * Dealer Leads Management Page
 */

'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AppShell,
  Card,
  CardContent,
  Button,
  FormField
} from '@/components';
import { Lead, Officer } from '@/types';

interface LeadWithOfficer extends Lead {
  officer: Officer;
}

export default function DealerLeadsPage() {
  const router = useRouter();
  const params = useParams<{ dealerId: string }>();
  const dealerId = params?.dealerId ?? '';

  React.useEffect(() => {
    if (!dealerId) {
      router.replace('/login');
    }
  }, [dealerId, router]);

  // State management
  const [leads, setLeads] = React.useState<LeadWithOfficer[]>([]);
  const [officers, setOfficers] = React.useState<Officer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedOfficer, setSelectedOfficer] = React.useState('');
  const [selectedDate, setSelectedDate] = React.useState('');

  // Expandable cards state
  const [expandedCards, setExpandedCards] = React.useState<Set<string>>(new Set());

  // Load data on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load leads and officers filtered by dealer ID
        const [leadsResponse, officersResponse] = await Promise.all([
          fetch(`/api/leads?dealer_id=${dealerId}`),
          fetch(`/api/officers?dealer_id=${dealerId}`)
        ]);

        if (!leadsResponse.ok || !officersResponse.ok) {
          throw new Error('Failed to load data');
        }

        const [leadsData, officersData] = await Promise.all([
          leadsResponse.json(),
          officersResponse.json()
        ]);

        setLeads(leadsData);
        setOfficers(officersData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      loadData();
    }
  }, [dealerId]);

  // Filter leads based on current filters
  const filteredLeads = React.useMemo(() => {
    return leads.filter(lead => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = lead.lead_name.toLowerCase().includes(query);
        const matchesPhone = lead.phone_contact.includes(query);
        const matchesOfficer = lead.officer?.name.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesOfficer) return false;
      }

      // Officer filter
      if (selectedOfficer && lead.officer_id !== selectedOfficer) return false;

      // Date filter
      if (selectedDate) {
        const leadDate = new Date(lead.created_at).toDateString();
        const filterDate = new Date(selectedDate).toDateString();
        if (leadDate !== filterDate) return false;
      }

      return true;
    });
  }, [leads, searchQuery, selectedOfficer, selectedDate]);

  if (!dealerId) {
    return (
      <AppShell title="Your Leads" showBackButton onBackClick={() => router.push('/login')}>
        <div className="py-12 text-center text-neutral-600">Loading dealer context...</div>
      </AppShell>
    );
  }

  // Toggle card expansion
  const toggleCard = (leadId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(leadId)) {
      newExpanded.delete(leadId);
    } else {
      newExpanded.add(leadId);
    }
    setExpandedCards(newExpanded);
  };

  // Export leads as CSV
  const exportCSV = () => {
    const headers = [
      'Name', 'Phone', 'Residence', 'Interested Model', 'Next Contact',
      'Area', 'Ward', 'Officer', 'Officer Phone', 'Created At'
    ];

    const csvData = filteredLeads.map(lead => [
      lead.lead_name,
      lead.phone_contact,
      lead.residence,
      lead.interested_phone_model,
      new Date(lead.next_contact_date).toLocaleDateString(),
      lead.area_of_activity,
      lead.ward,
      lead.officer?.name || 'Unknown',
      lead.officer?.phone || '',
      new Date(lead.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AppShell title="Your Leads" showBackButton onBackClick={() => router.push(`/dealer/${dealerId}`)}>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-neutral-600">
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading leads...
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Your Leads" showBackButton onBackClick={() => router.push(`/dealer/${dealerId}`)}>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-red-900 mb-2">Failed to Load Leads</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Your Leads" showBackButton onBackClick={() => router.push(`/dealer/${dealerId}`)}>
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-900 tracking-tight">
                  {filteredLeads.length}
                </div>
                <div className="text-xs font-medium text-blue-700 mt-0.5">
                  {filteredLeads.length === leads.length ? 'Total Leads' : 'Filtered'}
                </div>
              </div>
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-emerald-900 tracking-tight">
                  {officers.length}
                </div>
                <div className="text-xs font-medium text-emerald-700 mt-0.5">
                  Officers
                </div>
              </div>
              <div className="w-8 h-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="h-12 px-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl border border-purple-200/50 shadow-sm flex items-center justify-center gap-2 hover:from-purple-100 hover:to-purple-150/50 transition-all duration-200 active:scale-95"
          >
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-purple-700">CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <FormField
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex gap-2">
            <select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              className="flex-1 h-12 text-sm rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Officers</option>
              {officers.map(officer => (
                <option key={officer.id} value={officer.id}>{officer.name}</option>
              ))}
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-12 text-sm rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />

            {(searchQuery || selectedOfficer || selectedDate) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedOfficer('');
                  setSelectedDate('');
                }}
                className="h-12 px-4 text-sm bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg border border-neutral-300 transition-colors duration-200 font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-2">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <svg className="mx-auto h-8 w-8 text-neutral-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6" />
              </svg>
              <p className="text-sm">
                {leads.length === 0 ? 'No leads yet' : 'No matches'}
              </p>
            </div>
          ) : (
            filteredLeads.map((lead) => {
              const isExpanded = expandedCards.has(lead.id);
              return (
                <Card key={lead.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleCard(lead.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-neutral-900 truncate">
                            {lead.lead_name}
                          </h3>
                          <span className="text-xs text-neutral-700 font-medium">
                            {lead.phone_contact}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-800 truncate font-medium">
                            {lead.interested_phone_model}
                          </span>
                          <span className="text-xs text-neutral-400">•</span>
                          <span className="text-xs text-neutral-700">
                            {lead.officer?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          {new Date(lead.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <svg
                          className={`h-4 w-4 text-neutral-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-neutral-100 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-neutral-600 font-medium">Residence:</span>
                            <div className="font-semibold text-neutral-900">{lead.residence}</div>
                          </div>
                          <div>
                            <span className="text-neutral-600 font-medium">Next Contact:</span>
                            <div className="font-semibold text-neutral-900">
                              {new Date(lead.next_contact_date).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-600 font-medium">Area:</span>
                            <div className="font-semibold text-neutral-900">{lead.area_of_activity}</div>
                          </div>
                          <div>
                            <span className="text-neutral-600 font-medium">Ward:</span>
                            <div className="font-semibold text-neutral-900">{lead.ward}</div>
                          </div>
                        </div>

                        <div className="bg-primary-50 rounded p-2">
                          <div className="flex items-center gap-2">
                            <svg className="h-3 w-3 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium text-primary-900">
                              {lead.officer?.name}
                            </span>
                            <span className="text-xs text-primary-700">
                              {lead.officer?.phone}
                            </span>
                          </div>
                        </div>

                        {lead.gps_latitude && lead.gps_longitude && (
                          <div className="text-xs text-neutral-500">
                            📍 {lead.gps_latitude.toFixed(4)}, {lead.gps_longitude.toFixed(4)}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppShell>
  );
}