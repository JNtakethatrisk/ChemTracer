// import { PFA_RISK_LEVELS } from "../../../shared/schema";
// import { getPfaRiskLevel, getPfaRiskLevelInfo } from "./pfa-sources";

export function getPfaWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const daysToSubtract = day === 0 ? 6 : day - 1; // Sunday goes back 6 days to Monday
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - daysToSubtract);
  return formatPfaDate(weekStart);
}

export function getPfaWeekLabel(dateString: string): string {
  const date = new Date(dateString);
  const weekStart = new Date(date);
  const day = weekStart.getDay();
  const daysToSubtract = day === 0 ? 6 : day - 1;
  weekStart.setDate(weekStart.getDate() - daysToSubtract);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

export function formatPfaDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getPfaTimeBuckets(granularity: 'Day' | 'Week' | 'Month'): { label: string; startDate: string; endDate: string }[] {
  const now = new Date();
  const buckets: { label: string; startDate: string; endDate: string }[] = [];

  if (granularity === 'Day') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      buckets.push({
        label: `${dayName} ${monthDay}`,
        startDate: formatPfaDate(date),
        endDate: formatPfaDate(date)
      });
    }
  } else if (granularity === 'Week') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
      const startDay = weekStart.getDate();
      const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
      const endDay = weekEnd.getDate();
      
      let label;
      if (startMonth === endMonth) {
        label = `${startMonth} ${startDay}-${endDay}`;
      } else {
        label = `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
      }
      
      buckets.push({
        label,
        startDate: formatPfaDate(weekStart),
        endDate: formatPfaDate(weekEnd)
      });
    }
  } else if (granularity === 'Month') {
    // Last 4 weeks (weekly averages)
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - (weekStart.getDay() === 0 ? 6 : weekStart.getDay() - 1));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
      const startDay = weekStart.getDate();
      const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
      const endDay = weekEnd.getDate();
      
      let label;
      if (startMonth === endMonth) {
        label = `Mon ${startDay} - Sun ${endDay}`;
      } else {
        label = `Mon ${startDay} - Sun ${endDay}`;
      }
      
      buckets.push({
        label,
        startDate: formatPfaDate(weekStart),
        endDate: formatPfaDate(weekEnd)
      });
    }
  }

  return buckets;
}

export function aggregatePfaDataIntoBuckets(
  entries: any[],
  granularity: 'Day' | 'Week' | 'Month'
): { particles: number; label: string; sampleCount: number }[] {
  const buckets = getPfaTimeBuckets(granularity);
  
  return buckets.map(bucket => {
    const relevantEntries = entries.filter(entry => {
      const entryDate = new Date(entry.weekStart);
      const bucketStart = new Date(bucket.startDate);
      const bucketEnd = new Date(bucket.endDate);
      return entryDate >= bucketStart && entryDate <= bucketEnd;
    });

    if (relevantEntries.length === 0) {
      return { particles: 0, label: bucket.label, sampleCount: 0 };
    }

    const totalPfas = relevantEntries.reduce((sum, entry) => sum + (entry.totalPfas || 0), 0);
    const averagePfas = granularity === 'Month' ? totalPfas / relevantEntries.length : totalPfas;
    
    return {
      particles: Math.round(averagePfas * 1000) / 1000,
      label: bucket.label,
      sampleCount: relevantEntries.length
    };
  });
}

export function calculatePfaYAxisDomain(data: { particles: number; label: string }[]): [number, number] {
  if (data.length === 0) return [0, 10];
  
  const validValues = data
    .map(d => d.particles)
    .filter(val => !isNaN(val) && isFinite(val) && val >= 0);
  
  if (validValues.length === 0) return [0, 10];
  
  const min = Math.min(...validValues);
  const max = Math.max(...validValues);
  
  if (min === max) {
    return [Math.max(0, min - 0.01), min + 0.01];
  }
  
  const range = max - min;
  const headroom = range * 0.1;
  
  return [
    Math.max(0, min - headroom),
    max + headroom
  ];
}

export function calculatePfaRegressionLine(data: { particles: number; label: string }[]): { x: number; y: number }[] {
  if (data.length === 0) return [];
  if (data.length === 1) {
    return [
      { x: 0, y: data[0].particles },
      { x: 1, y: data[0].particles }
    ];
  }

  const points = data.map((item, index) => ({ x: index, y: item.particles }));
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
  const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return points.map(point => ({
    x: point.x,
    y: slope * point.x + intercept
  }));
}

export function formatPfaValue(value: number): string {
  if (value >= 1) {
    return value.toFixed(1);
  } else if (value >= 0.1) {
    return value.toFixed(2);
  } else {
    return value.toFixed(3);
  }
}

export function formatPfaTooltipValue(value: number): string {
  return `${formatPfaValue(value)} ppt`;
}
