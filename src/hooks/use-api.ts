/**
 * Hook for making API calls with error handling and retry logic
 */

import { useState, useCallback } from 'react';
import { apiClient, RetryConfig } from '@/lib/api-client';
import { getUserFriendlyError, logError, UserFriendlyError } from '@/lib/error-utils';
import { reportApiError } from '@/lib/error-reporting';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: UserFriendlyError | null;
  lastUpdated: Date | null;
}

export interface UseApiOptions<T = unknown> {
  retryConfig?: Partial<RetryConfig>;
  onSuccess?: (data: T) => void;
  onError?: (error: UserFriendlyError) => void;
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    try {
      const data = await apiCall();

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        error: null,
        lastUpdated: new Date(),
      }));

      options.onSuccess?.(data);
      return data;
    } catch (error) {
      const userError = getUserFriendlyError(error);

      setState(prev => ({
        ...prev,
        loading: false,
        error: userError,
      }));

      // Log error for debugging
      logError(error, context);

      // Report error for tracking
      if (error instanceof Error) {
        reportApiError(error, context || 'API call', 'UNKNOWN');
      }

      options.onError?.(userError);
      return null;
    }
  }, [options]);

  const retry = useCallback(async (
    apiCall: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    return execute(apiCall, context);
  }, [execute]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null,
    });
  }, []);

  // Convenience methods for common API operations
  const get = useCallback((url: string, context?: string) => {
    return execute(
      () => apiClient.get<T>(url, options.retryConfig),
      context || `GET ${url}`
    );
  }, [execute, options.retryConfig]);

  const post = useCallback((url: string, data?: unknown, context?: string) => {
    return execute(
      () => apiClient.post<T>(url, data, options.retryConfig),
      context || `POST ${url}`
    );
  }, [execute, options.retryConfig]);

  const put = useCallback((url: string, data?: unknown, context?: string) => {
    return execute(
      () => apiClient.put<T>(url, data, options.retryConfig),
      context || `PUT ${url}`
    );
  }, [execute, options.retryConfig]);

  const del = useCallback((url: string, context?: string) => {
    return execute(
      () => apiClient.delete<T>(url, options.retryConfig),
      context || `DELETE ${url}`
    );
  }, [execute, options.retryConfig]);

  return {
    ...state,
    execute,
    retry,
    reset,
    get,
    post,
    put,
    delete: del,
  };
}