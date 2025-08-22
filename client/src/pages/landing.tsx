import { useState } from "react";
import { useLocation } from "wouter";
import { Microscope, ChevronRight, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isSwipeStarted, setIsSwipeStarted] = useState(false);

  const handleSwipeStart = () => {
    setIsSwipeStarted(true);
    setTimeout(() => {
      setLocation("/dashboard");
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Logo and Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Microscope className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Welcome to<br />
            <span className="text-primary">Micro Plastics Tracker</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 font-medium">
            Track Microplastics in Your Body –<br />
            Take Control of Your Health Today
          </p>
        </div>

        {/* Description */}
        <div className="max-w-lg mx-auto">
          <p className="text-gray-600 text-lg leading-relaxed">
            Access our free AI powered calculator today - developed in house, by professionals.
          </p>
        </div>

        {/* Swipe Card */}
        <Card 
          className={`max-w-md mx-auto cursor-pointer transition-all duration-300 hover:shadow-xl ${
            isSwipeStarted ? 'transform translate-x-8 opacity-75' : ''
          }`}
          onClick={handleSwipeStart}
          data-testid="swipe-card"
        >
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Hand className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Get Started</p>
                  <p className="text-sm text-gray-600">Swipe to access calculator</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Alternative Button */}
        <div className="pt-4">
          <Button 
            onClick={() => setLocation("/dashboard")}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg"
            data-testid="button-enter-dashboard"
          >
            Enter Dashboard
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 max-w-4xl mx-auto">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900">Risk Assessment</h3>
            <p className="text-sm text-gray-600">Get personalized risk levels based on your consumption</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900">Weekly Tracking</h3>
            <p className="text-sm text-gray-600">Monitor your microplastic intake from various sources</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <div className="w-6 h-6 bg-purple-500 rounded-full"></div>
            </div>
            <h3 className="font-semibold text-gray-900">Data Insights</h3>
            <p className="text-sm text-gray-600">View trends and get recommendations to reduce exposure</p>
          </div>
        </div>
      </div>
    </div>
  );
}