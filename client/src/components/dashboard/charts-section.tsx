import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { MicroplasticEntry, RISK_LEVELS } from "@shared/schema";
import { 
  getSourceBreakdown, 
  aggregateDataIntoBuckets,
  calculateYAxisDomain,
  type ChartGranularity
} from "@/lib/calculations";

export default function ChartsSection() {
  const [granularity, setGranularity] = useState<ChartGranularity>('Month');
  const { data: entries = [], isLoading } = useQuery<MicroplasticEntry[]>({
    queryKey: ["/api/microplastic-entries"],
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

  // Calculate Y-axis domain with proper scaling
  const thresholds = [RISK_LEVELS.LOW.max, RISK_LEVELS.MEDIUM.max];
  const yAxisDomain = calculateYAxisDomain(
    chartData.map(d => d.particles),
    thresholds
  );

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
    cosmetics: latestEntry.cosmetics || 0,
    plasticKitchenware: latestEntry.plasticKitchenware || 0,
  }).slice(0, 3) : [];

  const totalParticles = topSources.reduce((sum, source) => sum + source.particles, 0);

  // Custom tooltip formatter
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      const sampleCount = data.sampleCount || 1;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-blue-600">{value.toFixed(1)} p/mL</span>
            {granularity === 'Month' || granularity === 'Year' ? ' (mean)' : ''}
          </p>
          {sampleCount > 1 && (
            <p className="text-xs text-gray-500">{sampleCount} samples</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Time-series Chart with Granularity Controls */}
      <Card data-testid="card-monthly-trend">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Microplastic Intake Trend
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {granularity === 'Week' && 'Daily averages over last 7 days'}
                {granularity === 'Month' && 'Weekly averages over last 4 weeks'}
                {granularity === 'Year' && 'Monthly averages over last 12 months'}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant={granularity === 'Week' ? 'default' : 'outline'} 
                size="sm" 
                className="px-3 py-1 text-xs"
                onClick={() => setGranularity('Week')}
                data-testid="button-granularity-week"
              >
                Week
              </Button>
              <Button 
                variant={granularity === 'Month' ? 'default' : 'outline'} 
                size="sm" 
                className="px-3 py-1 text-xs"
                onClick={() => setGranularity('Month')}
                data-testid="button-granularity-month"
              >
                Month
              </Button>
              <Button 
                variant={granularity === 'Year' ? 'default' : 'outline'} 
                size="sm" 
                className="px-3 py-1 text-xs"
                onClick={() => setGranularity('Year')}
                data-testid="button-granularity-year"
              >
                Year
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 80, left: 5, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="label" 
                    tick={{ fontSize: 12 }}
                    angle={granularity === 'Week' ? -45 : -30}
                    textAnchor="end"
                    height={60}
                    interval={granularity === 'Year' ? 1 : granularity === 'Month' ? 0 : 0}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={yAxisDomain}
                    label={{ 
                      value: 'Microplastic Intake (p/mL)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: '12px', fill: '#6B7280' }
                    }}
                  />
                  <Tooltip 
                    content={customTooltip}
                    cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                  />
                  
                  {/* Threshold Reference Lines with Labels */}
                  <ReferenceLine 
                    y={RISK_LEVELS.LOW.max} 
                    stroke="#22C55E" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  <ReferenceLine 
                    y={RISK_LEVELS.MEDIUM.max} 
                    stroke="#F97316" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                  
                  {/* Data Line */}
                  <Line 
                    type="monotone" 
                    dataKey="particles" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: "hsl(var(--primary))", stroke: '#fff', strokeWidth: 2 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">No data available</p>
                  <p className="text-sm">Add weekly consumption data to see trends over time</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Threshold Legend */}
          {chartData.length > 0 && (
            <div className="flex justify-end space-x-4 mt-4 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-green-500 mr-2" style={{ borderTop: '2px dashed #22C55E' }}></div>
                <span className="text-gray-600">Low Risk (&lt;{RISK_LEVELS.LOW.max} p/mL)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-0.5 bg-orange-500 mr-2" style={{ borderTop: '2px dashed #F97316' }}></div>
                <span className="text-gray-600">Med Risk (&lt;{RISK_LEVELS.MEDIUM.max} p/mL)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Level Distribution */}
      <Card data-testid="card-risk-levels">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Risk Level Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Low Risk</p>
              <p className="text-lg font-bold text-green-600">&lt; {RISK_LEVELS.LOW.max}</p>
              <p className="text-xs text-gray-500">particles/mL</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Medium Risk</p>
              <p className="text-lg font-bold text-orange-600">{RISK_LEVELS.LOW.max} - {RISK_LEVELS.MEDIUM.max}</p>
              <p className="text-xs text-gray-500">particles/mL</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-700">High Risk</p>
              <p className="text-lg font-bold text-red-600">&gt; {RISK_LEVELS.MEDIUM.max}</p>
              <p className="text-xs text-gray-500">particles/mL</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Breakdown */}
      <Card data-testid="card-source-breakdown">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Top Contributing Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topSources.length > 0 ? topSources.map((source, index) => (
              <div key={source.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <i className={`${source.icon} ${source.color} mr-3`}></i>
                  <span className="font-medium text-gray-900">{source.label}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${totalParticles > 0 ? (source.particles / totalParticles) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {source.particles.toFixed(1)} p/mL
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-8">
                No data available. Add weekly consumption data to see source breakdown.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}