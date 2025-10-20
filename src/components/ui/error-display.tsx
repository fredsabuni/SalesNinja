/**
 * Error Display Component - Shows user-friendly error messages with retry options
 */

'use client';

import React from 'react';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { UserFriendlyError } from '@/lib/error-utils';
import { Button } from './button';

interface ErrorDisplayProps {
  error: UserFriendlyError;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  className = '',
  compact = false 
}: ErrorDisplayProps) {
  const getIcon = () => {
    if (error.title.toLowerCase().includes('connection') || 
        error.title.toLowerCase().includes('network')) {
      return <WifiOff className="h-5 w-5" />;
    }
    return <AlertCircle className="h-5 w-5" />;
  };

  const getSeverityStyles = () => {
    switch (error.severity) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-red-50 border-red-200 text-red-800';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 p-3 rounded-lg border ${getSeverityStyles()} ${className}`}>
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{error.title}</p>
        </div>
        {error.isRetryable && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-8 px-2 text-current hover:bg-current/10"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-lg border p-4 ${getSeverityStyles()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-1">{error.title}</h3>
          <p className="text-sm opacity-90 mb-3">{error.message}</p>
          
          <div className="flex flex-wrap gap-2">
            {error.isRetryable && onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="h-8 text-current border-current hover:bg-current/10"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {error.actionText || 'Retry'}
              </Button>
            )}
            
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 text-current hover:bg-current/10"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Network Status Indicator Component
 */
interface NetworkStatusProps {
  isOnline: boolean;
  isConnected: boolean;
  isChecking?: boolean;
  onRetryConnection?: () => void;
  className?: string;
}

export function NetworkStatus({ 
  isOnline, 
  isConnected, 
  isChecking = false,
  onRetryConnection,
  className = '' 
}: NetworkStatusProps) {
  if (isOnline && isConnected) {
    return null; // Don't show anything when everything is working
  }

  const getStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: 'No internet connection',
        color: 'text-red-600 bg-red-50 border-red-200',
      };
    }
    
    if (!isConnected) {
      return {
        icon: <WifiOff className="h-4 w-4" />,
        text: 'Connection issues detected',
        color: 'text-amber-600 bg-amber-50 border-amber-200',
      };
    }

    return null;
  };

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className={`flex items-center justify-between gap-2 p-2 rounded-lg border text-sm ${statusInfo.color} ${className}`}>
      <div className="flex items-center gap-2">
        {isChecking ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          statusInfo.icon
        )}
        <span>{isChecking ? 'Checking connection...' : statusInfo.text}</span>
      </div>
      
      {!isChecking && onRetryConnection && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetryConnection}
          className="h-6 px-2 text-current hover:bg-current/10"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}