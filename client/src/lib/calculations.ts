import { RISK_LEVELS } from "@shared/schema";

// MICROPLASTIC_SOURCES moved to microplastic-sources.ts

// calculateTotalParticles moved to microplastic-sources.ts

export function getRiskLevel(totalParticles: number): keyof typeof RISK_LEVELS {
  if (totalParticles < RISK_LEVELS.LOW.max) return "LOW";
  if (totalParticles < RISK_LEVELS.NORMAL.max) return "NORMAL";
  if (totalParticles < RISK_LEVELS.HIGH.max) return "HIGH";
  return "EXTREME";
}

export function getRiskLevelInfo(level: string) {
  switch (level) {
    case "LOW":
      return RISK_LEVELS.LOW;
    case "NORMAL":
      return RISK_LEVELS.NORMAL;
    case "HIGH":
      return RISK_LEVELS.HIGH;
    case "EXTREME":
      return RISK_LEVELS.EXTREME;
    default:
      return RISK_LEVELS.LOW;
  }
}


export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  // Calculate days to subtract to get to Monday (start of week)
  // Sunday = 0, Monday = 1, Tuesday = 2, etc.
  // We want Monday to be the start of the week
  const daysToSubtract = day === 0 ? 6 : day - 1; // Sunday goes back 6 days to Monday
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToSubtract);
  return formatDate(weekStart);
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
            month: 'short',
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
        // Calculate the start of the week (Monday) for each of the last 4 weeks
        const daysToSubtract = startOfWeek.getDay() === 0 ? 6 : startOfWeek.getDay() - 1; // Get to Monday
        startOfWeek.setDate(startOfWeek.getDate() - daysToSubtract - (i * 7));
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        buckets.push({
          key: `week-${startOfWeek.getTime()}`,
          label: `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
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
            year: '2-digit' 
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
  
  // Convert entries to samples - use weekStart for proper time bucketing
  const samples = entries.map(entry => {
    const particles = entry.totalParticles;
    
    // Only filter out truly invalid values, preserve extreme but valid data
    const validatedParticles = typeof particles === 'number' && 
      !isNaN(particles) && 
      isFinite(particles) && 
      particles >= 0 ? 
      particles : // Keep the actual value, even if extreme
      0;
    
    return {
      timestamp: new Date(entry.weekStart),
      intakePml: validatedParticles
    };
  });

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

// Calculate Y-axis domain that shows accurate data while being readable
export function calculateYAxisDomain(data: number[], thresholds: number[]): [number, number] {
  // Filter out only truly invalid values (NaN, Infinity, negative)
  const validData = data.filter(value => 
    typeof value === 'number' && 
    !isNaN(value) && 
    isFinite(value) && 
    value >= 0
  );
  
  if (validData.length === 0) {
    const maxThreshold = Math.max(...thresholds);
    return [0, Math.max(maxThreshold * 1.15, 5)]; // Minimum range of 5
  }
  
  const maxData = Math.max(...validData);
  const maxThreshold = Math.max(...thresholds);
  const actualMax = Math.max(maxData, maxThreshold);
  
  // Add 15% headroom above the actual maximum
  // This shows the true data while providing some visual breathing room
  const upperBound = actualMax * 1.15;
  
  // For very small values, ensure minimum scale for readability
  if (actualMax < 1) {
    return [0, Math.max(upperBound, 2)];
  }
  
  return [0, upperBound];
}

// Calculate linear regression line for trend analysis
export function calculateRegressionLine(data: { particles: number; label: string }[]): { x: number; y: number }[] {
  if (data.length === 0) return [];
  
  // If only one data point, create a horizontal line
  if (data.length === 1) {
    return [
      { x: 0, y: data[0].particles },
      { x: 1, y: data[0].particles }
    ];
  }
  
  // Convert data to numeric points (x = index, y = particles)
  const points = data.map((item, index) => ({ x: index, y: item.particles }));
  
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
  
  // Calculate slope (m) and intercept (b) for y = mx + b
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate regression line points
  return points.map(point => ({
    x: point.x,
    y: slope * point.x + intercept
  }));
}
