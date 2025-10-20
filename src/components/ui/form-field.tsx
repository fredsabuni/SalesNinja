/**
 * FormField component with validation states and mobile-optimized inputs
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  fullWidth?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ className, label, error, hint, required, fullWidth = true, id, type, ...props }, ref) => {
    // Use React's useId hook for stable SSR-safe IDs
    const generatedId = React.useId();
    const fieldId = id || generatedId;
    const errorId = `${fieldId}-error`;
    const hintId = `${fieldId}-hint`;
    
    // Mobile keyboard optimization
    const getMobileInputMode = (inputType?: string) => {
      switch (inputType) {
        case 'tel':
          return 'tel';
        case 'email':
          return 'email';
        case 'number':
          return 'numeric';
        case 'url':
          return 'url';
        default:
          return 'text';
      }
    };

    const getAutoComplete = (inputType?: string, name?: string) => {
      if (props.autoComplete) return props.autoComplete;
      
      switch (inputType) {
        case 'tel':
          return 'tel';
        case 'email':
          return 'email';
        default:
          if (name?.includes('name')) return 'name';
          if (name?.includes('phone')) return 'tel';
          if (name?.includes('email')) return 'email';
          return 'off';
      }
    };
    
    return (
      <div className={cn('space-y-2', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={fieldId}
            className={cn(
              'block text-sm font-medium text-neutral-900',
              required && "after:content-['*'] after:ml-0.5 after:text-error-500"
            )}
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={fieldId}
          type={type}
          inputMode={getMobileInputMode(type)}
          autoComplete={getAutoComplete(type, props.name)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={cn(
            error && errorId,
            hint && hintId
          )}
          aria-required={required}
          className={cn(
            // Base styles with improved touch targets (min 44px height)
            'flex h-12 w-full rounded-lg border border-neutral-300 bg-white text-neutral-900 px-3 py-2 text-base placeholder:text-neutral-500',
            // Focus styles with better visibility
            'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
            // Disabled styles
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-50',
            // Error styles
            error && 'border-error-500 focus:border-error-500 focus:ring-error-500/20',
            // Mobile-specific improvements
            'touch-manipulation', // Improves touch responsiveness
            className
          )}
          {...props}
        />
        
        {error && (
          <p id={errorId} className="text-sm text-error-500 flex items-center gap-1" role="alert">
            <svg
              className="h-4 w-4 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        
        {hint && !error && (
          <p id={hintId} className="text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };