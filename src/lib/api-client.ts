/**
 * API Client with retry logic and error handling
 */

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  isNetworkError?: boolean;
  isRetryable?: boolean;
}

export class ApiClientError extends Error {
  public status?: number;
  public code?: string;
  public isNetworkError: boolean;
  public isRetryable: boolean;

  constructor(error: ApiError) {
    super(error.message);
    this.name = 'ApiClientError';
    this.status = error.status;
    this.code = error.code;
    this.isNetworkError = error.isNetworkError || false;
    this.isRetryable = error.isRetryable || false;
  }
}

// Lower retry attempts/defaults to be gentler
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 2,    // was 3
  baseDelay: 1500,   // 1.5 second
  maxDelay: 30000, // 30 seconds unchanged
  backoffMultiplier: 2,
};

// Add in-flight request map (dev only, can be removed in prod)
const inFlightMap: Record<string, number> = {};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any): boolean {
  // Network errors (no response)
  if (!error.status) {
    return true;
  }

  // Server errors (5xx)
  if (error.status >= 500) {
    return true;
  }

  // Rate limiting
  if (error.status === 429) {
    return true;
  }

  // Timeout errors
  if (error.status === 408) {
    return true;
  }

  return false;
}

/**
 * Calculate delay for exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(delay, config.maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current dealer ID from localStorage
 */
function getCurrentDealerId(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('dealer');
    const dealer = stored ? JSON.parse(stored) : null;
    return dealer?.id || null;
  } catch {
    return null;
  }
}

/**
 * Enhanced fetch with retry logic and error handling
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  retryConfig: Partial<RetryConfig> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  let lastError: ApiClientError;

  // Count concurrent requests (dev anti-spam)
  inFlightMap[url] = (inFlightMap[url] || 0) + 1;
  if (process.env.NODE_ENV !== 'production' && inFlightMap[url] > 10) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️ [api-client] More than 10 concurrent requests to ${url}. Count: ${inFlightMap[url]}`);
    // Print basic stack to help debug
    // eslint-disable-next-line no-console
    console.log(new Error().stack);
  }

  try {
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        // Add dealer ID header only for admin requests (when dealer is logged in)
        const dealerId = getCurrentDealerId();
        const headers = {
          ...options.headers,
          // Only add dealer ID header if we have a dealer (admin access)
          ...(dealerId && { 'x-dealer-id': dealerId }),
        };

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle HTTP errors
        if (!response.ok) {
          let errorMessage = 'Request failed';
          let errorData: any = null;

          try {
            errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }

          const apiError = new ApiClientError({
            message: errorMessage,
            status: response.status,
            code: errorData?.code,
            isNetworkError: false,
            isRetryable: isRetryableError({ status: response.status }),
          });

          // If not retryable or last attempt, throw error
          if (!apiError.isRetryable || attempt === config.maxAttempts) {
            throw apiError;
          }

          lastError = apiError;
        } else {
          // Success - parse and return response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          } else {
            return response.text() as any;
          }
        }
      } catch (error) {
        // Handle network errors, timeouts, and other fetch failures
        if (error instanceof ApiClientError) {
          lastError = error;
        } else {
          const isNetworkError =
            error instanceof TypeError ||
            (error as any).name === 'AbortError' ||
            (error as any).code === 'NETWORK_ERROR';

          lastError = new ApiClientError({
            message: isNetworkError
              ? 'Network connection failed. Please check your internet connection.'
              : 'An unexpected error occurred.',
            isNetworkError,
            isRetryable: isNetworkError,
          });
        }

        // If not retryable or last attempt, throw error
        if (!lastError.isRetryable || attempt === config.maxAttempts) {
          throw lastError;
        }
      }

      // Wait before retrying (except on last attempt)
      if (attempt < config.maxAttempts) {
        const delay = calculateDelay(attempt, config);
        await sleep(delay);
      }
    }

    // This should never be reached, but just in case
    throw lastError!;
  } finally {
    // Clean up request count
    inFlightMap[url] = Math.max(0, (inFlightMap[url] || 1) - 1);
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const apiClient = {
  get: <T = any>(url: string, retryConfig?: Partial<RetryConfig>): Promise<T> =>
    apiRequest<T>(url, { method: 'GET' }, retryConfig),

  post: <T = any>(
    url: string,
    data?: any,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> =>
    apiRequest<T>(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      },
      retryConfig
    ),

  put: <T = any>(
    url: string,
    data?: any,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T> =>
    apiRequest<T>(
      url,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: data ? JSON.stringify(data) : undefined,
      },
      retryConfig
    ),

  delete: <T = any>(url: string, retryConfig?: Partial<RetryConfig>): Promise<T> =>
    apiRequest<T>(url, { method: 'DELETE' }, retryConfig),
};