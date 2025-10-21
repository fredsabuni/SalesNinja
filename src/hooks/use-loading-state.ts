/**
 * Loading State Management Hook for better user feedback
 */

import { useState, useCallback, useRef } from 'react';

export interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

export interface LoadingOptions {
  message?: string;
  showProgress?: boolean;
  minDuration?: number; // Minimum loading duration in ms
}

/**
 * Hook for managing loading states with user-friendly feedback
 */
export function useLoadingState(initialState: LoadingState = { isLoading: false }) {
  const [state, setState] = useState<LoadingState>(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const setLoading = useCallback((loading: boolean, options: LoadingOptions = {}) => {
    if (loading) {
      startTimeRef.current = Date.now();
      setState({
        isLoading: true,
        loadingMessage: options.message,
        progress: options.showProgress ? 0 : undefined,
      });
    } else {
      const endLoading = () => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          loadingMessage: undefined,
          progress: undefined,
        }));
        startTimeRef.current = null;
      };

      // Ensure minimum loading duration for better UX
      if (options.minDuration && startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = options.minDuration - elapsed;
        
        if (remaining > 0) {
          timeoutRef.current = setTimeout(endLoading, remaining);
        } else {
          endLoading();
        }
      } else {
        endLoading();
      }
    }
  }, []);

  const setProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.max(0, Math.min(100, progress)),
    }));
  }, []);

  const setMessage = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      loadingMessage: message,
    }));
  }, []);

  // Cleanup timeout on unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    ...state,
    setLoading,
    setProgress,
    setMessage,
    cleanup,
  };
}

/**
 * Hook for managing async operations with loading states
 */
export function useAsyncOperation<T = unknown>() {
  const loading = useLoadingState();
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    operation: () => Promise<T>,
    options: LoadingOptions & {
      onSuccess?: (data: T) => void;
      onError?: (error: Error) => void;
      clearPreviousError?: boolean;
    } = {}
  ): Promise<T | null> => {
    try {
      if (options.clearPreviousError !== false) {
        setError(null);
      }
      
      loading.setLoading(true, options);
      
      const result = await operation();
      
      setData(result);
      options.onSuccess?.(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      options.onError?.(error);
      return null;
    } finally {
      loading.setLoading(false, options);
    }
  }, [loading]);

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    loading.setLoading(false);
  }, [loading]);

  return {
    ...loading,
    error,
    data,
    execute,
    reset,
  };
}

/**
 * Hook for managing multi-step operations with progress tracking
 */
export function useMultiStepOperation() {
  const loading = useLoadingState();
  const [currentStep, setCurrentStep] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [totalSteps, setTotalSteps] = useState<number>(0);

  const startOperation = useCallback((steps: string[]) => {
    setTotalSteps(steps.length);
    setCompletedSteps([]);
    setCurrentStep(steps[0] || '');
    loading.setLoading(true, {
      message: `Step 1 of ${steps.length}: ${steps[0]}`,
      showProgress: true,
    });
    loading.setProgress(0);
  }, [loading]);

  const completeStep = useCallback((stepName: string, nextStep?: string) => {
    setCompletedSteps(prev => [...prev, stepName]);
    
    if (nextStep) {
      setCurrentStep(nextStep);
      const stepNumber = completedSteps.length + 2; // +1 for current, +1 for next
      const progress = ((completedSteps.length + 1) / totalSteps) * 100;
      
      loading.setMessage(`Step ${stepNumber} of ${totalSteps}: ${nextStep}`);
      loading.setProgress(progress);
    } else {
      // Operation complete
      loading.setProgress(100);
      loading.setMessage('Completing...');
      setTimeout(() => {
        loading.setLoading(false);
        setCurrentStep('');
        setCompletedSteps([]);
        setTotalSteps(0);
      }, 500);
    }
  }, [completedSteps.length, totalSteps, loading]);

  const failStep = useCallback((stepName: string, error: Error) => {
    loading.setLoading(false);
    setCurrentStep('');
    // Keep completed steps and total for potential retry
    console.error(`Step "${stepName}" failed:`, error);
  }, [loading]);

  return {
    ...loading,
    currentStep,
    completedSteps,
    totalSteps,
    startOperation,
    completeStep,
    failStep,
  };
}