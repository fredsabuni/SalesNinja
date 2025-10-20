/**
 * Loading Indicator Components for better user feedback
 */

'use client';

import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Simple Loading Spinner
 */
export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  progress?: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Loading Overlay Component
 */
export function LoadingOverlay({ 
  isLoading, 
  message, 
  progress, 
  children, 
  className = '' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
            <div className="text-center space-y-4">
              <LoadingSpinner size="lg" className="mx-auto text-primary-600" />
              {message && (
                <p className="text-sm text-gray-600">{message}</p>
              )}
              {typeof progress === 'number' && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{Math.round(progress)}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  message?: string;
  showPercentage?: boolean;
  className?: string;
}

/**
 * Progress Bar Component
 */
export function ProgressBar({ 
  progress, 
  message, 
  showPercentage = true, 
  className = '' 
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`space-y-2 ${className}`}>
      {message && (
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">{message}</p>
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}

interface StepIndicatorProps {
  steps: Array<{
    name: string;
    status: 'pending' | 'current' | 'completed' | 'error';
  }>;
  className?: string;
}

/**
 * Step Indicator for multi-step operations
 */
export function StepIndicator({ steps, className = '' }: StepIndicatorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          {/* Step Icon */}
          <div className={`
            flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
            ${step.status === 'completed' 
              ? 'bg-green-100 text-green-600' 
              : step.status === 'current'
              ? 'bg-primary-100 text-primary-600'
              : step.status === 'error'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-400'
            }
          `}>
            {step.status === 'completed' ? (
              <CheckCircle className="w-4 h-4" />
            ) : step.status === 'current' ? (
              <LoadingSpinner size="sm" />
            ) : step.status === 'error' ? (
              '!'
            ) : (
              index + 1
            )}
          </div>

          {/* Step Name */}
          <span className={`
            text-sm
            ${step.status === 'completed' 
              ? 'text-green-600 font-medium' 
              : step.status === 'current'
              ? 'text-primary-600 font-medium'
              : step.status === 'error'
              ? 'text-red-600 font-medium'
              : 'text-gray-500'
            }
          `}>
            {step.name}
          </span>
        </div>
      ))}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  error?: string | null;
  empty?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Comprehensive Loading State Component
 */
export function LoadingState({
  isLoading,
  error,
  empty = false,
  emptyMessage = 'No data available',
  loadingMessage = 'Loading...',
  children,
  className = ''
}: LoadingStateProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" className="mx-auto text-primary-600" />
          <p className="text-sm text-gray-600">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className={`flex items-center justify-center py-8 ${className}`}>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-gray-400 text-xl">📭</span>
          </div>
          <p className="text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Skeleton Loading Component for content placeholders
 */
interface SkeletonProps {
  className?: string;
  lines?: number;
}

export function Skeleton({ className = '', lines = 1 }: SkeletonProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div 
          key={index}
          className={`bg-gray-200 rounded ${index > 0 ? 'mt-2' : ''}`}
          style={{
            height: '1rem',
            width: index === lines - 1 ? '75%' : '100%'
          }}
        />
      ))}
    </div>
  );
}