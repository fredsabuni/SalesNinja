/**
 * Admin Dashboard Page
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
  Button
} from '@/components';
import { getCurrentDealer, logoutDealer } from '@/lib/auth';
import { Dealer } from '@/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [dealer, setDealer] = React.useState<Dealer | null>(null);
  const [stats, setStats] = React.useState({
    totalLeads: 0,
    totalOfficers: 0,
    leadsToday: 0,
    leadsThisWeek: 0
  });
  const [loading, setLoading] = React.useState(true);

  // Check authentication
  React.useEffect(() => {
    const currentDealer = getCurrentDealer();
    if (!currentDealer) {
      router.push('/login');
      return;
    }
    setDealer(currentDealer);
  }, [router]);

  // Load dashboard stats
  React.useEffect(() => {
    if (!dealer) return;

    const loadStats = async () => {
      try {
        // Fetch data filtered by current dealer
        const [leadsResponse, officersResponse] = await Promise.all([
          fetch(`/api/leads?dealer_id=${dealer.id}`),
          fetch(`/api/officers?dealer_id=${dealer.id}`)
        ]);

        if (leadsResponse.ok && officersResponse.ok) {
          const [leads, officers] = await Promise.all([
            leadsResponse.json(),
            officersResponse.json()
          ]);

          const today = new Date().toDateString();
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          const leadsToday = leads.filter((lead: { created_at: string }) => 
            new Date(lead.created_at).toDateString() === today
          ).length;

          const leadsThisWeek = leads.filter((lead: { created_at: string }) => 
            new Date(lead.created_at) >= weekAgo
          ).length;

          setStats({
            totalLeads: leads.length,
            totalOfficers: officers.length,
            leadsToday,
            leadsThisWeek
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [dealer]);

  const handleLogout = () => {
    logoutDealer();
    router.push('/login');
  };

  return (
    <AppShell title="Admin Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
            <p className="text-neutral-600">
              {dealer ? `${dealer.name} - ${dealer.company}` : 'Manage leads and officers'}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Apple-style Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Leads */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border border-blue-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-900 tracking-tight mb-1">
              {loading ? '...' : stats.totalLeads}
            </div>
            <div className="text-sm font-medium text-blue-700">Total Leads</div>
          </div>

          {/* Active Officers */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl p-5 border border-emerald-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-900 tracking-tight mb-1">
              {loading ? '...' : stats.totalOfficers}
            </div>
            <div className="text-sm font-medium text-emerald-700">Active Officers</div>
          </div>

          {/* Leads Today */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl p-5 border border-orange-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-orange-900 tracking-tight mb-1">
              {loading ? '...' : stats.leadsToday}
            </div>
            <div className="text-sm font-medium text-orange-700">Leads Today</div>
          </div>

          {/* This Week */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-2xl p-5 border border-purple-200/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-900 tracking-tight mb-1">
              {loading ? '...' : stats.leadsThisWeek}
            </div>
            <div className="text-sm font-medium text-purple-700">This Week</div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              fullWidth 
              onClick={() => router.push('/admin/leads')}
              className="justify-start"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View All Leads
            </Button>

            <Button 
              fullWidth 
              variant="outline"
              onClick={() => router.push('/admin/officers')}
              className="justify-start"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Manage Officers
            </Button>

            <Button 
              fullWidth 
              variant="outline"
              onClick={() => router.push('/')}
              className="justify-start"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Lead
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-neutral-500">
              <svg className="mx-auto h-12 w-12 text-neutral-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Recent activity will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}