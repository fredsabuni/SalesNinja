/**
 * Hook for managing network status and connectivity
 */

import { useState, useEffect, useCallback } from 'react';
import { addNetworkStatusListeners, checkConnectivity } from '@/lib/error-utils';

export interface NetworkStatus {
  isOnline: boolean;
  isConnected: boolean;
  isChecking: boolean;
  lastChecked: Date | null;
}

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isConnected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isChecking: false,
    lastChecked: null,
  });

  const checkConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, isChecking: true }));
    
    try {
      const isConnected = await checkConnectivity();
      setStatus(prev => ({
        ...prev,
        isConnected,
        isChecking: false,
        lastChecked: new Date(),
      }));
      return isConnected;
    } catch {
      setStatus(prev => ({
        ...prev,
        isConnected: false,
        isChecking: false,
        lastChecked: new Date(),
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial connectivity check
    checkConnection();

    // Set up network status listeners
    const cleanup = addNetworkStatusListeners(
      () => {
        setStatus(prev => ({ ...prev, isOnline: true }));
        // Verify actual connectivity when coming online
        checkConnection();
      },
      () => {
        setStatus(prev => ({ 
          ...prev, 
          isOnline: false, 
          isConnected: false 
        }));
      }
    );

    return cleanup;
  }, [checkConnection]);

  return {
    ...status,
    checkConnection,
  };
}