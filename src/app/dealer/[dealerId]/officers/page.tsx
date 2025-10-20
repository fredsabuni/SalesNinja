/**
 * Dealer Officers Management Page
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, CardHeader, CardTitle, Button, FormField } from '@/components';
import { Officer } from '@/types';

export default function DealerOfficersPage() {
  const router = useRouter();
  const params = useParams<{ dealerId: string }>();
  const dealerId = params?.dealerId ?? '';

  useEffect(() => {
    if (!dealerId) {
      router.replace('/login');
    }
  }, [dealerId, router]);

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOfficer, setNewOfficer] = useState({ name: '', phone: '' });

  const fetchOfficers = useCallback(async () => {
    try {
      const res = await fetch(`/api/officers?dealer_id=${dealerId}`);
      const data = await res.json();
      setOfficers(data);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setLoading(false);
    }
  }, [dealerId]);

  useEffect(() => {
    if (dealerId) {
      fetchOfficers();
    }
  }, [dealerId, fetchOfficers]);

  const handleAddOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealerId || !newOfficer.name.trim() || !newOfficer.phone.trim()) return;

    try {
      const res = await fetch('/api/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOfficer.name.trim(),
          phone: newOfficer.phone.trim(),
          dealer_id: dealerId,
        }),
      });

      if (res.ok) {
        setNewOfficer({ name: '', phone: '' });
        setShowAddForm(false);
        fetchOfficers();
      }
    } catch (error) {
      console.error('Error adding officer:', error);
    }
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (!confirm('Are you sure you want to delete this officer?')) return;

    try {
      const res = await fetch(`/api/officers/${officerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchOfficers();
      }
    } catch (error) {
      console.error('Error deleting officer:', error);
    }
  };

  if (!dealerId) {
    return (
      <AppShell title="Manage Officers" showBackButton onBackClick={() => router.push('/login')}>
        <div className="py-12 text-center text-neutral-600">Loading dealer context...</div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Manage Officers"
      showBackButton
      onBackClick={() => router.push(`/dealer/${dealerId}`)}
    >
      <div className="space-y-6">
        {/* Add Officer Button */}
        <Button
          fullWidth
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel' : 'Add New Officer'}
        </Button>

        {/* Add Officer Form */}
        {showAddForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add New Officer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddOfficer} className="space-y-4">
                <FormField
                  label="Officer Name"
                  placeholder="Enter officer name"
                  value={newOfficer.name}
                  onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })}
                  required
                />
                
                <FormField
                  label="Phone Number (10 digits)"
                  type="tel"
                  placeholder="0715123456"
                  value={newOfficer.phone}
                  onChange={(e) => setNewOfficer({ ...newOfficer, phone: e.target.value })}
                  required
                />

                <Button
                  type="submit"
                  fullWidth
                  disabled={!newOfficer.name.trim() || !newOfficer.phone.trim()}
                >
                  Add Officer
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Officers List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Officers ({officers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-neutral-600">Loading officers...</p>
            ) : officers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-neutral-600 mb-4">No officers yet</p>
                <Button onClick={() => setShowAddForm(true)}>
                  Add Your First Officer
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {officers.map((officer) => (
                  <div
                    key={officer.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-neutral-900">{officer.name}</p>
                      <p className="text-sm text-neutral-700">{officer.phone}</p>
                      <p className="text-xs text-neutral-600">
                        Added {new Date(officer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteOfficer(officer.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}