import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardStats {
  currentRiskLevel: string;
  currentParticleCount: number;
  weeklyIntake: number;
  monthlyAverage: number;
  dataCompleteness: number;
  weeklyChange: number;
}

export default function HighRiskWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"],
  });

  useEffect(() => {
    // Only show if user has high risk, has data, and hasn't dismissed it this session
    if (stats?.currentRiskLevel === "High" && stats?.currentParticleCount > 0 && !dismissed) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [stats?.currentRiskLevel, stats?.currentParticleCount, dismissed]);

  if (!showWarning || stats?.currentRiskLevel !== "High" || !stats?.currentParticleCount || stats.currentParticleCount <= 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md mx-4 border-red-500 border-2">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Hazard Symbol */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Warning Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-red-600 uppercase tracking-wide">
                DANGER
              </h2>
              <p className="text-lg font-semibold text-gray-900">
                YOU ARE BECOMING PLASTIC!!
              </p>
            </div>
            
            {/* Warning Message */}
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-sm text-red-800">
                Your microplastic exposure level is in the HIGH RISK category with{" "}
                <span className="font-bold">{stats.currentParticleCount.toFixed(1)} particles/mL</span>{" "}
                in your bloodstream. Immediate action is recommended to reduce exposure.
              </AlertDescription>
            </Alert>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => window.open("https://www.plasticpollutioncoalition.org/microplastics-health", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Talk to a Microplastic Professional Today
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setDismissed(true);
                  setShowWarning(false);
                }}
                data-testid="button-close-warning"
              >
                I Understand the Risk
              </Button>
            </div>
            
            {/* Additional Info */}
            <p className="text-xs text-gray-600 mt-4">
              Consider reducing bottled water, plastic-packaged foods, and synthetic clothing usage immediately.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}