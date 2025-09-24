import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle, Shield, Droplets, Shirt, Heart, Square } from "lucide-react";

export function PfaLearnMoreModal() {
  const [isOpen, setIsOpen] = useState(false);

  const pfaSources = [
    {
      icon: Heart,
      title: "Dental Floss",
      description: "Many dental floss brands contain PFAS for smooth gliding",
      brands: ["Oral-B Glide", "Colgate Total Waxed", "Up & Up Smooth Slide", "Solimo Extra Comfort"],
      risk: "High levels detected",
      color: "bg-pink-100 text-pink-800 border-pink-300"
    },
    {
      icon: Square,
      title: "Toilet Paper",
      description: "PFAS found in many toilet paper brands for water resistance",
      brands: ["Charmin Ultra Soft", "Seventh Generation", "Who Gives a Crap", "Tushy Bamboo"],
      risk: "Low but detectable levels",
      color: "bg-blue-100 text-blue-800 border-blue-300"
    },
    {
      icon: Shirt,
      title: "Sweat/Water Resistant Clothing",
      description: "PFAS-treated athletic wear for moisture control",
      brands: ["Yoga pants", "Workout clothes", "Sports bras", "25% of yoga pants tested", "65% of sports bras tested"],
      risk: "High exposure risk",
      color: "bg-purple-100 text-purple-800 border-purple-300"
    },
    {
      icon: Droplets,
      title: "Tap Water",
      description: "PFAS contamination in water supplies nationwide",
      brands: ["EPA regulates only 2 types", "12,000+ other PFAS unregulated"],
      risk: "Widespread contamination",
      color: "bg-cyan-100 text-cyan-800 border-cyan-300"
    },
    {
      icon: Shield,
      title: "Non-Stick Pans",
      description: "PFAS-coated cookware releases chemicals when heated",
      brands: ["Teflon and similar coatings", "Most non-stick cookware"],
      risk: "High heat exposure risk",
      color: "bg-orange-100 text-orange-800 border-orange-300"
    }
  ];

  const healthImpacts = [
    "Immune system suppression",
    "Thyroid hormone disruption", 
    "Increased cholesterol levels",
    "Liver damage",
    "Kidney cancer",
    "Testicular cancer",
    "Pregnancy complications",
    "Developmental delays in children"
  ];

  const preventionTips = [
    "Choose PFA-free dental floss (silk or bamboo)",
    "Use unbleached, PFA-free toilet paper",
    "Wear natural fiber clothing (cotton, wool)",
    "Install high-quality water filters",
    "Avoid non-stick cookware",
    "Check product labels for 'PFA-free' claims",
    "Support companies with PFA-free policies"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
          <Info className="h-4 w-4 mr-2" />
          Learn More About PFA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800">Understanding PFA Exposure</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* What are PFAS */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Info className="h-5 w-5" />
                What are PFAS?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-green-700">
              <p>
                <strong>PFAS (Per- and Polyfluoroalkyl Substances)</strong> are a group of over 12,000 synthetic chemicals 
                known as "forever chemicals" because they don't break down naturally in the environment.
              </p>
              <p>
                They're used in products for their water, grease, and stain-resistant properties, but they can 
                accumulate in your body and have been linked to serious health problems.
              </p>
            </CardContent>
          </Card>

          {/* Common Sources */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Common PFA Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pfaSources.map((source, index) => (
                  <div key={index} className="p-4 border border-green-200 rounded-lg bg-white">
                    <div className="flex items-start space-x-3">
                      <source.icon className="h-6 w-6 text-green-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-green-800">{source.title}</h3>
                        <p className="text-sm text-green-700 mt-1">{source.description}</p>
                        <div className="mt-2">
                          <Badge variant="outline" className={source.color}>
                            {source.risk}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-green-600 font-medium">Brands tested:</p>
                          <p className="text-xs text-green-600">{source.brands.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Health Impacts */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Potential Health Impacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-red-200 bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Important:</strong> Research is ongoing, but PFAS have been linked to various health concerns. 
                  Consult your healthcare provider for personalized advice.
                </AlertDescription>
              </Alert>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                {healthImpacts.map((impact, index) => (
                  <div key={index} className="flex items-center space-x-2 text-red-700">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">{impact}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Prevention Tips */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                How to Reduce PFA Exposure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {preventionTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-semibold text-green-800 mt-0.5">
                      {index + 1}
                    </div>
                    <p className="text-green-700">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* EPA Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">EPA Regulations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-blue-700">
              <p>
                The EPA has set limits for only <strong>2 types of PFAS</strong> in drinking water:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>PFOS:</strong> 0.02 parts per trillion (ppt)</li>
                <li><strong>PFOA:</strong> 0.004 parts per trillion (ppt)</li>
              </ul>
              <p className="text-sm">
                However, there are over 12,000 other PFAS chemicals that remain unregulated, 
                and nationwide testing is not mandatory.
              </p>
            </CardContent>
          </Card>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button 
              onClick={() => setIsOpen(false)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PfaLearnMoreModal;
