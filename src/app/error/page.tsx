/**
 * Global Error Page - Fallback for unhandled errors
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppShell, Card, CardContent, Button } from '@/components';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

export default function ErrorPage() {
  const router = useRouter();

  useEffect(() => {
    // Log that user reached the error page
    console.error('User reached global error page');
  }, []);

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleReportBug = () => {
    // In a real app, this would open a bug report form or email
    const subject = encodeURIComponent('Lead Generation Tool - Error Report');
    const body = encodeURIComponent(`
I encountered an error while using the Lead Generation Tool.

Details:
- Time: ${new Date().toISOString()}
- URL: ${window.location.href}
- User Agent: ${navigator.userAgent}

Please describe what you were doing when the error occurred:
[Please describe your actions here]
    `);
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
  };

  return (
    <AppShell
      title="Error"
      isOnline={true}
      syncStatus="idle"
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="text-center space-y-6 py-8">
            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-neutral-900">
                Something went wrong
              </h1>
              <p className="text-neutral-600">
                We encountered an unexpected error. Our team has been notified and is working to fix this issue.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                fullWidth
                onClick={handleReload}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                onClick={handleGoHome}
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
              
              <Button
                variant="ghost"
                fullWidth
                onClick={handleReportBug}
              >
                <Bug className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-sm text-neutral-500 space-y-1">
              <p>If this problem persists:</p>
              <ul className="text-left space-y-1">
                <li>• Try refreshing the page</li>
                <li>• Clear your browser cache</li>
                <li>• Contact support if the issue continues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}