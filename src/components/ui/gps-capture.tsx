/**
 * GPS Capture Component with permission handling and coordinate display
 */

import * as React from 'react';
import { Button } from './button';
import { useGeolocation } from '@/hooks/use-geolocation';
import { cn } from '@/lib/utils';

interface GPSCaptureProps {
  onLocationCapture?: (coordinates: {
    latitude: number;
    longitude: number;
    accuracy: number;
  }) => void;
  onLocationClear?: () => void;
  initialCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null;
  className?: string;
}

export const GPSCapture: React.FC<GPSCaptureProps> = ({
  onLocationCapture,
  onLocationClear,
  initialCoordinates,
  className,
}) => {
  const {
    coordinates,
    loading,
    error,
    supported,
    permission,
    getCurrentPosition,
    clearLocation,
    clearError,
  } = useGeolocation();

  // Use initial coordinates if provided
  const displayCoordinates = coordinates || initialCoordinates;

  // Handle location capture
  const handleCapture = async () => {
    clearError();
    await getCurrentPosition();
  };

  // Handle location clear
  const handleClear = () => {
    clearLocation();
    onLocationClear?.();
  };

  // Notify parent when coordinates change
  const prevCoordinatesRef = React.useRef(coordinates);
  
  React.useEffect(() => {
    if (coordinates && coordinates !== prevCoordinatesRef.current && onLocationCapture) {
      onLocationCapture(coordinates);
      prevCoordinatesRef.current = coordinates;
    }
  }, [coordinates, onLocationCapture]);

  // Format coordinates for display
  const formatCoordinate = (value: number, type: 'lat' | 'lng') => {
    const direction = type === 'lat' 
      ? (value >= 0 ? 'N' : 'S')
      : (value >= 0 ? 'E' : 'W');
    return `${Math.abs(value).toFixed(6)}° ${direction}`;
  };

  // Get accuracy color based on value
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy <= 10) return 'text-success-600';
    if (accuracy <= 50) return 'text-warning-600';
    return 'text-error-600';
  };

  if (!supported) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="bg-neutral-100 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-neutral-500 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-neutral-900">GPS Not Available</p>
              <p className="text-sm text-neutral-600">
                Your device doesn&apos;t support location services.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* GPS Capture Button */}
      <div className="space-y-3">
        <Button
          fullWidth
          variant={displayCoordinates ? 'outline' : 'default'}
          onClick={handleCapture}
          loading={loading}
          disabled={permission === 'denied'}
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {displayCoordinates ? 'Update GPS Location' : 'Capture GPS Location'}
        </Button>

        {displayCoordinates && (
          <Button
            fullWidth
            variant="ghost"
            size="sm"
            onClick={handleClear}
          >
            Clear Location
          </Button>
        )}
      </div>

      {/* Permission Denied State */}
      {permission === 'denied' && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-warning-900">Location Access Denied</p>
              <p className="text-sm text-warning-700">
                Please enable location permissions in your browser settings to use GPS capture.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-error-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-error-900">Location Error</p>
              <p className="text-sm text-error-700 mb-3">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCapture}
                loading={loading}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Coordinates Display */}
      {displayCoordinates && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="h-5 w-5 text-success-500 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-success-900 mb-2">Location Captured</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-success-700">Latitude:</span>
                  <span className="font-mono text-success-800">
                    {formatCoordinate(displayCoordinates.latitude, 'lat')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success-700">Longitude:</span>
                  <span className="font-mono text-success-800">
                    {formatCoordinate(displayCoordinates.longitude, 'lng')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success-700">Accuracy:</span>
                  <span className={cn('font-mono', getAccuracyColor(displayCoordinates.accuracy))}>
                    ±{Math.round(displayCoordinates.accuracy)}m
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-neutral-500 text-center">
        GPS coordinates help track the exact location where this lead was collected.
        This information is optional but recommended for route optimization.
      </div>
    </div>
  );
};