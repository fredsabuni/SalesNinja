/**
 * Enhanced Form Validation Components with comprehensive error handling
 */

'use client';

import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { Button } from './button';

export interface ValidationError {
  field: string;
  message: string;
  type: 'required' | 'format' | 'length' | 'custom';
  suggestion?: string;
}

interface ValidationSummaryProps {
  errors: ValidationError[];
  onDismiss?: () => void;
  className?: string;
}

/**
 * Validation Summary Component - Shows all form errors in one place
 */
export function ValidationSummary({ errors, onDismiss, className = '' }: ValidationSummaryProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-red-800 mb-2">
            Please fix the following errors:
          </h3>
          <ul className="space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="text-sm text-red-700">
                <span className="font-medium">{error.field}:</span> {error.message}
                {error.suggestion && (
                  <div className="text-red-600 text-xs mt-1 ml-2">
                    💡 {error.suggestion}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
  suggestion?: string;
  className?: string;
}

/**
 * Field Error Component - Shows error for individual form fields
 */
export function FieldError({ error, suggestion, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={`mt-1 ${className}`}>
      <div className="flex items-start gap-1">
        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-600">
          {error}
          {suggestion && (
            <div className="text-red-500 text-xs mt-1">
              💡 {suggestion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FieldSuccessProps {
  message?: string;
  className?: string;
}

/**
 * Field Success Component - Shows success state for form fields
 */
export function FieldSuccess({ message, className = '' }: FieldSuccessProps) {
  if (!message) return null;

  return (
    <div className={`mt-1 flex items-center gap-1 ${className}`}>
      <CheckCircle className="h-4 w-4 text-green-500" />
      <span className="text-sm text-green-600">{message}</span>
    </div>
  );
}

interface FieldHintProps {
  hint: string;
  className?: string;
}

/**
 * Field Hint Component - Shows helpful hints for form fields
 */
export function FieldHint({ hint, className = '' }: FieldHintProps) {
  return (
    <div className={`mt-1 flex items-start gap-1 ${className}`}>
      <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <span className="text-sm text-blue-600">{hint}</span>
    </div>
  );
}

/**
 * Validation utilities for common form validation scenarios
 */
export const validationHelpers = {
  /**
   * Get user-friendly error message for phone number validation
   */
  getPhoneError: (value: string): ValidationError | null => {
    if (!value.trim()) {
      return {
        field: 'Phone Number',
        message: 'Phone number is required',
        type: 'required',
        suggestion: 'Enter your phone number including area code'
      };
    }

    // Remove all non-digit characters for validation
    const digits = value.replace(/\D/g, '');
    
    if (digits.length < 10) {
      return {
        field: 'Phone Number',
        message: 'Phone number must be at least 10 digits',
        type: 'length',
        suggestion: 'Include area code (e.g., 0712345678)'
      };
    }

    if (digits.length > 15) {
      return {
        field: 'Phone Number',
        message: 'Phone number is too long',
        type: 'length',
        suggestion: 'Remove country code if included'
      };
    }

    // Basic format validation for Kenyan numbers
    if (!digits.match(/^(0|254)/)) {
      return {
        field: 'Phone Number',
        message: 'Invalid phone number format',
        type: 'format',
        suggestion: 'Use format: 0712345678 or 254712345678'
      };
    }

    return null;
  },

  /**
   * Get user-friendly error message for name validation
   */
  getNameError: (value: string, fieldName: string = 'Name'): ValidationError | null => {
    if (!value.trim()) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        type: 'required',
        suggestion: `Enter the ${fieldName.toLowerCase()}`
      };
    }

    if (value.trim().length < 2) {
      return {
        field: fieldName,
        message: `${fieldName} must be at least 2 characters`,
        type: 'length',
        suggestion: 'Enter the full name'
      };
    }

    if (value.trim().length > 100) {
      return {
        field: fieldName,
        message: `${fieldName} is too long`,
        type: 'length',
        suggestion: 'Use a shorter version of the name'
      };
    }

    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-'\.]+$/.test(value.trim())) {
      return {
        field: fieldName,
        message: `${fieldName} contains invalid characters`,
        type: 'format',
        suggestion: 'Use only letters, spaces, hyphens, and apostrophes'
      };
    }

    return null;
  },

  /**
   * Get user-friendly error message for date validation
   */
  getDateError: (value: Date | null, fieldName: string = 'Date'): ValidationError | null => {
    if (!value) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        type: 'required',
        suggestion: `Select a ${fieldName.toLowerCase()}`
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (value < today) {
      return {
        field: fieldName,
        message: `${fieldName} cannot be in the past`,
        type: 'custom',
        suggestion: 'Select today or a future date'
      };
    }

    // Check if date is too far in the future (1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (value > oneYearFromNow) {
      return {
        field: fieldName,
        message: `${fieldName} is too far in the future`,
        type: 'custom',
        suggestion: 'Select a date within the next year'
      };
    }

    return null;
  },

  /**
   * Get user-friendly error message for required field validation
   */
  getRequiredError: (value: string, fieldName: string): ValidationError | null => {
    if (!value || !value.trim()) {
      return {
        field: fieldName,
        message: `${fieldName} is required`,
        type: 'required',
        suggestion: `Please enter ${fieldName.toLowerCase()}`
      };
    }
    return null;
  },

  /**
   * Validate all form fields and return comprehensive error list
   */
  validateForm: (formData: Record<string, any>, validationRules: Record<string, (value: any) => ValidationError | null>): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    Object.entries(validationRules).forEach(([fieldName, validator]) => {
      const error = validator(formData[fieldName]);
      if (error) {
        errors.push(error);
      }
    });
    
    return errors;
  }
};