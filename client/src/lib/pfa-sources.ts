import { PFA_RISK_LEVELS } from "@shared/schema";

export interface PfaSource {
  key: string;
  label: string;
  description: string;
  category: string;
  unit: string;
  pfasPerUnit: number;
  icon: string;
  enabled: boolean;
}

export const PFA_SOURCES: PfaSource[] = [
  {
    key: 'dentalFloss',
    label: 'Dental Floss',
    description: 'PFAS-containing dental floss brands (Oral-B Glide, Colgate Total, etc.)',
    category: 'personal-care',
    unit: 'times per week',
    pfasPerUnit: 0.05,
    icon: '🦷',
    enabled: true
  },
  {
    key: 'toiletPaper',
    label: 'Toilet Paper',
    description: 'PFAS-containing toilet paper brands (Charmin, Seventh Generation, etc.)',
    category: 'household',
    unit: 'rolls per week',
    pfasPerUnit: 0.02,
    icon: '🧻',
    enabled: true
  },
  {
    key: 'yogaPants',
    label: 'Yoga Pants',
    description: 'PFAS-treated yoga pants and workout clothes',
    category: 'clothing',
    unit: 'wears per week',
    pfasPerUnit: 0.012,
    icon: '🧘‍♀️',
    enabled: true
  },
  {
    key: 'sportsBras',
    label: 'Sports Bras',
    description: 'PFAS-treated sports bras and athletic wear',
    category: 'clothing',
    unit: 'wears per week',
    pfasPerUnit: 0.012,
    icon: '🏃‍♀️',
    enabled: true
  },
  {
    key: 'tapWater',
    label: 'Tap Water',
    description: 'PFAS-contaminated tap water consumption',
    category: 'beverages',
    unit: 'glasses per week',
    pfasPerUnit: 0.001,
    icon: '💧',
    enabled: true
  },
  {
    key: 'nonStickPans',
    label: 'Non-Stick Pans',
    description: 'PFAS-coated non-stick cookware usage',
    category: 'kitchen',
    unit: 'times per week',
    pfasPerUnit: 0.03,
    icon: '🍳',
    enabled: true
  }
];

export const PFA_CATEGORIES = {
  'personal-care': { label: 'Personal Care', icon: '🧴', color: 'bg-pink-100 text-pink-800' },
  'household': { label: 'Household', icon: '🏠', color: 'bg-blue-100 text-blue-800' },
  'clothing': { label: 'Clothing', icon: '👕', color: 'bg-purple-100 text-purple-800' },
  'beverages': { label: 'Beverages', icon: '🥤', color: 'bg-cyan-100 text-cyan-800' },
  'kitchen': { label: 'Kitchen', icon: '🍳', color: 'bg-orange-100 text-orange-800' },
} as const;

export function getPfaSourcesByCategory() {
  const sourcesByCategory: Record<string, PfaSource[]> = {};
  
  PFA_SOURCES.forEach(source => {
    if (!sourcesByCategory[source.category]) {
      sourcesByCategory[source.category] = [];
    }
    sourcesByCategory[source.category].push(source);
  });
  
  return sourcesByCategory;
}

export function calculateTotalPfas(entry: any): number {
  let total = 0;
  total += (entry.dentalFloss || 0) * PFA_SOURCES.find(s => s.key === 'dentalFloss')!.pfasPerUnit;
  total += (entry.toiletPaper || 0) * PFA_SOURCES.find(s => s.key === 'toiletPaper')!.pfasPerUnit;
  total += (entry.yogaPants || 0) * PFA_SOURCES.find(s => s.key === 'yogaPants')!.pfasPerUnit;
  total += (entry.sportsBras || 0) * PFA_SOURCES.find(s => s.key === 'sportsBras')!.pfasPerUnit;
  total += (entry.tapWater || 0) * PFA_SOURCES.find(s => s.key === 'tapWater')!.pfasPerUnit;
  total += (entry.nonStickPans || 0) * PFA_SOURCES.find(s => s.key === 'nonStickPans')!.pfasPerUnit;
  return Math.round(total * 1000) / 1000; // Round to 3 decimal places for ppt
}

export function getPfaSourceBreakdown(entry: any) {
  const breakdown = PFA_SOURCES.map(source => {
    const value = entry[source.key] || 0;
    const pfas = value * source.pfasPerUnit;
    return {
      source: source.label,
      value,
      pfas: Math.round(pfas * 1000) / 1000,
      percentage: 0 // Will be calculated after total is known
    };
  });

  const totalPfas = breakdown.reduce((sum, item) => sum + item.pfas, 0);
  
  return breakdown.map(item => ({
    ...item,
    percentage: totalPfas > 0 ? Math.round((item.pfas / totalPfas) * 100) : 0
  }));
}

export function getPfaRiskLevel(totalPfas: number): string {
  if (totalPfas < PFA_RISK_LEVELS.LOW.max) return PFA_RISK_LEVELS.LOW.label;
  if (totalPfas < PFA_RISK_LEVELS.NORMAL.max) return PFA_RISK_LEVELS.NORMAL.label;
  if (totalPfas < PFA_RISK_LEVELS.HIGH.max) return PFA_RISK_LEVELS.HIGH.label;
  return PFA_RISK_LEVELS.EXTREME.label;
}

export function getPfaRiskLevelInfo(totalPfas: number) {
  if (totalPfas < PFA_RISK_LEVELS.LOW.max) return PFA_RISK_LEVELS.LOW;
  if (totalPfas < PFA_RISK_LEVELS.NORMAL.max) return PFA_RISK_LEVELS.NORMAL;
  if (totalPfas < PFA_RISK_LEVELS.HIGH.max) return PFA_RISK_LEVELS.HIGH;
  return PFA_RISK_LEVELS.EXTREME;
}
