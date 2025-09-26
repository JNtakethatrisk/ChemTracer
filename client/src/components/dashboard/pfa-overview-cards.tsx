import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface PfaDashboardStats {
  currentRiskLevel: string;
  currentPfaCount: number;
  weeklyIntake: number;
  monthlyAverage: number;
  dataCompleteness: number;
  weeklyChange: number;
  totalEntries: number;
}

interface PfaOverviewCardsProps {
  stats: PfaDashboardStats;
}

const riskLevelColors = {
  "Low": "bg-green-100 text-green-800 border-green-200",
  "Normal": "bg-green-200 text-green-900 border-green-300",
  "High": "bg-orange-100 text-orange-800 border-orange-200",
  "Extreme": "bg-red-100 text-red-800 border-red-200",
  "No Data": "bg-gray-100 text-gray-800 border-gray-200",
};

export function PfaOverviewCards({ stats }: PfaOverviewCardsProps) {
  const formatPfaValue = (value: number): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0.000";
    }
    if (value >= 1) {
      return value.toFixed(1);
    } else if (value >= 0.1) {
      return value.toFixed(2);
    } else {
      return value.toFixed(3);
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-red-600";
    if (change < 0) return "text-green-600";
    return "text-gray-600";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Current Risk Level */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Current Risk Level</CardTitle>
          <Activity className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`${riskLevelColors[stats.currentRiskLevel as keyof typeof riskLevelColors] || riskLevelColors["No Data"]}`}
            >
              {stats.currentRiskLevel}
            </Badge>
          </div>
          <p className="text-xs text-green-600 mt-1">
            {stats.currentPfaCount > 0 ? `${formatPfaValue(stats.currentPfaCount)} ppt` : "No data"}
          </p>
        </CardContent>
      </Card>

      {/* Weekly Intake */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Weekly Intake</CardTitle>
          <div className="flex items-center space-x-1">
            {getTrendIcon(stats.weeklyChange)}
            <span className={`text-xs font-medium ${getTrendColor(stats.weeklyChange || 0)}`}>
              {Math.abs(stats.weeklyChange || 0).toFixed(1)}%
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatPfaValue(stats.weeklyIntake)} ppt
          </div>
          <p className="text-xs text-green-600">
            This week's PFA exposure
          </p>
          <p className="text-xs text-green-500 mt-1">
            Based on {stats.totalEntries || 0} {stats.totalEntries === 1 ? 'entry' : 'entries'}
          </p>
        </CardContent>
      </Card>

      {/* Monthly Average */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Monthly Average</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {formatPfaValue(stats.monthlyAverage)} ppt
          </div>
          <p className="text-xs text-green-600">
            Last 4 weeks average
          </p>
        </CardContent>
      </Card>

      {/* Data Completeness */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Data Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {stats.dataCompleteness}%
          </div>
          <p className="text-xs text-green-600">
            {stats.dataCompleteness < 100 ? "Keep tracking!" : "Complete dataset"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default PfaOverviewCards;
