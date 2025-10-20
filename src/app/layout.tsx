import type { Metadata, Viewport } from 'next';
import './globals.css';
import ErrorBoundary from '@/components/error-boundary';
import { ToastProvider } from '@/components/ui/toast';
import { PWAProvider } from '@/components/pwa-provider';
import { ErrorHandlerInitializer } from '@/components/error-handler-initializer';

export const metadata: Metadata = {
  title: 'Samsung Lead Generation Tool',
  description: 'Mobile-first lead collection tool for Samsung device sales officers',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Samsung Leads',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'Samsung Leads',
    'application-name': 'Samsung Leads',
    'msapplication-TileColor': '#6366f1',
    'msapplication-config': '/browserconfig.xml',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Enable zoom for accessibility
  themeColor: '#6366f1',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-neutral-50 text-neutral-900">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-500 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        
        <ErrorHandlerInitializer />
        <ErrorBoundary>
          <ToastProvider>
            <PWAProvider>
              <div className="min-h-screen">
                <main id="main-content" className="focus:outline-none" tabIndex={-1}>
                  {children}
                </main>
              </div>
            </PWAProvider>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
