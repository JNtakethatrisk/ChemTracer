// import { useState, useEffect, useRef } from "react";
// import { useQuery } from "@tanstack/react-query";
import { Shield, CheckCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// interface DashboardStats {
//   currentRiskLevel: string;
//   currentParticleCount: number;
//   weeklyIntake: number;
//   monthlyAverage: number;
//   dataCompleteness: number;
//   weeklyChange: number;
// }

interface SafeLevelNotificationProps {
  show: boolean;
  particleCount: number;
  onClose: () => void;
}

export default function SafeLevelNotification({ show, particleCount, onClose }: SafeLevelNotificationProps) {

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md mx-4 border-green-500 border-2">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {/* Success Symbol */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                <Shield className="w-10 h-10 text-white" />
              </div>
            </div>
            
            {/* Success Title */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-600 uppercase tracking-wide">
                EXCELLENT!
              </h2>
              <p className="text-lg font-semibold text-gray-900">
                You're in the Safe Zone!
              </p>
            </div>
            
            {/* Success Message */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800">
                Your microplastic exposure is in the LOW RISK category with{" "}
                <span className="font-bold">{particleCount.toFixed(1)} particles/mL</span>{" "}
                in your bloodstream. Keep up the great work!
              </AlertDescription>
            </Alert>
            
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open("https://www.plasticpollutioncoalition.org/reduce-plastic-use", "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More Ways to Stay Safe
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full border-green-500 text-green-700 hover:bg-green-50"
                onClick={onClose}
                data-testid="button-close-safe-notification"
              >
                Continue Tracking
              </Button>
            </div>
            
            {/* Additional Info */}
            <p className="text-xs text-gray-600 mt-4">
              Your healthy choices are working! Continue avoiding plastic-packaged foods and bottled water.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}