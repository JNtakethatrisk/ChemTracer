import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MicroplasticEntry, RISK_LEVELS } from "@shared/schema";
import { 
  aggregateDataIntoBuckets,
  calculateYAxisDomain,
  calculateRegressionLine,
  type ChartGranularity
} from "@/lib/calculations";
import { getSourceBreakdown } from "@/lib/microplastic-sources";

export default function ChartsSection() {
  const [granularity, setGranularity] = useState<ChartGranularity>('Month');
  const { data: entries = [], isLoading } = useQuery<MicroplasticEntry[]>({
    queryKey: ["/api/microplastic-entries"],
  });
  
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard-stats"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Aggregate data into time buckets
  const chartData = aggregateDataIntoBuckets(entries, granularity);

  // Calculate regression line for trend analysis
  const regressionData = calculateRegressionLine(chartData);
  console.log('Chart data for regression:', chartData);
  console.log('Regression data:', regressionData);
  const chartDataWithRegression = chartData.map((item, index) => ({
    ...item,
    regression: regressionData[index]?.y || null
  }));

  // Calculate Y-axis domain with proper scaling
  const thresholds = [RISK_LEVELS.LOW.max, RISK_LEVELS.NORMAL.max];
  const yAxisDomain = calculateYAxisDomain(
    chartData.map(d => d.particles),
    thresholds
  );

  // Check for risk levels and show appropriate alerts
  const currentRiskLevel = dashboardStats?.currentRiskLevel;
  const showHighRiskWarning = currentRiskLevel === 'High' || currentRiskLevel === 'Extreme';
  const showSafeLevelNotification = currentRiskLevel === 'Low';

  // Get latest entry for source breakdown
  const latestEntry = entries[0];
  const topSources = latestEntry ? getSourceBreakdown({
    bottledWater: latestEntry.bottledWater || 0,
    seafood: latestEntry.seafood || 0,
    salt: latestEntry.salt || 0,
    plasticPackaged: latestEntry.plasticPackaged || 0,
    teaBags: latestEntry.teaBags || 0,
    householdDust: latestEntry.householdDust || 0,
    syntheticClothing: latestEntry.syntheticClothing || 0,
    cannedFood: latestEntry.cannedFood || 0,
    plasticKitchenware: latestEntry.plasticKitchenware || 0,
  }).slice(0, 3) : [];

  const totalParticles = topSources.reduce((sum, source) => sum + source.particles, 0);

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      const sampleCount = data.sampleCount || 1;
      
      // Format value for display, handling both small and large numbers
      let displayValue = '0.00';
      if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
        if (value >= 1000) {
          displayValue = `${(value / 1000).toFixed(1)}k`;
        } else if (value >= 10) {
          displayValue = value.toFixed(1);
        } else {
          displayValue = value.toFixed(2);
        }
      }
      
      return (
        <div className="bg-white p-3 border border-blue-200 rounded-lg shadow-lg">
          <p className="font-medium text-blue-800">{label}</p>
          <p className="text-blue-600">
            Microplastic Level: <span className="font-semibold">{displayValue} p/mL</span>
          </p>
          <p className="text-blue-500 text-sm">
            {sampleCount} {sampleCount === 1 ? 'entry' : 'entries'} recorded
          </p>
        </div>
      );
    }
    return null;
  };

  const getChartDescription = () => {
    switch (granularity) {
      case 'Week':
        return "Daily microplastic intake over the last 7 days";
      case 'Month':
        return "Weekly microplastic intake over the last 4 weeks";
      case 'Year':
        return "Monthly averages over last 12 months";
      default:
        return "Microplastic intake trend";
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">Microplastic Intake Trend</h3>
          <p className="text-sm text-blue-600">{getChartDescription()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={granularity} onValueChange={(value: 'Week' | 'Month' | 'Year') => setGranularity(value)}>
            <SelectTrigger className="w-32 border-blue-300 focus:border-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Week">Daily</SelectItem>
              <SelectItem value="Month">Weekly</SelectItem>
              <SelectItem value="Year">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning Alert */}
      {showHighRiskWarning && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Microplastic Exposure Detected!</strong> Your current risk level is <Badge variant="outline" className="ml-1 bg-red-100 text-red-800 border-red-300">{currentRiskLevel}</Badge>. 
            Consider reducing exposure to microplastic-containing products.
          </AlertDescription>
        </Alert>
      )}

      {/* Safe Level Notification */}
      {showSafeLevelNotification && (
        <Alert className="border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Great job!</strong> Your current risk level is <Badge variant="outline" className="ml-1 bg-green-100 text-green-800 border-green-300">{currentRiskLevel}</Badge>. 
            You're maintaining low microplastic exposure levels.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Chart */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-monthly-trend">
        <CardHeader>
          <CardTitle className="text-blue-800">Microplastic Intake Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full min-w-[300px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataWithRegression}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                  <XAxis 
                    dataKey="label" 
                    stroke="#1e40af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={yAxisDomain}
                    stroke="#1e40af"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000) {
                        return `${(value / 1000).toFixed(1)}k`;
                      } else if (value >= 10) {
                        return value.toFixed(0);
                      } else {
                        return value.toFixed(1);
                      }
                    }}
                  />
                  <Tooltip content={customTooltip} />
                  <Line
                    type="monotone"
                    dataKey="particles"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#2563eb", strokeWidth: 2 }}
                  />
                  {/* Regression Line */}
                  <Line
                    type="monotone"
                    dataKey="regression"
                    stroke="#dc2626"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-blue-500">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No data available</p>
                  <p className="text-sm">Add weekly consumption data to see trends over time</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Risk Level Thresholds */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-risk-levels">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Microplastic Risk Level Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="text-center">
              <Badge 
                variant="outline" 
                className="w-full justify-center bg-green-100 text-green-800 border-green-300"
              >
                Low Risk
              </Badge>
              <p className="text-xs text-blue-600 mt-1">
                0 - {RISK_LEVELS.LOW.max} p/mL
              </p>
              <p className="text-xs text-blue-500 mt-1">Below typical levels</p>
            </div>
            <div className="text-center">
              <Badge 
                variant="outline" 
                className="w-full justify-center bg-blue-200 text-blue-900 border-blue-400"
              >
                Normal Risk
              </Badge>
              <p className="text-xs text-blue-600 mt-1">
                {RISK_LEVELS.LOW.max} - {RISK_LEVELS.NORMAL.max} p/mL
              </p>
              <p className="text-xs text-blue-500 mt-1">Within typical range</p>
            </div>
            <div className="text-center">
              <Badge 
                variant="outline" 
                className="w-full justify-center bg-red-100 text-red-800 border-red-300"
              >
                High Risk
              </Badge>
              <p className="text-xs text-blue-600 mt-1">
                &gt; {RISK_LEVELS.NORMAL.max} p/mL
              </p>
              <p className="text-xs text-blue-500 mt-1">Above recommended levels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card className="border-blue-200 bg-blue-50" data-testid="card-source-breakdown">
        <CardHeader>
          <CardTitle className="text-blue-800">Top Contributing Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSources.length > 0 ? topSources.map((source, index) => (
              <div key={source.key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <i className={`${source.icon} ${source.color} mr-3`}></i>
                  <span className="font-medium text-blue-900">{source.label}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-blue-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${totalParticles > 0 ? (source.particles / totalParticles) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-blue-700">
                    {source.particles.toFixed(1)} p/mL
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center text-blue-500 py-8">
                No data available. Add weekly consumption data to see source breakdown.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}