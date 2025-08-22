import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { MicroplasticEntry, RISK_LEVELS } from "@shared/schema";
import { getSourceBreakdown, getWeekLabel } from "@/lib/calculations";

export default function ChartsSection() {
  const [timePeriod, setTimePeriod] = useState<'3M' | '6M' | '1Y'>('3M');
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

  const getDataLimit = () => {
    switch (timePeriod) {
      case '3M': return 12;
      case '6M': return 24;
      case '1Y': return 52;
      default: return 12;
    }
  };

  const chartData = entries.slice(0, getDataLimit()).reverse().map(entry => ({
    week: getWeekLabel(entry.weekStart),
    particles: entry.totalParticles,
    riskLevel: entry.riskLevel,
  }));

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

  return (
    <div className="space-y-6">
      {/* Monthly Trend Chart */}
      <Card data-testid="card-monthly-trend">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Monthly Trend</CardTitle>
            <div className="flex space-x-2">
              <Button 
                variant={timePeriod === '3M' ? 'default' : 'outline'} 
                size="sm" 
                className="px-3 py-1 text-xs"
                onClick={() => setTimePeriod('3M')}
              >
                3M
              </Button>
              <Button 
                variant={timePeriod === '6M' ? 'default' : 'outline'} 
                size="sm" 
                className="px-3 py-1 text-xs"
                onClick={() => setTimePeriod('6M')}
              >
                6M
              </Button>
              <Button 
                variant={timePeriod === '1Y' ? 'default' : 'outline'} 
                size="sm" 
                className="px-3 py-1 text-xs"
                onClick={() => setTimePeriod('1Y')}
              >
                1Y
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={[0, 4]}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(1)} p/mL`, "Microplastic Intake"]}
                    labelStyle={{ color: '#374151' }}
                  />
                  <ReferenceLine y={RISK_LEVELS.LOW.max} stroke="#388E3C" strokeDasharray="5 5" />
                  <ReferenceLine y={RISK_LEVELS.MEDIUM.max} stroke="#F57C00" strokeDasharray="5 5" />
                  <Line 
                    type="monotone" 
                    dataKey="particles" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
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
              <p className="text-lg font-bold text-green-600">&lt; 1.5</p>
              <p className="text-xs text-gray-500">particles/mL</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="w-4 h-4 bg-orange-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-700">Medium Risk</p>
              <p className="text-lg font-bold text-orange-600">1.5 - 3.0</p>
              <p className="text-xs text-gray-500">particles/mL</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium text-gray-700">High Risk</p>
              <p className="text-lg font-bold text-red-600">&gt; 3.0</p>
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
