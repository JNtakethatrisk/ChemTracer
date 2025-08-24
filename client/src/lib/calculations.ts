import { RISK_LEVELS } from "@shared/schema";

export const MICROPLASTIC_SOURCES = [
  {
    key: "bottledWater",
    label: "Bottled Water",
    unit: "bottles/week",
    icon: "fas fa-bottle-water",
    color: "text-blue-500",
    description: "High microplastic content",
    conversionFactor: 0.12,
  },
  {
    key: "seafood", 
    label: "Seafood",
    unit: "servings/week",
    icon: "fas fa-fish",
    color: "text-blue-600",
    description: "Especially shellfish",
    conversionFactor: 0.08,
  },
  {
    key: "salt",
    label: "Salt Usage", 
    unit: "tsp/week",
    icon: "fas fa-cube",
    color: "text-gray-600",
    description: "Sea salt & table salt",
    conversionFactor: 0.02,
  },
  {
    key: "plasticPackaged",
    label: "Plastic-packaged Foods",
    unit: "meals/week", 
    icon: "fas fa-box",
    color: "text-orange-500",
    description: "Heat increases leaching",
    conversionFactor: 0.06,
  },
  {
    key: "teaBags",
    label: "Tea Bags/Keurig Capsules",
    unit: "cups/week",
    icon: "fas fa-mug-hot", 
    color: "text-green-600",
    description: "Plastic-sealed bags and capsules",
    conversionFactor: 0.15,
  },
  {
    key: "householdDust",
    label: "Household Dust Exposure",
    unit: "hours indoors/day",
    icon: "fas fa-home",
    color: "text-gray-500", 
    description: "Microfibers from synthetic materials",
    conversionFactor: 0.001,
  },
  {
    key: "syntheticClothing",
    label: "Synthetic Clothing",
    unit: "wears/week",
    icon: "fas fa-tshirt",
    color: "text-purple-500",
    description: "Polyester, nylon, acrylic fibers",
    conversionFactor: 0.03,
  },
  {
    key: "cannedFood",
    label: "Canned Foods", 
    unit: "cans/week",
    icon: "fas fa-can-food",
    color: "text-red-500",
    description: "Plastic resin linings",
    conversionFactor: 0.04,
  },
  {
    key: "cosmetics",
    label: "Cosmetics Usage",
    unit: "applications/week",
    icon: "fas fa-palette",
    color: "text-pink-500",
    description: "Exfoliating scrubs, makeup",
    conversionFactor: 0.01,
  },
  {
    key: "plasticKitchenware", 
    label: "Plastic Kitchenware",
    unit: "uses/week",
    icon: "fas fa-utensils",
    color: "text-gray-700",
    description: "Cutting boards, containers",
    conversionFactor: 0.05,
  },
] as const;

export function calculateTotalParticles(data: Record<string, number>): number {
  let total = 0;
  
  MICROPLASTIC_SOURCES.forEach(source => {
    const value = data[source.key] || 0;
    total += value * source.conversionFactor;
  });
  
  return Math.round(total * 100) / 100;
}

export function getRiskLevel(totalParticles: number): keyof typeof RISK_LEVELS {
  if (totalParticles < RISK_LEVELS.LOW.max) return "LOW";
  if (totalParticles < RISK_LEVELS.MEDIUM.max) return "MEDIUM"; 
  return "HIGH";
}

export function getRiskLevelInfo(level: string) {
  switch (level) {
    case "Low":
      return RISK_LEVELS.LOW;
    case "Medium":
      return RISK_LEVELS.MEDIUM;
    case "High":
      return RISK_LEVELS.HIGH;
    default:
      return RISK_LEVELS.LOW;
  }
}

export function getSourceBreakdown(data: Record<string, number>) {
  return MICROPLASTIC_SOURCES.map(source => ({
    ...source,
    value: data[source.key] || 0,
    particles: (data[source.key] || 0) * source.conversionFactor,
  })).sort((a, b) => b.particles - a.particles);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day; 
  return formatDate(new Date(d.setDate(diff)));
}

export function getWeekLabel(weekStart: string): string {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export function getSubmissionDateLabel(createdAt: string): string {
  const date = new Date(createdAt);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// Time bucketing and aggregation functions for chart granularities
export type ChartGranularity = 'Week' | 'Month' | 'Year';

export interface TimeBucket {
  key: string;
  label: string;
  startDate: Date;
  endDate: Date;
  samples: { timestamp: Date; intakePml: number }[];
  mean: number | null;
}

// Get time buckets for different granularities
export function getTimeBuckets(granularity: ChartGranularity): TimeBucket[] {
  const now = new Date();
  const buckets: TimeBucket[] = [];

  switch (granularity) {
    case 'Week': {
      // Last 7 days, daily resolution
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const endDate = new Date(date);
        endDate.setDate(date.getDate() + 1);
        endDate.setMilliseconds(-1);
        
        buckets.push({
          key: `day-${date.getTime()}`,
          label: date.toLocaleDateString('en-US', { 
            weekday: 'short',
            month: 'numeric',
            day: 'numeric'
          }),
          startDate: date,
          endDate: endDate,
          samples: [],
          mean: null
        });
      }
      break;
    }
    
    case 'Month': {
      // Last 4 weeks, weekly resolution
      for (let i = 3; i >= 0; i--) {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (i * 7) - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        buckets.push({
          key: `week-${startOfWeek.getTime()}`,
          label: `Week of ${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          startDate: startOfWeek,
          endDate: endOfWeek,
          samples: [],
          mean: null
        });
      }
      break;
    }
    
    case 'Year': {
      // Last 12 months, monthly resolution
      for (let i = 11; i >= 0; i--) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        
        buckets.push({
          key: `month-${startOfMonth.getTime()}`,
          label: startOfMonth.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
          }),
          startDate: startOfMonth,
          endDate: endOfMonth,
          samples: [],
          mean: null
        });
      }
      break;
    }
  }

  return buckets;
}

// Aggregate samples into time buckets
export function aggregateDataIntoBuckets(entries: any[], granularity: ChartGranularity) {
  const buckets = getTimeBuckets(granularity);
  
  // Convert entries to samples
  const samples = entries.map(entry => ({
    timestamp: new Date(entry.createdAt),
    intakePml: entry.totalParticles
  }));

  // Distribute samples into buckets
  samples.forEach(sample => {
    const bucket = buckets.find(b => 
      sample.timestamp >= b.startDate && sample.timestamp <= b.endDate
    );
    if (bucket) {
      bucket.samples.push(sample);
    }
  });

  // Calculate means for buckets with samples
  buckets.forEach(bucket => {
    if (bucket.samples.length > 0) {
      bucket.mean = bucket.samples.reduce((sum, sample) => sum + sample.intakePml, 0) / bucket.samples.length;
    }
  });

  // Return only buckets with data (no fake zeros)
  return buckets
    .filter(bucket => bucket.mean !== null)
    .map(bucket => ({
      key: bucket.key,
      label: bucket.label,
      particles: bucket.mean!,
      sampleCount: bucket.samples.length
    }));
}

// Calculate Y-axis domain with headroom
export function calculateYAxisDomain(data: number[], thresholds: number[]): [number, number] {
  if (data.length === 0) {
    const maxThreshold = Math.max(...thresholds);
    return [0, maxThreshold * 1.15];
  }
  
  const maxData = Math.max(...data);
  const maxThreshold = Math.max(...thresholds);
  const maxValue = Math.max(maxData, maxThreshold);
  
  // Add 15% headroom above the max value
  return [0, maxValue * 1.15];
}
