import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { MicroplasticEntry, RISK_LEVELS } from "../../../../shared/schema";
import { getSourceBreakdown } from "../../lib/microplastic-sources";

interface DashboardStats {
  currentRiskLevel: string;
  currentParticleCount: number;
  weeklyIntake: number;
  monthlyAverage: number;
  dataCompleteness: number;
  weeklyChange: number;
}

export default function InsightsSection() {
  const { data: entries = [] } = useQuery<MicroplasticEntry[]>({
    queryKey: ["/api/microplastic-entries"],
  });

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"],
  });

  const getInsights = () => {
    if (!entries.length || !stats) return [];

    const insights = [];
    const latestEntry = entries[0];
    
    // Get source breakdown for latest entry
    const sources = getSourceBreakdown({
      bottledWater: latestEntry.bottledWater || 0,
      seafood: latestEntry.seafood || 0,
      salt: latestEntry.salt || 0,
      plasticPackaged: latestEntry.plasticPackaged || 0,
      teaBags: latestEntry.teaBags || 0,
      householdDust: latestEntry.householdDust || 0,
      syntheticClothing: latestEntry.syntheticClothing || 0,
      cannedFood: latestEntry.cannedFood || 0,
      plasticKitchenware: latestEntry.plasticKitchenware || 0,
    });

    const topSource = sources[0];
    
    // Biggest contributor insight
    if (topSource && topSource.particles > 0.5) {
      const reductionPotential = (topSource.particles * 0.5).toFixed(1);
      insights.push({
        type: "warning",
        title: `Reduce ${topSource.label}`,
        description: `Your biggest contributor. Reducing by 50% could lower intake by ${reductionPotential} p/mL.`,
        bgColor: "bg-blue-50",
        borderColor: "border-blue-500",
        textColor: "text-blue-800",
        descColor: "text-blue-700",
      });
    }

    // Weekly change insight
    if (stats.weeklyChange < -10) {
      insights.push({
        type: "success",
        title: "Good Progress",
        description: `You've reduced intake by ${Math.abs(stats.weeklyChange).toFixed(1)}% this week.`,
        bgColor: "bg-green-50",
        borderColor: "border-green-500", 
        textColor: "text-green-800",
        descColor: "text-green-700",
      });
    }

    // High seafood warning
    if ((latestEntry.seafood || 0) > 4) {
      insights.push({
        type: "caution",
        title: "Watch Seafood Intake",
        description: "Consider varying seafood types and choosing smaller fish species.",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-500",
        textColor: "text-orange-800", 
        descColor: "text-orange-700",
      });
    }

    // High risk level warning
    if (stats.currentRiskLevel === "High") {
      insights.push({
        type: "danger",
        title: "High Risk Level Detected",
        description: "Consider immediate changes to reduce microplastic exposure.",
        bgColor: "bg-red-50",
        borderColor: "border-red-500",
        textColor: "text-red-800",
        descColor: "text-red-700",
      });
    }

    return insights.slice(0, 3); // Show max 3 insights
  };

  const getGoals = () => {
    if (!stats) return [];

    const goals = [];
    
    // Risk level reduction goal
    if (stats.currentParticleCount > RISK_LEVELS.LOW.max) {
      // const targetReduction = stats.currentParticleCount - RISK_LEVELS.LOW.max;
      const currentProgress = Math.max(0, (RISK_LEVELS.NORMAL.max - stats.currentParticleCount) / (RISK_LEVELS.NORMAL.max - RISK_LEVELS.LOW.max) * 100);
      
      goals.push({
        title: "Reduce to Low Risk",
        target: `< ${RISK_LEVELS.LOW.max} p/mL`,
        progress: Math.min(100, Math.max(0, currentProgress)),
        description: `${Math.min(100, Math.max(0, currentProgress)).toFixed(0)}% progress • Need to reduce by ${(stats.currentParticleCount - RISK_LEVELS.LOW.max).toFixed(1)} p/mL`,
        color: "bg-primary",
      });
    }

    // Data completeness goal
    goals.push({
      title: "Complete Weekly Tracking",
      target: "Target: 100%",
      progress: stats.dataCompleteness,
      description: `${stats.dataCompleteness}% completion this month`,
      color: "bg-secondary",
    });

    // Bottled water reduction goal (if applicable)
    if (entries.length > 0 && (entries[0].bottledWater || 0) > 2) {
      const currentBottled = entries[0].bottledWater || 0;
      // const targetReduction = 50; // 50% reduction target
      const achieved = Math.min(100, ((10 - currentBottled) / 10) * 100); // Assuming 10 was starting point
      
      goals.push({
        title: "Bottled Water Reduction", 
        target: "Target: -50%",
        progress: Math.max(0, achieved),
        description: `${Math.max(0, achieved).toFixed(0)}% reduction achieved`,
        color: "bg-warning",
      });
    }

    return goals;
  };

  const insights = getInsights();
  const goals = getGoals();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Insights & Recommendations */}
      <Card data-testid="card-insights">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Lightbulb className="text-yellow-500 mr-2 h-5 w-5" />
            Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {insights.length > 0 ? insights.map((insight, index) => (
              <div
                key={index}
                className={`p-3 ${insight.bgColor} border-l-4 ${insight.borderColor} rounded`}
              >
                <p className={`text-sm font-medium ${insight.textColor}`}>
                  {insight.title}
                </p>
                <p className={`text-xs ${insight.descColor} mt-1`}>
                  {insight.description}
                </p>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                Add more weekly data to see personalized insights and recommendations.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Goals */}
      <Card data-testid="card-goals">
        <CardHeader>
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Target className="text-primary mr-2 h-5 w-5" />
            Monthly Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.length > 0 ? goals.map((goal, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{goal.title}</span>
                  <span className="text-sm text-gray-500">{goal.target}</span>
                </div>
                <Progress value={goal.progress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{goal.description}</p>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                Goals will appear once you start tracking your weekly intake.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
