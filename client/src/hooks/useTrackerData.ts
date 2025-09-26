import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { guestStorage } from '../services/guestStorage';

// Custom hook that handles both guest and authenticated data
export function useTrackerData(type: 'microplastic' | 'pfa') {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Determine endpoints based on type
  const endpoints = {
    microplastic: {
      entries: '/api/microplastic-entries',
      calc: '/api/calc/microplastic',
      stats: '/api/dashboard-stats',
    },
    pfa: {
      entries: '/api/pfa-entries',
      calc: '/api/calc/pfa',
      stats: '/api/pfa-dashboard-stats',
    },
  };

  const endpoint = endpoints[type];

  // Get entries (from API if authenticated, from sessionStorage if guest)
  const entriesQuery = useQuery({
    queryKey: [endpoint.entries, isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        // Guest mode - get from sessionStorage
        return type === 'microplastic' 
          ? guestStorage.getMicroplasticEntries()
          : guestStorage.getPfaEntries();
      }
      
      // Authenticated - get from API
      const response = await fetch(endpoint.entries);
      if (!response.ok) {
        if (response.status === 401) {
          // Not authenticated, return guest data
          return type === 'microplastic' 
            ? guestStorage.getMicroplasticEntries()
            : guestStorage.getPfaEntries();
        }
        throw new Error('Failed to fetch entries');
      }
      return response.json();
    },
    staleTime: isAuthenticated ? 5 * 60 * 1000 : 0, // 5 min for auth, always fresh for guest
  });

  // Get dashboard stats
  const statsQuery = useQuery({
    queryKey: [endpoint.stats, isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) {
        // Guest mode - calculate from sessionStorage
        return type === 'microplastic' 
          ? guestStorage.getDashboardStats()
          : guestStorage.getPfaDashboardStats();
      }
      
      // Authenticated - get from API
      const response = await fetch(endpoint.stats);
      if (!response.ok) {
        if (response.status === 401) {
          return type === 'microplastic' 
            ? guestStorage.getDashboardStats()
            : guestStorage.getPfaDashboardStats();
        }
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    staleTime: isAuthenticated ? 5 * 60 * 1000 : 0,
  });

  // Create entry mutation
  const createEntry = useMutation({
    mutationFn: async (data: any) => {
      // First, always calculate using the public endpoint
      const calcResponse = await fetch(endpoint.calc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!calcResponse.ok) {
        throw new Error('Failed to calculate');
      }
      
      const calculated = await calcResponse.json();
      const entryData = {
        ...data,
        totalParticles: calculated.totalParticles || calculated.totalPfas,
        riskLevel: calculated.riskLevel,
      };

      if (!isAuthenticated) {
        // Guest mode - save to sessionStorage
        if (type === 'microplastic') {
          guestStorage.saveMicroplasticEntry(entryData);
        } else {
          guestStorage.savePfaEntry(entryData);
        }
        return entryData;
      }

      // Authenticated - save to API
      const response = await fetch(endpoint.entries, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Fall back to guest mode
          if (type === 'microplastic') {
            guestStorage.saveMicroplasticEntry(entryData);
          } else {
            guestStorage.savePfaEntry(entryData);
          }
          return entryData;
        }
        throw new Error('Failed to create entry');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [endpoint.entries] });
      queryClient.invalidateQueries({ queryKey: [endpoint.stats] });
    },
  });

  return {
    entries: entriesQuery.data || [],
    stats: statsQuery.data,
    isLoading: entriesQuery.isLoading || statsQuery.isLoading,
    error: entriesQuery.error || statsQuery.error,
    createEntry: createEntry.mutate,
    isCreating: createEntry.isPending,
    isGuest: !isAuthenticated,
  };
}
