import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Info, LogIn } from 'lucide-react';
import { guestStorage } from '../services/guestStorage';

export function GuestBanner() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isLoading || isAuthenticated) {
    return null;
  }

  const hasGuestData = guestStorage.hasData();

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>
              You're in guest mode. Data will be lost when you close this tab.
              {hasGuestData && " Sign in to save your entries permanently."}
            </span>
          </div>
          <Button
            onClick={login}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </Button>
        </div>
      </div>
    </div>
  );
}
