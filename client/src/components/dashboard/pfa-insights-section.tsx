import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Lightbulb, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { PFA_RISK_LEVELS } from "../../../../shared/schema";
import { getPfaSourceBreakdown } from "../../lib/pfa-sources";

interface PfaInsightsSectionProps {
  entries: any[];
  currentRiskLevel: string;
  weeklyIntake: number;
  monthlyAverage: number;
}

export function PfaInsightsSection({ 
  entries, 
  currentRiskLevel, 
  weeklyIntake, 
  // monthlyAverage 
}: PfaInsightsSectionProps) {
  const getRiskLevelInfo = (riskLevel: string) => {
    return Object.values(PFA_RISK_LEVELS).find(level => level.label === riskLevel) || PFA_RISK_LEVELS.LOW;
  };

  const getRiskLevelProgress = (riskLevel: string) => {
    const riskInfo = getRiskLevelInfo(riskLevel);
    if (riskLevel === "No Data") return 0;
    
    // Calculate progress within the risk level range
    const range = riskInfo.max - riskInfo.min;
    const position = Math.min(weeklyIntake - riskInfo.min, range);
    return Math.max(0, Math.min(100, (position / range) * 100));
  };

  const getTopSources = (entry: any) => {
    const breakdown = getPfaSourceBreakdown(entry);
    return breakdown
      .filter(source => source.value > 0)
      .sort((a, b) => b.pfas - a.pfas)
      .slice(0, 3);
  };

  const getRecommendations = (riskLevel: string, topSources: any[]) => {
    const recommendations = [];
    
    if (riskLevel === "High" || riskLevel === "Extreme") {
      recommendations.push({
        icon: AlertTriangle,
        title: "Reduce PFA Exposure",
        description: "Your PFA levels are concerning. Consider switching to PFA-free alternatives.",
        priority: "high"
      });
    }

    if (topSources.some(source => source.source === "Dental Floss")) {
      recommendations.push({
        icon: Shield,
        title: "Switch Dental Floss",
        description: "Use PFA-free dental floss brands like silk or bamboo floss.",
        priority: "medium"
      });
    }

    if (topSources.some(source => source.source === "Toilet Paper")) {
      recommendations.push({
        icon: Shield,
        title: "Choose PFA-Free Toilet Paper",
        description: "Look for brands that explicitly state they are PFA-free.",
        priority: "medium"
      });
    }

    if (topSources.some(source => source.source === "Yoga Pants" || source.source === "Sports Bras")) {
      recommendations.push({
        icon: Shield,
        title: "Opt for Natural Fibers",
        description: "Choose cotton or wool athletic wear instead of synthetic materials.",
        priority: "medium"
      });
    }

    if (topSources.some(source => source.source === "Tap Water")) {
      recommendations.push({
        icon: Shield,
        title: "Filter Your Water",
        description: "Use a high-quality water filter that removes PFAS chemicals.",
        priority: "high"
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        icon: Lightbulb,
        title: "Maintain Low Exposure",
        description: "Keep up the good work! Continue avoiding PFA-containing products.",
        priority: "low"
      });
    }

    return recommendations;
  };

  const latestEntry = entries[0];
  const topSources = latestEntry ? getTopSources(latestEntry) : [];
  const recommendations = getRecommendations(currentRiskLevel, topSources);

  const riskInfo = getRiskLevelInfo(currentRiskLevel);
  const progress = getRiskLevelProgress(currentRiskLevel);

  return (
    <div className="space-y-6">
      {/* Risk Level Analysis */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            PFA Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800">Current Risk Level</h3>
              <p className="text-sm text-green-600">{riskInfo.description}</p>
            </div>
            <Badge 
              variant="outline" 
              className={`${
                currentRiskLevel === 'Low' ? 'bg-green-100 text-green-800 border-green-300' :
                currentRiskLevel === 'Normal' ? 'bg-green-200 text-green-900 border-green-400' :
                currentRiskLevel === 'High' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                'bg-red-100 text-red-800 border-red-300'
              }`}
            >
              {currentRiskLevel}
            </Badge>
          </div>
          
          {currentRiskLevel !== "No Data" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-green-700">
                <span>Risk Level Progress</span>
                <span>{(progress || 0).toFixed(0)}%</span>
              </div>
              <Progress 
                value={progress || 0} 
                className="h-2"
                style={{
                  backgroundColor: '#d1fae5',
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Sources */}
      {topSources.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Top PFA Sources This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topSources.map((source, index) => (
                <div key={source.source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-semibold text-green-800">
                      {index + 1}
                    </div>
                    <span className="text-green-800 font-medium">{source.source}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-700 font-mono text-sm">
                      {(source.pfas || 0).toFixed(3)} ppt
                    </div>
                    <div className="text-green-600 text-xs">
                      {source.percentage}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <Alert 
                key={index}
                className={`${
                  rec.priority === 'high' ? 'border-red-200 bg-red-50' :
                  rec.priority === 'medium' ? 'border-orange-200 bg-orange-50' :
                  'border-green-200 bg-green-50'
                }`}
              >
                <rec.icon className={`h-4 w-4 ${
                  rec.priority === 'high' ? 'text-red-600' :
                  rec.priority === 'medium' ? 'text-orange-600' :
                  'text-green-600'
                }`} />
                <AlertDescription className={`${
                  rec.priority === 'high' ? 'text-red-800' :
                  rec.priority === 'medium' ? 'text-orange-800' :
                  'text-green-800'
                }`}>
                  <div className="font-semibold">{rec.title}</div>
                  <div className="text-sm mt-1">{rec.description}</div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learn More */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800">About PFA Exposure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-green-700">
            <p className="text-sm">
              <strong>PFAS (Per- and Polyfluoroalkyl Substances)</strong> are "forever chemicals" found in many everyday products. 
              They can accumulate in your body and have been linked to various health concerns.
            </p>
            <p className="text-sm">
              This tracker helps you monitor your exposure from common sources like dental floss, toilet paper, 
              athletic wear, tap water, and more.
            </p>
            <div className="pt-2">
              <a 
                href="https://time.com/6281242/pfas-forever-chemicals-home-beauty-body-products/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 text-sm font-medium underline"
              >
                Learn more about PFA sources and health impacts →
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PfaInsightsSection;
