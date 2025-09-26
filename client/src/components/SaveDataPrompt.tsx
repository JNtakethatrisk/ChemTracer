import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Save, TrendingUp } from 'lucide-react';
import { guestStorage } from '../services/guestStorage';

interface SaveDataPromptProps {
  variant?: 'inline' | 'card';
}

export function SaveDataPrompt({ variant = 'card' }: SaveDataPromptProps) {
  const { isAuthenticated, login } = useAuth();
  
  if (isAuthenticated) {
    return null;
  }

  const guestStats = {
    microplastic: guestStorage.getMicroplasticEntries().length,
    pfa: guestStorage.getPfaEntries().length,
  };

  const totalEntries = guestStats.microplastic + guestStats.pfa;

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-center gap-3">
          <Save className="h-5 w-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Save your data</p>
            <p className="text-sm text-green-700">
              Sign in to track your progress over time
            </p>
          </div>
        </div>
        <Button
          onClick={login}
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          Sign in to save
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900 mb-2">
              Track Your Progress
            </h3>
            <p className="text-sm text-green-700 mb-4">
              {totalEntries > 0 
                ? `You have ${totalEntries} unsaved ${totalEntries === 1 ? 'entry' : 'entries'}. Sign in to save your data and track your exposure over time.`
                : 'Sign in to save your data and track your chemical exposure over time with detailed analytics and insights.'
              }
            </p>
            <Button
              onClick={login}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              Sign in with Google to save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
