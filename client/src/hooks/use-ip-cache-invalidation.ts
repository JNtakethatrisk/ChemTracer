import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface SessionResponse {
  ip: string;
  sessionId: string;
  isNewSession: boolean;
}

export function useSessionCacheInvalidation() {
  // Fetch current session info
  const { data: sessionData } = useQuery<SessionResponse>({
    queryKey: ['/api/user-session'],
    staleTime: 0, // Always fresh check
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!sessionData?.sessionId) return;

    const currentSessionId = sessionData.sessionId;
    const storedSessionId = localStorage.getItem('microplastic-tracker-session');
    const isNewSession = !storedSessionId || storedSessionId !== currentSessionId;

    console.log('Session Check:', { 
      currentSessionId, 
      storedSessionId, 
      isNewSession,
      userIp: sessionData.ip
    });

    // Clear cache for any new session (including first visit)
    if (isNewSession) {
      console.log('New session detected, clearing cache for fresh slate');
      
      // Clear all React Query cache
      queryClient.clear();
      
      // Clear all localStorage except for theme preferences
      const theme = localStorage.getItem('theme');
      localStorage.clear();
      if (theme) {
        localStorage.setItem('theme', theme);
      }
      
      // Force refetch all queries
      queryClient.invalidateQueries();
    } else {
      console.log('Returning user detected, keeping existing data');
    }

    // Store the current session ID
    localStorage.setItem('microplastic-tracker-session', currentSessionId);
  }, [sessionData?.sessionId]);
}