/**
 * Application configuration
 * Centralizes environment variables and app settings
 */

// Environment variables with defaults
export const config = {
  // API Configuration
  n8n: {
    webhookUrl: process.env.N8N_WEBHOOK_URL || '',
    apiKey: process.env.N8N_API_KEY || '',
  },
  
  notion: {
    apiKey: process.env.NOTION_API_KEY || '',
    officersDatabaseId: process.env.NOTION_OFFICERS_DATABASE_ID || '',
  },
  
  // Application settings
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Lead Generation Tool',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
  
  // Feature flags
  features: {
    gpsEnabled: process.env.NEXT_PUBLIC_GPS_ENABLED !== 'false',
    offlineMode: process.env.NEXT_PUBLIC_OFFLINE_MODE !== 'false',
    pushNotifications: process.env.NEXT_PUBLIC_PUSH_NOTIFICATIONS === 'true',
    analytics: process.env.NEXT_PUBLIC_ANALYTICS === 'true',
    debugMode: process.env.NODE_ENV === 'development',
  },
  
  // Performance settings
  performance: {
    syncInterval: parseInt(process.env.SYNC_INTERVAL || '30000'),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    cacheTimeout: parseInt(process.env.CACHE_TIMEOUT || '3600000'),
  },
} as const;

/**
 * Validate required environment variables
 */
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required production variables
  if (config.app.environment === 'production') {
    if (!config.n8n.webhookUrl) {
      errors.push('N8N_WEBHOOK_URL is required in production');
    }
    
    if (!config.notion.apiKey) {
      errors.push('NOTION_API_KEY is required in production');
    }
    
    if (!config.notion.officersDatabaseId) {
      errors.push('NOTION_OFFICERS_DATABASE_ID is required in production');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get API base URL for different environments
 */
export function getApiBaseUrl(): string {
  if (config.app.environment === 'production') {
    return config.app.baseUrl;
  }
  
  return 'http://localhost:3000';
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof config.features): boolean {
  return config.features[feature];
}

/**
 * Get configuration for specific environment
 */
export function getEnvironmentConfig() {
  const isDevelopment = config.app.environment === 'development';
  const isProduction = config.app.environment === 'production';
  
  return {
    isDevelopment,
    isProduction,
    apiUrl: getApiBaseUrl(),
    enableLogging: isDevelopment || config.features.debugMode,
    enableServiceWorker: isProduction,
    enableAnalytics: isProduction && config.features.analytics,
  };
}