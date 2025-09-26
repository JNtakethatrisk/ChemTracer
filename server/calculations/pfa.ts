// PFAS conversion factors (ppt per unit per week)
const PFAS_CONVERSION_FACTORS = {
  dentalFloss: 0.05,      // ppt per use per week
  toiletPaper: 0.02,      // ppt per roll per week
  sweatResistantClothing: 0.012,  // ppt per wear per week
  tapWater: 0.001,        // ppt per glass per week
  nonStickPans: 0.03,     // ppt per use per week
};

export function calculateTotalPfas(entry: any): number {
  let total = 0;
  for (const [key, value] of Object.entries(entry)) {
    if (key in PFAS_CONVERSION_FACTORS && typeof value === 'number') {
      total += value * PFAS_CONVERSION_FACTORS[key as keyof typeof PFAS_CONVERSION_FACTORS];
    }
  }
  return Math.round(total * 1000) / 1000; // Round to 3 decimal places for ppt
}

export function getPfaRiskLevel(ppt: number): string {
  if (ppt < 0.07) return "Low";
  if (ppt < 0.2) return "Normal";
  if (ppt < 0.5) return "High";
  return "Extreme";
}
