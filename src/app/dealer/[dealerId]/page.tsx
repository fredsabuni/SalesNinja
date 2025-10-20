/**
 * Dealer-specific dashboard page
 * URL: /dealer/[dealerId]
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, Button } from '@/components';
import { Dealer } from '@/types';
import { supabase } from '@/lib/supabase';
import { logoutDealer } from '@/lib/auth';

export default function DealerDashboardPage() {
  const router = useRouter();
  const params = useParams<{ dealerId: string }>();
  const dealerId = params?.dealerId ?? '';

  useEffect(() => {
    if (!dealerId) {
      router.replace('/login');
    }
  }, [dealerId, router]);
  
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalOfficers: 0,
    leadsToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    logoutDealer();
    router.push('/login');
  };

  useEffect(() => {
    const loadDealerData = async () => {
      try {
        // Load dealer info
        const { data: dealerData, error: dealerError } = await supabase
          .from('dealers')
          .select('*')
          .eq('id', dealerId)
          .single();

        if (dealerError || !dealerData) {
          setError('Dealer not found');
          return;
        }

        setDealer(dealerData);

        // Load dealer-specific stats
        const [leadsResponse, officersResponse] = await Promise.all([
          // First get officers for this dealer
          supabase
            .from('officers')
            .select('id')
            .eq('dealer_id', dealerId),
          supabase
            .from('officers')
            .select('*')
            .eq('dealer_id', dealerId)
        ]);

        const officers = officersResponse.data || [];
        const officerIds = (leadsResponse.data || []).map(officer => officer.id);

        // Then get leads for those officers
        let leads: { created_at: string }[] = [];
        if (officerIds.length > 0) {
          const { data: leadsData } = await supabase
            .from('leads')
            .select('*')
            .in('officer_id', officerIds);
          leads = leadsData || [];
        }



        const today = new Date().toDateString();
        const leadsToday = leads.filter((lead: { created_at: string }) => 
          new Date(lead.created_at).toDateString() === today
        ).length;

        setStats({
          totalLeads: leads.length,
          totalOfficers: officers.length,
          leadsToday,
        });

      } catch (err) {
        setError('Failed to load dealer data');
        console.error('Error loading dealer data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (dealerId) {
      loadDealerData();
    }
  }, [dealerId]);

  if (!dealerId) {
    return (
      <AppShell title="Loading...">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-neutral-600">
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading dealer dashboard...
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell title="Loading...">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-neutral-600">
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading dealer dashboard...
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (error || !dealer) {
    return (
      <AppShell title="Error">
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-900 mb-2">
              {error || 'Dealer not found'}
            </h3>
            <Button onClick={() => router.push('/')}>
              Go to Main App
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`${dealer.name} Dashboard`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-neutral-900">
              {dealer.name}
            </h1>
            <p className="text-neutral-600">
              {dealer.company} • {dealer.phone}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-4 border border-blue-200/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900 tracking-tight">
                {stats.totalLeads}
              </div>
              <div className="text-xs font-medium text-blue-700 mt-0.5">
                Total Leads
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-4 border border-emerald-200/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-900 tracking-tight">
                {stats.totalOfficers}
              </div>
              <div className="text-xs font-medium text-emerald-700 mt-0.5">
                Officers
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-4 border border-orange-200/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900 tracking-tight">
                {stats.leadsToday}
              </div>
              <div className="text-xs font-medium text-orange-700 mt-0.5">
                Today
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="space-y-3">
            <Button 
              fullWidth 
              onClick={() => router.push(`/dealer/${dealerId}/leads`)}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View All Leads
            </Button>

            <Button 
              fullWidth 
              variant="outline"
              onClick={() => router.push(`/dealer/${dealerId}/officers`)}
            >
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manage Officers
            </Button>
          </CardContent>
        </Card>


      </div>
    </AppShell>
  );
}