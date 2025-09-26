// Microplastic conversion factors (particles per unit per week)
const CONVERSION_FACTORS = {
  bottledWater: 0.2,      // per bottle
  seafood: 0.35,          // per serving
  salt: 0.5,              // per teaspoon
  plasticPackaged: 0.2,   // per item
  teaBags: 0.1,           // per bag
  householdDust: 0.01,    // per hour indoors
  syntheticClothing: 0.15,// per wear
  cannedFood: 0.1,        // per can
  plasticKitchenware: 0.05,// per use
  coffeeCups: 0.05,       // per cup
  takeoutContainers: 0.08,// per container
};

export function calculateTotalParticles(entry: any): number {
  let total = 0;
  for (const [key, value] of Object.entries(entry)) {
    if (key in CONVERSION_FACTORS && typeof value === 'number') {
      total += value * CONVERSION_FACTORS[key as keyof typeof CONVERSION_FACTORS];
    }
  }
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

export function getRiskLevel(particles: number): string {
  if (particles < 5) return "Low";
  if (particles < 20) return "Normal";
  if (particles < 90) return "High";
  return "Extreme";
}
