/**
 * Success Page - Shown after successful lead submission
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell, Card, CardContent, Button } from '@/components';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();

  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <AppShell
      title="Success"
      isOnline={true}
      syncStatus="idle"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-6 py-8">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                Lead Saved Successfully!
              </h1>
              <p className="text-neutral-600">
                Your lead has been saved to the database and is now available for follow-up.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={() => router.push('/lead/officer')}
              >
                Add Another Lead
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push('/')}
              >
                Back to Dashboard
              </Button>
            </div>

            {/* Auto-redirect notice */}
            <p className="text-sm text-neutral-500">
              Redirecting to dashboard in 5 seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}