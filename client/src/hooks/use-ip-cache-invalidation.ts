import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface IPResponse {
  ip: string;
}

export function useIPCacheInvalidation() {
  // Fetch current IP
  const { data: ipData } = useQuery<IPResponse>({
    queryKey: ['/api/user-ip'],
    staleTime: 0, // Always fresh check
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!ipData?.ip) return;

    const currentIp = ipData.ip;
    const storedIp = localStorage.getItem('microplastic-tracker-ip');

    // If this is a new IP, clear all cached data
    if (storedIp && storedIp !== currentIp) {
      console.log('New IP detected, clearing cache for fresh slate');
      queryClient.clear();
      localStorage.clear();
    }

    // Store the current IP
    localStorage.setItem('microplastic-tracker-ip', currentIp);
  }, [ipData?.ip]);
}