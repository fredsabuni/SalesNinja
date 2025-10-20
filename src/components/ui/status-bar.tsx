/**
 * StatusBar component for connection and sync status indicators
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatusBarProps {
  isOnline: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  pendingCount?: number;
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  isOnline,
  syncStatus,
  pendingCount = 0,
  className,
}) => {
  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        color: 'bg-warning-500',
        text: 'Offline',
        icon: (
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
        ),
      };
    }

    switch (syncStatus) {
      case 'syncing':
        return {
          color: 'bg-primary-500',
          text: 'Syncing...',
          icon: (
            <svg
              className="h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
        };
      case 'error':
        return {
          color: 'bg-error-500',
          text: pendingCount > 0 ? `${pendingCount} pending` : 'Sync error',
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
      case 'idle':
      default:
        return {
          color: 'bg-success-500',
          text: 'Online',
          icon: (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ),
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium',
        statusConfig.color,
        className
      )}
    >
      {statusConfig.icon}
      <span>{statusConfig.text}</span>
    </div>
  );
};

export { StatusBar };