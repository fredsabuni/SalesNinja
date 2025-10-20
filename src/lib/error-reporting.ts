/**
 * Error Reporting and Analytics Utilities
 */

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: {
    name: string;
    message: string;
    stack?: string;
  };
  context: {
    url: string;
    userAgent: string;
    userId?: string;
    sessionId?: string;
    component?: string;
    action?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  timestamp: string;
  category: 'navigation' | 'user' | 'api' | 'error' | 'info';
  message: string;
  data?: Record<string, any>;
}

class ErrorReporter {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs = 50;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandlers();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupGlobalErrorHandlers() {
    // Only set up handlers in the browser
    if (typeof window === 'undefined') return;

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: 'Global',
          action: 'unhandledrejection',
        },
        'high'
      );
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError(
        event.error || new Error(event.message),
        {
          component: 'Global',
          action: 'javascript_error',
        },
        'high'
      );
    });
  }

  /**
   * Add a breadcrumb to track user actions
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>) {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: new Date().toISOString(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs = this.breadcrumbs.slice(-this.maxBreadcrumbs);
    }
  }

  /**
   * Report an error with context
   */
  reportError(
    error: Error,
    context: Partial<ErrorReport['context']> = {},
    severity: ErrorReport['severity'] = 'medium',
    tags: string[] = []
  ): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context: {
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR',
        sessionId: this.sessionId,
        ...context,
      },
      severity,
      tags,
      breadcrumbs: [...this.breadcrumbs],
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🐛 Error Report [${severity.toUpperCase()}]`);
      console.error('Error:', error);
      console.log('Report:', report);
      console.groupEnd();
    }

    // Store locally for debugging
    this.storeErrorLocally(report);

    // Send to error reporting service (in production)
    if (process.env.NODE_ENV === 'production') {
      this.sendToErrorService(report);
    }

    return errorId;
  }

  /**
   * Store error locally for debugging
   */
  private storeErrorLocally(report: ErrorReport) {
    try {
      const key = `error_report_${report.id}`;
      const stored = localStorage.getItem('error_reports');
      const reports = stored ? JSON.parse(stored) : [];
      
      reports.push(report);
      
      // Keep only the most recent 10 error reports
      const recentReports = reports.slice(-10);
      
      localStorage.setItem('error_reports', JSON.stringify(recentReports));
      localStorage.setItem(key, JSON.stringify(report));
    } catch (e) {
      console.warn('Failed to store error report locally:', e);
    }
  }

  /**
   * Send error to external error reporting service
   */
  private async sendToErrorService(report: ErrorReport) {
    try {
      // In a real application, you would send this to services like:
      // - Sentry
      // - Bugsnag
      // - LogRocket
      // - Custom error reporting endpoint
      
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        console.warn('Failed to send error report to service');
      }
    } catch (e) {
      console.warn('Error reporting service unavailable:', e);
    }
  }

  /**
   * Get stored error reports for debugging
   */
  getStoredErrors(): ErrorReport[] {
    try {
      const stored = localStorage.getItem('error_reports');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to retrieve stored error reports:', e);
      return [];
    }
  }

  /**
   * Clear stored error reports
   */
  clearStoredErrors() {
    try {
      const stored = this.getStoredErrors();
      stored.forEach(report => {
        localStorage.removeItem(`error_report_${report.id}`);
      });
      localStorage.removeItem('error_reports');
    } catch (e) {
      console.warn('Failed to clear stored error reports:', e);
    }
  }

  /**
   * Track user navigation
   */
  trackNavigation(from: string, to: string) {
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigated from ${from} to ${to}`,
      data: { from, to },
    });
  }

  /**
   * Track user actions
   */
  trackUserAction(action: string, data?: Record<string, any>) {
    this.addBreadcrumb({
      category: 'user',
      message: `User action: ${action}`,
      data,
    });
  }

  /**
   * Track API calls
   */
  trackApiCall(method: string, url: string, status?: number, error?: string) {
    this.addBreadcrumb({
      category: 'api',
      message: `${method} ${url} ${status ? `- ${status}` : ''}${error ? ` - Error: ${error}` : ''}`,
      data: { method, url, status, error },
    });
  }
}

// Create singleton instance
export const errorReporter = new ErrorReporter();

/**
 * Convenience functions for common error reporting scenarios
 */
export const reportFormError = (error: Error, formName: string, fieldName?: string) => {
  return errorReporter.reportError(
    error,
    {
      component: 'Form',
      action: 'form_error',
    },
    'medium',
    ['form', formName, fieldName].filter(Boolean) as string[]
  );
};

export const reportApiError = (error: Error, endpoint: string, method: string = 'GET') => {
  return errorReporter.reportError(
    error,
    {
      component: 'API',
      action: 'api_error',
    },
    'high',
    ['api', method.toLowerCase(), endpoint]
  );
};

export const reportNavigationError = (error: Error, route: string) => {
  return errorReporter.reportError(
    error,
    {
      component: 'Navigation',
      action: 'navigation_error',
    },
    'medium',
    ['navigation', route]
  );
};

export const reportValidationError = (error: Error, fieldName: string) => {
  return errorReporter.reportError(
    error,
    {
      component: 'Validation',
      action: 'validation_error',
    },
    'low',
    ['validation', fieldName]
  );
};

/**
 * React hook for error reporting
 */

import React from 'react';

export function useErrorReporting() {
  const trackAction = React.useCallback((action: string, data?: Record<string, any>) => {
    errorReporter.trackUserAction(action, data);
  }, []);

  const reportError = React.useCallback((
    error: Error,
    context?: Partial<ErrorReport['context']>,
    severity?: ErrorReport['severity']
  ) => {
    return errorReporter.reportError(error, context, severity);
  }, []);

  return {
    trackAction,
    reportError,
    trackNavigation: errorReporter.trackNavigation.bind(errorReporter),
    trackApiCall: errorReporter.trackApiCall.bind(errorReporter),
  };
}