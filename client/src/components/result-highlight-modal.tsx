import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { TrendingUp, AlertCircle } from "lucide-react";

interface ResultHighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalValue: number;
  riskLevel: string;
  unit: string;
  trackerType: "microplastic" | "pfas";
}

export function ResultHighlightModal({ 
  isOpen, 
  onClose, 
  totalValue, 
  riskLevel, 
  unit,
  trackerType 
}: ResultHighlightModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(`${trackerType}-result-modal-hidden`, "true");
    }
    onClose();
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "low": return "text-green-600";
      case "normal": return "text-yellow-600";
      case "high": return "text-orange-600";
      case "extreme": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getEmoji = (level: string) => {
    switch (level.toLowerCase()) {
      case "low": return "✅";
      case "normal": return "⚠️";
      case "high": return "🔶";
      case "extreme": return "🚨";
      default: return "ℹ️";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Your Results Are Ready!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">This Week's {trackerType === "microplastic" ? "Microplastic" : "PFAS"} Intake</p>
            <p className="text-4xl font-bold text-gray-900 mb-2">
              {totalValue} <span className="text-xl font-normal">{unit}</span>
            </p>
            <p className={`text-lg font-semibold ${getRiskColor(riskLevel)}`}>
              {getEmoji(riskLevel)} {riskLevel} Risk Level
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>
                Your results have been calculated and are displayed at the top of your dashboard. 
                Scroll up to see detailed insights and track your progress over time.
              </span>
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="dontShow" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label 
              htmlFor="dontShow" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Don't show this again
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleClose} className="bg-blue-600 hover:bg-blue-700">
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
