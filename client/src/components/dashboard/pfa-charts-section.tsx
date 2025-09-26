import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle, Info } from "lucide-react";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTrackerData } from "../../hooks/useTrackerData";
import { 
  aggregatePfaDataIntoBuckets,
  preparePfaChartData, 
  calculatePfaYAxisDomain, 
  formatPfaValue,
  formatPfaTooltipValue
} from "../../lib/pfa-calculations";
import { PFAS_RISK_LEVELS } from "../../../../shared/schema";
// import { getPfaSourceBreakdown } from "../../lib/pfa-sources";

interface PfaChartsSectionProps {
  entries: any[];
}

export function PfaChartsSection({ entries }: PfaChartsSectionProps) {
  const [granularity, setGranularity] = useState<'Day' | 'Week' | 'Month'>('Week');
  const [showIndividualEntries, setShowIndividualEntries] = useState(true);

  const { stats } = useTrackerData('pfa');

  const currentRiskLevel = stats?.currentRiskLevel || "No Data";
  const showWarning = currentRiskLevel === 'High' || currentRiskLevel === 'Extreme';

  // Memoize chart calculations to prevent unnecessary recalculations
  const chartData = useMemo(() => 
    showIndividualEntries 
      ? preparePfaChartData(entries, true)
      : aggregatePfaDataIntoBuckets(entries, granularity),
    [entries, granularity, showIndividualEntries]
  );
  
  const yAxisDomain = useMemo(() => 
    calculatePfaYAxisDomain(chartData),
    [chartData]
  );

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sampleCount = data.sampleCount || 1;
      
      return (
        <div className="bg-white p-3 border border-green-200 rounded-lg shadow-lg">
          <p className="font-medium text-green-800">{label}</p>
          <p className="text-green-600">
            PFAS Level: <span className="font-semibold">{formatPfaTooltipValue(payload[0].value || 0)}</span>
          </p>
          <p className="text-green-500 text-sm">
            {sampleCount} {sampleCount === 1 ? 'entry' : 'entries'} recorded
          </p>
        </div>
      );
    }
    return null;
  };

  const getChartDescription = () => {
    switch (granularity) {
      case 'Day':
        return "Daily PFAS exposure over the last 7 days";
      case 'Week':
        return "Weekly PFAS exposure over the last 4 weeks";
      case 'Month':
        return "Weekly averages over last 4 weeks";
      default:
        return "PFAS exposure trend";
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-green-800">PFAS Exposure Trend</h3>
          <p className="text-sm text-green-600">{getChartDescription()}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={granularity} onValueChange={(value: 'Day' | 'Week' | 'Month') => setGranularity(value)}>
            <SelectTrigger className="w-32 border-green-300 focus:border-green-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Day">Daily</SelectItem>
              <SelectItem value="Week">Weekly</SelectItem>
              <SelectItem value="Month">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Warning Alert */}
      {showWarning && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High PFAS Exposure Detected!</strong> Your current risk level is <Badge variant="outline" className="ml-1 bg-red-100 text-red-800 border-red-300">{currentRiskLevel}</Badge>. 
            Consider reducing exposure to PFAS-containing products.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Chart */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-green-800">PFAS Exposure Over Time</CardTitle>
          <div className="flex items-center space-x-2">
            <Label htmlFor="individual-entries" className="text-sm text-green-700">Show Individual Entries</Label>
            <Switch
              id="individual-entries"
              checked={showIndividualEntries}
              onCheckedChange={setShowIndividualEntries}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full min-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#bbf7d0" opacity={0.7} />
                <XAxis 
                  dataKey="label" 
                  stroke="#065f46"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  domain={yAxisDomain}
                  stroke="#065f46"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    if (value === null || value === undefined || isNaN(value)) {
                      return "0";
                    }
                    return formatPfaValue(value);
                  }}
                />
                <Tooltip content={customTooltip} />
                <Line
                  type="monotone"
                  dataKey="particles"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ fill: "#059669", strokeWidth: 1, r: 3 }}
                  activeDot={{ r: 5, stroke: "#047857", strokeWidth: 2 }}
                  animationDuration={300}
                  animationEasing="ease-in-out"
                  connectNulls={true}
                  label={({ x, y, value }: any) => (
                    <text x={x} y={y - 10} fill="#047857" fontSize={12} fontWeight="bold" textAnchor="middle">
                      {formatPfaValue(value)}
                    </text>
                  )}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level Thresholds */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <Info className="h-4 w-4" />
            PFAS Risk Level Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(PFAS_RISK_LEVELS).map((level) => (
              <div key={level.label} className="text-center">
                <Badge 
                  variant="outline" 
                  className={`w-full justify-center ${
                    level.label === 'Low' ? 'bg-green-100 text-green-800 border-green-300' :
                    level.label === 'Normal' ? 'bg-green-200 text-green-900 border-green-400' :
                    level.label === 'High' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                    'bg-red-100 text-red-800 border-red-300'
                  }`}
                >
                  {level.label}
                </Badge>
                <p className="text-xs text-green-600 mt-1">
                  {level.min === 0 ? '0' : level.min} - {level.max === Infinity ? '∞' : level.max} ppt
                </p>
                <p className="text-xs text-green-500 mt-1">{level.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PfaChartsSection;
