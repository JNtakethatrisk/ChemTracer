export interface MicroplasticSource {
  key: string;
  label: string;
  description: string;
  category: 'food' | 'beverages' | 'personal-care' | 'household' | 'clothing' | 'packaging';
  unit: string;
  particlesPerUnit: number;
  icon: string;
  enabled: boolean;
}

export const MICROPLASTIC_SOURCES: MicroplasticSource[] = [
  // Top priority items (most commonly tracked)
  {
    key: 'bottledWater',
    label: 'Plastic Water Bottles',
    description: 'Water from single-use plastic bottles',
    category: 'beverages',
    unit: 'bottles per week',
    particlesPerUnit: 0.2,
    icon: '🍶',
    enabled: true
  },
  {
    key: 'syntheticClothing',
    label: 'Synthetic Clothing',
    description: 'Wearing polyester, nylon, and synthetic fabrics',
    category: 'clothing',
    unit: 'wears per week',
    particlesPerUnit: 0.15,
    icon: '👕',
    enabled: true
  },
  {
    key: 'plasticPackaged',
    label: 'Plastic Packaged Food',
    description: 'Food items wrapped or stored in plastic',
    category: 'packaging',
    unit: 'items per week',
    particlesPerUnit: 0.2,
    icon: '📦',
    enabled: true
  },
  {
    key: 'householdDust',
    label: 'Indoor Time',
    description: 'Hours spent indoors (exposure to household dust)',
    category: 'household',
    unit: 'hours per day',
    particlesPerUnit: 0.01,
    icon: '🏠',
    enabled: true
  },

  // Other sources
  {
    key: 'seafood',
    label: 'Seafood Meals',
    description: 'Fish, shellfish, and other marine products',
    category: 'food',
    unit: 'meals per week',
    particlesPerUnit: 0.4,
    icon: '🐟',
    enabled: true
  },
  {
    key: 'salt',
    label: 'Salt Usage',
    description: 'Table salt and sea salt in cooking',
    category: 'food',
    unit: 'grams per week',
    particlesPerUnit: 0.1,
    icon: '🧂',
    enabled: true
  },
  {
    key: 'teaBags',
    label: 'Tea Bags',
    description: 'Tea bags made with plastic materials',
    category: 'beverages',
    unit: 'bags per week',
    particlesPerUnit: 0.1,
    icon: '🍵',
    enabled: true
  },
  {
    key: 'cannedFood',
    label: 'Canned Food',
    description: 'Food from metal cans with plastic linings',
    category: 'food',
    unit: 'cans per week',
    particlesPerUnit: 0.3,
    icon: '🥫',
    enabled: true
  },
  {
    key: 'plasticKitchenware',
    label: 'Plastic Kitchen Items',
    description: 'Using plastic utensils, containers, and cooking tools',
    category: 'household',
    unit: 'times per week',
    particlesPerUnit: 0.1,
    icon: '🍽️',
    enabled: true
  },
  {
    key: 'coffeeCups',
    label: 'Keurig Cups',
    description: 'Keurig K-cups and single-serve coffee pods',
    category: 'beverages',
    unit: 'cups per week',
    particlesPerUnit: 0.15,
    icon: '☕',
    enabled: true
  },
  {
    key: 'takeoutContainers',
    label: 'Takeout Orders',
    description: 'Food delivery containers and packaging',
    category: 'packaging',
    unit: 'orders per week',
    particlesPerUnit: 0.25,
    icon: '🥡',
    enabled: true
  }
];

export const CATEGORIES = {
  food: { label: 'Food & Nutrition', icon: '🍽️', color: 'bg-orange-100 text-orange-800' },
  beverages: { label: 'Beverages', icon: '🥤', color: 'bg-blue-100 text-blue-800' },
  household: { label: 'Household', icon: '🏠', color: 'bg-green-100 text-green-800' },
  clothing: { label: 'Clothing', icon: '👕', color: 'bg-purple-100 text-purple-800' },
  packaging: { label: 'Packaging', icon: '📦', color: 'bg-gray-100 text-gray-800' }
} as const;

export function getSourcesByCategory(sources: MicroplasticSource[]) {
  return sources.reduce((acc, source) => {
    if (!acc[source.category]) {
      acc[source.category] = [];
    }
    acc[source.category].push(source);
    return acc;
  }, {} as Record<string, MicroplasticSource[]>);
}

export function calculateTotalParticles(values: Record<string, number>, enabledSources: MicroplasticSource[]): number {
  return enabledSources.reduce((total, source) => {
    const value = values[source.key] || 0;
    return total + (value * source.particlesPerUnit);
  }, 0);
}

// Get breakdown of sources by particle contribution
export function getSourceBreakdown(data: Record<string, number>) {
  return MICROPLASTIC_SOURCES.map(source => ({
    ...source,
    value: data[source.key] || 0,
    particles: (data[source.key] || 0) * source.particlesPerUnit,
  })).sort((a, b) => b.particles - a.particles);
}

