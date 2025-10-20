/**
 * Simple Dealer Login Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell, Card, CardContent, CardHeader, CardTitle, Button, FormField } from '@/components';
import { loginDealer } from '@/lib/auth';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      setError('Please enter your phone number or email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const dealer = await loginDealer(identifier);
      if (dealer) {
        router.push(`/dealer/${dealer.id}`);
      }
    } catch {
      setError('Dealer not found. Please check your phone number or email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-600 mb-2">
              Dealer Login
            </h1>
            <p className="text-neutral-700">
              Enter your phone number or email to access the admin panel
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <FormField
                  label="Phone Number or Email"
                  type="text"
                  placeholder="0714276111 or dealer@company.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  error={error}
                  required
                />
                
                <div className="text-xs text-neutral-600 space-y-1">
                  <p>Supported phone formats:</p>
                  <p>• 0714276111 (most common)</p>
                  <p>• 714276111</p>
                  <p>• +255714276111</p>
                </div>

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  disabled={!identifier.trim()}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-neutral-700">
                  Don&apos;t have access?{' '}
                  <button
                    onClick={() => router.push('/')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Go to Lead Collection
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}