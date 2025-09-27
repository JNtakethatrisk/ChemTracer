import { useState } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { CheckCircle } from "lucide-react";

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
      case "low": return "text-green-600 bg-green-50";
      case "normal": return "text-yellow-600 bg-yellow-50";
      case "high": return "text-orange-600 bg-orange-50";
      case "extreme": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const isGreen = trackerType === "pfas";
  const primaryColor = isGreen ? "green" : "blue";
  const bgColor = isGreen ? "bg-green-50" : "bg-blue-50";
  const borderColor = isGreen ? "border-green-200" : "border-blue-200";
  const textColor = isGreen ? "text-green-800" : "text-blue-800";
  const buttonBg = isGreen ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md border ${borderColor}`}>
        <div className={`p-6 ${bgColor} rounded-lg`}>
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className={`rounded-full p-3 bg-white shadow-sm`}>
              <CheckCircle className={`w-8 h-8 ${isGreen ? 'text-green-600' : 'text-blue-600'}`} />
            </div>
          </div>
          
          {/* Title */}
          <h2 className={`text-xl font-semibold ${textColor} text-center mb-6`}>
            Your Results Are Ready!
          </h2>
          
          {/* Results Box */}
          <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
            <p className={`text-sm ${textColor} text-center mb-2`}>
              This Week's {trackerType === "microplastic" ? "Microplastic" : "PFAS"} Intake
            </p>
            <p className={`text-3xl font-bold ${textColor} text-center mb-2`}>
              {totalValue} <span className="text-lg font-normal">{unit}</span>
            </p>
            <div className={`text-center`}>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(riskLevel)}`}>
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Info Text */}
          <p className={`text-sm ${textColor} text-center mb-6`}>
            View your detailed insights and recommendations in the dashboard above.
          </p>

          {/* Checkbox */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Checkbox 
              id="dontShow" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
              className={isGreen ? 'border-green-300 data-[state=checked]:bg-green-600' : 'border-blue-300 data-[state=checked]:bg-blue-600'}
            />
            <label 
              htmlFor="dontShow" 
              className={`text-sm ${textColor} cursor-pointer`}
            >
              Don't show this again
            </label>
          </div>

          {/* Button */}
          <Button 
            onClick={handleClose} 
            className={`w-full ${buttonBg} text-white font-medium`}
          >
            View Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
