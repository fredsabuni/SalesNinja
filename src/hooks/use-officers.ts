/**
 * Custom hook for managing officer data with caching and search
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Officer } from '@/types';


import { CACHE_DURATIONS } from '@/lib/constants';

interface UseOfficersOptions {
  searchQuery?: string;
  autoFetch?: boolean;
}

export interface UseOfficersReturn {
  officers: Officer[];
  filteredOfficers: Officer[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  refetch: () => Promise<void>;
  clearError: () => void;
}

export function useOfficers(options: UseOfficersOptions = {}): UseOfficersReturn {
  const { searchQuery: initialSearchQuery = '', autoFetch = true } = options;

  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  // Check if cache is still valid
  const isCacheValid = useCallback(() => {
    if (!lastFetch) return false;
    const now = new Date();
    const cacheAge = now.getTime() - lastFetch.getTime();
    return cacheAge < CACHE_DURATIONS.OFFICERS;
  }, [lastFetch]);

  // Fetch officers from database or API
  const fetchOfficers = useCallback(async (force = false) => {
    if (!force && isCacheValid() && officers.length > 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch officers directly from API (Supabase) - use public access for officer selection
      const response = await fetch('/api/officers?public=true');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch officers: ${response.statusText}`);
      }

      const officerData: Officer[] = await response.json();
      
      setOfficers(officerData);
      setLastFetch(new Date());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch officers';
      setError(errorMessage);
      console.error('Error fetching officers:', err);
    } finally {
      setLoading(false);
    }
  }, [officers.length, isCacheValid]);

  // Filter officers based on search query
  const filteredOfficers = useMemo(() => {
    if (!searchQuery.trim()) {
      return officers;
    }

    const query = searchQuery.toLowerCase().trim();
    return officers.filter(officer => 
      officer.name.toLowerCase().includes(query) ||
      officer.phone.toLowerCase().includes(query) ||
      (officer.dealer?.company || '').toLowerCase().includes(query)
    );
  }, [officers, searchQuery]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchOfficers();
    }
  }, [autoFetch, fetchOfficers]);

  // Refetch function for manual refresh
  const refetch = useCallback(() => {
    return fetchOfficers(true);
  }, [fetchOfficers]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    officers,
    filteredOfficers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    refetch,
    clearError,
  };
}