/**
 * Error handling utilities and user-friendly error messages
 */

import { ApiClientError } from './api-client';

export interface UserFriendlyError {
  title: string;
  message: string;
  actionText?: string;
  isRetryable: boolean;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Convert API errors to user-friendly messages
 */
export function getUserFriendlyError(error: unknown): UserFriendlyError {
  // Handle ApiClientError
  if (error instanceof ApiClientError) {
    if (error.isNetworkError) {
      return {
        title: 'Connection Problem',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        actionText: 'Retry',
        isRetryable: true,
        severity: 'error',
      };
    }

    // Handle specific HTTP status codes
    switch (error.status) {
      case 400:
        return {
          title: 'Invalid Data',
          message: 'The information provided is invalid. Please check your entries and try again.',
          actionText: 'Fix and Retry',
          isRetryable: false,
          severity: 'error',
        };

      case 401:
        return {
          title: 'Authentication Required',
          message: 'You need to sign in to access this feature.',
          actionText: 'Sign In',
          isRetryable: false,
          severity: 'warning',
        };

      case 403:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action.',
          actionText: 'Contact Support',
          isRetryable: false,
          severity: 'error',
        };

      case 404:
        return {
          title: 'Not Found',
          message: 'The requested information could not be found.',
          actionText: 'Go Back',
          isRetryable: false,
          severity: 'error',
        };

      case 409:
        return {
          title: 'Conflict',
          message: 'This data conflicts with existing information. Please check and try again.',
          actionText: 'Review and Retry',
          isRetryable: false,
          severity: 'warning',
        };

      case 429:
        return {
          title: 'Too Many Requests',
          message: 'You\'re making requests too quickly. Please wait a moment and try again.',
          actionText: 'Try Again Later',
          isRetryable: true,
          severity: 'warning',
        };

      case 500:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again in a few moments.',
          actionText: 'Retry',
          isRetryable: true,
          severity: 'error',
        };

      case 502:
      case 503:
      case 504:
        return {
          title: 'Service Unavailable',
          message: 'The service is temporarily unavailable. Please try again later.',
          actionText: 'Retry',
          isRetryable: true,
          severity: 'error',
        };

      default:
        return {
          title: 'Request Failed',
          message: error.message || 'An unexpected error occurred. Please try again.',
          actionText: error.isRetryable ? 'Retry' : 'OK',
          isRetryable: error.isRetryable,
          severity: 'error',
        };
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    return {
      title: 'Unexpected Error',
      message: 'Something unexpected happened. Please try again.',
      actionText: 'Retry',
      isRetryable: true,
      severity: 'error',
    };
  }

  // Fallback for unknown errors
  return {
    title: 'Unknown Error',
    message: 'An unknown error occurred. Please refresh the page and try again.',
    actionText: 'Refresh Page',
    isRetryable: false,
    severity: 'error',
  };
}

/**
 * Check if the device is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Add network status listeners
 */
export function addNetworkStatusListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  // Check if we're in the browser
  if (typeof window === 'undefined') {
    return () => {}; // Return empty cleanup function for SSR
  }

  const handleOnline = () => onOnline();
  const handleOffline = () => onOffline();

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * Log errors for debugging (in development) or monitoring (in production)
 */
export function logError(error: unknown, context?: string): void {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  } else {
    // In production, you might want to send this to a logging service
    // Example: sendToLoggingService(errorInfo);
    console.error('Error occurred:', errorInfo);
  }
}

/**
 * Validate network connectivity by making a simple request
 */
export async function checkConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a small resource with no-cache to test connectivity
    const response = await fetch('/api/health', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}