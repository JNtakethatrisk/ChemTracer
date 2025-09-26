import { Router } from "express";
import { z } from "zod";
import { calculateTotalParticles, getRiskLevel } from "../calculations/microplastic";
import { calculateTotalPfas, getPfaRiskLevel } from "../calculations/pfa";

const router = Router();

// Microplastic calculation schema
const microplasticCalcSchema = z.object({
  bottledWater: z.number().int().min(0).default(0),
  seafood: z.number().int().min(0).default(0),
  salt: z.number().min(0).default(0),
  plasticPackaged: z.number().int().min(0).default(0),
  teaBags: z.number().int().min(0).default(0),
  householdDust: z.number().int().min(0).default(0),
  syntheticClothing: z.number().int().min(0).default(0),
  cannedFood: z.number().int().min(0).default(0),
  plasticKitchenware: z.number().int().min(0).default(0),
  coffeeCups: z.number().int().min(0).default(0),
  takeoutContainers: z.number().int().min(0).default(0),
});

// PFAS calculation schema
const pfaCalcSchema = z.object({
  dentalFloss: z.number().int().min(0).default(0),
  toiletPaper: z.number().int().min(0).default(0),
  sweatResistantClothing: z.number().int().min(0).default(0),
  tapWater: z.number().int().min(0).default(0),
  nonStickPans: z.number().int().min(0).default(0),
});

// Pure calculation endpoint for microplastics
router.post("/api/calc/microplastic", (req, res) => {
  try {
    const input = microplasticCalcSchema.parse(req.body);
    const totalParticles = calculateTotalParticles(input);
    const riskLevel = getRiskLevel(totalParticles);
    
    res.status(200).json({
      totalParticles,
      riskLevel,
      sources: Object.entries(input).map(([key, value]) => ({
        source: key,
        value,
        contribution: value > 0 ? (value * getParticlesPerUnit(key)) : 0
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else {
      res.status(500).json({ error: "Calculation failed" });
    }
  }
});

// Pure calculation endpoint for PFAS
router.post("/api/calc/pfa", (req, res) => {
  try {
    const input = pfaCalcSchema.parse(req.body);
    const totalPfas = calculateTotalPfas(input);
    const riskLevel = getPfaRiskLevel(totalPfas);
    
    res.status(200).json({
      totalPfas,
      riskLevel,
      sources: Object.entries(input).map(([key, value]) => ({
        source: key,
        value,
        contribution: value > 0 ? (value * getPfaPerUnit(key)) : 0
      }))
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: "Invalid input", details: error.errors });
    } else {
      res.status(500).json({ error: "Calculation failed" });
    }
  }
});

// Helper functions to get conversion factors
function getParticlesPerUnit(source: string): number {
  const factors: Record<string, number> = {
    bottledWater: 0.2,
    seafood: 0.35,
    salt: 0.5,
    plasticPackaged: 0.2,
    teaBags: 0.1,
    householdDust: 0.01,
    syntheticClothing: 0.15,
    cannedFood: 0.1,
    plasticKitchenware: 0.05,
    coffeeCups: 0.05,
    takeoutContainers: 0.08,
  };
  return factors[source] || 0;
}

function getPfaPerUnit(source: string): number {
  const factors: Record<string, number> = {
    dentalFloss: 0.05,
    toiletPaper: 0.02,
    sweatResistantClothing: 0.012,
    tapWater: 0.001,
    nonStickPans: 0.03,
  };
  return factors[source] || 0;
}

export default router;
