/**
 * AppShell - Main application wrapper with navigation and status indicators
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { StatusBar } from '@/components/ui/status-bar';

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  isOnline?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'error' | 'offline';
  pendingCount?: number;
  className?: string;
}

const AppShell: React.FC<AppShellProps> = ({
  children,
  title,
  showBackButton = false,
  onBackClick,
  isOnline = true,
  syncStatus = 'idle',
  pendingCount = 0,
  className,
}) => {
  return (
    <div className={cn('min-h-screen bg-neutral-50 flex flex-col', className)}>
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 transition-colors"
                aria-label="Go back"
              >
                <svg
                  className="h-5 w-5 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            
            {title ? (
              <h1 className="text-lg font-semibold text-neutral-900 truncate">
                {title}
              </h1>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-primary-600">
                    Sales Ninja
                  </h1>
                </div>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <StatusBar
            isOnline={isOnline}
            syncStatus={syncStatus}
            pendingCount={pendingCount}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
          {children}
        </div>
      </main>

      {/* Footer - Optional space for future navigation */}
      <footer className="bg-white border-t border-neutral-200 px-4 py-2">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-neutral-500">
            Lead Generation Tool v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};

export { AppShell };