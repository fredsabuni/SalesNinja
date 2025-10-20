/**
 * Custom hook for GPS location capture with permission handling
 */

import { useState, useCallback, useEffect } from 'react';
import { GPS_CONSTANTS } from '@/lib/constants';
import { validateGPSCoordinates } from '@/lib/transformers';

interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

interface UseGeolocationReturn {
  coordinates: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
  permission: PermissionState | null;
  getCurrentPosition: () => Promise<void>;
  clearLocation: () => void;
  clearError: () => void;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const {
    enableHighAccuracy = GPS_CONSTANTS.HIGH_ACCURACY,
    timeout = GPS_CONSTANTS.TIMEOUT,
    maximumAge = GPS_CONSTANTS.MAX_AGE,
  } = options;

  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState | null>(null);

  // Check if geolocation is supported
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Check permission status
  const checkPermission = useCallback(async () => {
    if (!supported || !navigator.permissions) {
      return;
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      setPermission(result.state);
      
      // Listen for permission changes
      result.addEventListener('change', () => {
        setPermission(result.state);
      });
    } catch (err) {
      console.warn('Could not check geolocation permission:', err);
    }
  }, [supported]);

  // Get current position
  const getCurrentPosition = useCallback(async (): Promise<void> => {
    if (!supported) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    setError(null);

    const options: PositionOptions = {
      enableHighAccuracy,
      timeout,
      maximumAge,
    };

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });

      const { latitude, longitude, accuracy } = position.coords;

      // Validate coordinates
      if (!validateGPSCoordinates(latitude, longitude)) {
        throw new Error('Invalid GPS coordinates received');
      }

      // Check accuracy threshold
      if (accuracy > GPS_CONSTANTS.ACCURACY_THRESHOLD) {
        console.warn(`GPS accuracy is low: ${accuracy}m`);
      }

      setCoordinates({
        latitude,
        longitude,
        accuracy,
      });

    } catch (err) {
      let errorMessage = 'Failed to get location';

      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case GeolocationPositionError.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case GeolocationPositionError.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try again.';
            break;
          case GeolocationPositionError.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Geolocation error:', err);
    } finally {
      setLoading(false);
    }
  }, [supported, enableHighAccuracy, timeout, maximumAge]);

  // Clear location data
  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    coordinates,
    loading,
    error,
    supported,
    permission,
    getCurrentPosition,
    clearLocation,
    clearError,
  };
}