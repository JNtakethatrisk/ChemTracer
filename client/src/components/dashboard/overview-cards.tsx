import { useQuery } from "@tanstack/react-query";
import { Calendar, TrendingUp, CheckCircle, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRiskLevelInfo } from "@/lib/calculations";

interface DashboardStats {
  currentRiskLevel: string;
  currentParticleCount: number;
  weeklyIntake: number;
  monthlyAverage: number;
  dataCompleteness: number;
  weeklyChange: number;
}

export default function OverviewCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="h-4 bg-blue-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-blue-200 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-blue-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <p className="text-blue-600">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const riskInfo = getRiskLevelInfo(stats.currentRiskLevel);
  const riskColor = riskInfo.color === "green" ? "text-green-600" : 
                   riskInfo.color === "blue" ? "text-blue-600" :
                   riskInfo.color === "red" ? "text-red-600" : "text-purple-600";
  const riskBgColor = riskInfo.color === "green" ? "bg-green-500" : 
                     riskInfo.color === "blue" ? "bg-blue-500" :
                     riskInfo.color === "red" ? "bg-red-500" : "bg-purple-500";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8 w-full">
      {/* Current Risk Level */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-current-risk">
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className={`w-3 h-3 ${riskBgColor} rounded-full mr-3`}></div>
            <h3 className="text-sm font-medium text-blue-800">Current Risk Level</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2" data-testid="text-risk-level">
            {stats.currentRiskLevel}
          </p>
          <p className="text-sm text-blue-600 mt-1" data-testid="text-particle-count">
            {stats.currentParticleCount.toFixed(1)} particles/mL
          </p>
        </CardContent>
      </Card>

      {/* This Week's Intake */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-weekly-intake">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Calendar className="text-blue-600 mr-3 h-4 w-4" />
            <h3 className="text-sm font-medium text-blue-800">This Week's Intake</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2" data-testid="text-weekly-intake">
            {stats.weeklyIntake.toFixed(1)} particles/mL
          </p>
          <p className={`text-sm mt-1 flex items-center ${stats.weeklyChange >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            <span className="text-xs mr-1">
              {stats.weeklyChange >= 0 ? '↑' : '↓'}
            </span>
            <span data-testid="text-weekly-change">
              {Math.abs(stats.weeklyChange).toFixed(1)}% from last week
            </span>
          </p>
        </CardContent>
      </Card>

      {/* Monthly Average */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-monthly-average">
        <CardContent className="p-6">
          <div className="flex items-center">
            <TrendingUp className="text-blue-600 mr-3 h-4 w-4" />
            <h3 className="text-sm font-medium text-blue-800">Monthly Average</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2" data-testid="text-monthly-average">
            {stats.monthlyAverage.toFixed(1)} particles/mL
          </p>
          <p className="text-sm text-blue-600 mt-1">Based on recent weeks</p>
        </CardContent>
      </Card>

      {/* Data Completeness */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-data-completeness">
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="text-blue-600 mr-3 h-4 w-4" />
            <h3 className="text-sm font-medium text-blue-800">Data Completeness</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-2" data-testid="text-data-completeness">
            {stats.dataCompleteness}%
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2 mt-3">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${stats.dataCompleteness}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
