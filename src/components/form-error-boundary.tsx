/**
 * Form-specific Error Boundary - Handles form-related errors gracefully
 */

'use client';

import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { logError } from '@/lib/error-utils';

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface FormErrorBoundaryProps {
  children: React.ReactNode;
  onReset?: () => void;
  onGoBack?: () => void;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

export class FormErrorBoundary extends React.Component<
  FormErrorBoundaryProps,
  FormErrorBoundaryState
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FormErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    logError(error, `Form Error Boundary: ${error.message}`);
    console.error('Form Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-900">
                  {this.props.fallbackTitle || 'Form Error'}
                </h3>
                <p className="text-sm text-red-700">
                  {this.props.fallbackMessage || 
                    'There was an error with this form. Please try again or go back to the previous step.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.resetError}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                {this.props.onGoBack && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.props.onGoBack}
                    className="text-red-700 hover:bg-red-100"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                )}
              </div>

              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left bg-red-100 rounded p-3 mt-4">
                  <summary className="cursor-pointer font-medium text-sm text-red-800 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-700 whitespace-pre-wrap overflow-auto">
                    {this.state.error.message}
                    {this.state.error.stack && `\n\n${this.state.error.stack}`}
                  </pre>
                </details>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based wrapper for the Form Error Boundary
 */
export function useFormErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    logError(error, 'Form error captured by hook');
    setError(error);
  }, []);

  // Throw error to be caught by error boundary
  if (error) {
    throw error;
  }

  return {
    captureError,
    resetError,
  };
}