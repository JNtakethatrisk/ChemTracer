import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronRight, Leaf } from "lucide-react";
// import { Button } from "../ui/button";
import { Card, CardContent } from "../components/ui/card";
import Navigation from "../components/navigation";
import Logo from "../components/logo";
import PlasticLogo from "../components/plastic-logo";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [isSwipeStarted, setIsSwipeStarted] = useState(false);

  const handleSwipeStart = () => {
    setIsSwipeStarted(true);
    setTimeout(() => {
      setLocation("/dashboard");
    }, 300);
  };

  const handlePfaClick = () => {
    setLocation("/pfa-dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-green-50">
      {/* Navigation */}
      <Navigation />
      
      <div className="flex items-center justify-center p-3 sm:p-4 pt-6 sm:pt-8">
        <div className="container mx-auto text-center space-y-6 sm:space-y-8 w-full max-w-4xl">
          {/* Logo and Icon */}
          <div className="flex justify-center items-center mb-6 sm:mb-8">
            <Logo size="lg" className="text-green-600 flex items-center" />
          </div>

          {/* Main Title */}
          <div className="space-y-4 sm:space-y-6 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-green-800 leading-tight italic px-2">
              ChemTracer™
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl text-green-600 font-bold max-w-3xl mx-auto px-4">
              Access our free AI powered calculators today. <span className="italic">Developed in house, by professionals.</span>
            </p>
          </div>

          {/* Tracker Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* Microplastic Tracker */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 min-h-[80px] sm:min-h-[100px] ${
                isSwipeStarted ? 'transform translate-x-8 opacity-75' : ''
              }`}
              onClick={handleSwipeStart}
              data-testid="swipe-card"
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-lg border-2 border-blue-200">
                      <PlasticLogo size="sm" className="text-blue-600 sm:hidden" />
                      <PlasticLogo size="md" className="text-blue-600 hidden sm:block" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg sm:text-xl text-blue-800">Microplastic Tracker</p>
                      <p className="text-sm sm:text-base text-blue-700 font-medium">Start tracking your exposure</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            {/* PFA Tracker */}
            <Card 
              className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 min-h-[80px] sm:min-h-[100px]"
              onClick={handlePfaClick}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                      <Leaf className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg sm:text-xl text-emerald-800">PFA Tracker</p>
                      <p className="text-sm sm:text-base text-emerald-700 font-medium">Monitor forever chemicals</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pt-6 sm:pt-8 max-w-4xl mx-auto w-full">
            <div className="text-center space-y-2 p-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-green-800 text-sm sm:text-base">Risk Assessment</h3>
              <p className="text-xs sm:text-sm text-green-700">Get personalized unlimited risk level assessments based on your consumption, age, and location</p>
            </div>
            
            <div className="text-center space-y-2 p-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-green-800 text-sm sm:text-base">Weekly Tracking</h3>
              <p className="text-xs sm:text-sm text-green-700">Monitor your microplastic and PFAS intake based on peer reviewed studies</p>
            </div>
            
            <div className="text-center space-y-2 p-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-teal-500 rounded-full"></div>
              </div>
              <h3 className="font-semibold text-green-800 text-sm sm:text-base">Data Insights</h3>
              <p className="text-xs sm:text-sm text-green-700">View trends and get recommendations to reduce exposure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}