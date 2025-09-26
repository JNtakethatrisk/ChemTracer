import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => Promise<void>;
  clearGuestData: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  
  // Fetch current user
  const { data: user = null, isLoading } = useQuery<User | null>({
    queryKey: ['/me'],
    queryFn: async () => {
      const response = await fetch('/me');
      if (!response.ok) return null;
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isAuthenticated = !!user;

  const login = () => {
    window.location.href = '/auth/google';
  };

  const logout = async () => {
    try {
      await fetch('/auth/logout', { method: 'POST' });
      queryClient.invalidateQueries({ queryKey: ['/me'] });
      queryClient.clear(); // Clear all cached data
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearGuestData = () => {
    sessionStorage.clear();
    queryClient.clear();
  };

  // Check for auth success/failure in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');
    const shouldImport = params.get('import');
    
    if (authStatus === 'success') {
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (shouldImport === 'check') {
        // Check if we have guest data to import
        const guestData = {
          microplasticEntries: sessionStorage.getItem('guestMicroplasticEntries'),
          pfaEntries: sessionStorage.getItem('guestPfaEntries'),
          userProfile: sessionStorage.getItem('guestUserProfile'),
        };
        
        if (guestData.microplasticEntries || guestData.pfaEntries || guestData.userProfile) {
          // Import guest data to user account
          importGuestData(guestData);
        }
      }
      
      // Refresh queries to load user data
      queryClient.invalidateQueries();
    } else if (authStatus === 'failed') {
      window.history.replaceState({}, document.title, window.location.pathname);
      console.error('Authentication failed');
    }
  }, [queryClient]);

  const importGuestData = async (guestData: any) => {
    try {
      // Import microplastic entries
      if (guestData.microplasticEntries) {
        const entries = JSON.parse(guestData.microplasticEntries);
        for (const entry of entries) {
          await fetch('/api/microplastic-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          });
        }
      }
      
      // Import PFA entries
      if (guestData.pfaEntries) {
        const entries = JSON.parse(guestData.pfaEntries);
        for (const entry of entries) {
          await fetch('/api/pfa-entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
          });
        }
      }
      
      // Import user profile
      if (guestData.userProfile) {
        const profile = JSON.parse(guestData.userProfile);
        await fetch('/api/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile),
        });
      }
      
      // Clear guest data after successful import
      clearGuestData();
    } catch (error) {
      console.error('Error importing guest data:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, clearGuestData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
