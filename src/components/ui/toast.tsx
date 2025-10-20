/**
 * Toast Notification System for user feedback
 */

'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { Button } from './button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? (toast.type === 'error' ? 8000 : 5000),
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration (unless persistent)
    if (!newToast.persistent && newToast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { addToast, removeToast, clearAllToasts } = context;

  // Convenience methods for different toast types
  const success = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, message, ...options });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, message, ...options });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, message, ...options });
  }, [addToast]);

  const info = useCallback((title: string, message?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, message, ...options });
  }, [addToast]);

  return {
    success,
    error,
    warning,
    info,
    remove: removeToast,
    clearAll: clearAllToasts,
  };
}

/**
 * Toast Container Component
 */
function ToastContainer() {
  const { toasts } = useContext(ToastContext)!;

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

/**
 * Individual Toast Item Component
 */
function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useContext(ToastContext)!;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 shadow-lg ${getStyles()} animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold mb-1">{toast.title}</h4>
          {toast.message && (
            <p className="text-sm opacity-90">{toast.message}</p>
          )}
          {toast.action && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toast.action.onClick}
                className="h-8 px-2 text-current hover:bg-current/10"
              >
                {toast.action.label}
              </Button>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => removeToast(toast.id)}
          className="h-6 w-6 p-0 text-current hover:bg-current/10"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * Convenience hook for common toast patterns
 */
export function useToastHelpers() {
  const toast = useToast();

  const showSaveSuccess = useCallback((itemName: string = 'item') => {
    return toast.success(
      'Saved Successfully',
      `Your ${itemName} has been saved successfully.`
    );
  }, [toast]);

  const showSaveError = useCallback((itemName: string = 'item', retry?: () => void) => {
    return toast.error(
      'Save Failed',
      `Failed to save your ${itemName}. Please try again.`,
      retry ? {
        action: {
          label: 'Retry',
          onClick: retry,
        },
        persistent: true,
      } : undefined
    );
  }, [toast]);

  const showNetworkError = useCallback((retry?: () => void) => {
    return toast.error(
      'Connection Problem',
      'Unable to connect to the server. Please check your internet connection.',
      retry ? {
        action: {
          label: 'Retry',
          onClick: retry,
        },
        persistent: true,
      } : undefined
    );
  }, [toast]);

  const showValidationError = useCallback((message: string = 'Please check your input and try again.') => {
    return toast.warning(
      'Validation Error',
      message
    );
  }, [toast]);

  const showLoadingError = useCallback((itemName: string = 'data', retry?: () => void) => {
    return toast.error(
      'Loading Failed',
      `Failed to load ${itemName}. Please try again.`,
      retry ? {
        action: {
          label: 'Retry',
          onClick: retry,
        },
        persistent: true,
      } : undefined
    );
  }, [toast]);

  return {
    showSaveSuccess,
    showSaveError,
    showNetworkError,
    showValidationError,
    showLoadingError,
  };
}