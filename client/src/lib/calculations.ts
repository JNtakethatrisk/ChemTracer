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
