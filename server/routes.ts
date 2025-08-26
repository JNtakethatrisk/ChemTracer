import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMicroplasticEntrySchema, RISK_LEVELS } from "@shared/schema";
import { z } from "zod";

// Conversion factors for each microplastic source (particles per unit per mL of blood)
const CONVERSION_FACTORS = {
  bottledWater: 0.12,      // particles per bottle per mL blood
  seafood: 0.08,          // particles per serving per mL blood  
  salt: 0.02,            // particles per tsp per mL blood
  plasticPackaged: 0.06,  // particles per meal per mL blood
  teaBags: 0.15,         // particles per cup per mL blood
  householdDust: 0.001,   // particles per hour indoors per mL blood
  syntheticClothing: 0.03, // particles per wear per mL blood
  cannedFood: 0.04,       // particles per can per mL blood
  cosmetics: 0.01,        // particles per application per mL blood
  plasticKitchenware: 0.05, // particles per use per mL blood
};

function calculateTotalParticles(entry: any): number {
  let total = 0;
  
  total += (entry.bottledWater || 0) * CONVERSION_FACTORS.bottledWater;
  total += (entry.seafood || 0) * CONVERSION_FACTORS.seafood;
  total += (entry.salt || 0) * CONVERSION_FACTORS.salt;
  total += (entry.plasticPackaged || 0) * CONVERSION_FACTORS.plasticPackaged;
  total += (entry.teaBags || 0) * CONVERSION_FACTORS.teaBags;
  total += (entry.householdDust || 0) * CONVERSION_FACTORS.householdDust;
  total += (entry.syntheticClothing || 0) * CONVERSION_FACTORS.syntheticClothing;
  total += (entry.cannedFood || 0) * CONVERSION_FACTORS.cannedFood;
  total += (entry.cosmetics || 0) * CONVERSION_FACTORS.cosmetics;
  total += (entry.plasticKitchenware || 0) * CONVERSION_FACTORS.plasticKitchenware;
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

function getRiskLevel(totalParticles: number): string {
  if (totalParticles < RISK_LEVELS.LOW.max) return RISK_LEVELS.LOW.label;
  if (totalParticles < RISK_LEVELS.MEDIUM.max) return RISK_LEVELS.MEDIUM.label;
  return RISK_LEVELS.HIGH.label;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment systems
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Microplastic Tracker API" });
  });

  // Get current user IP (for cache invalidation)
  app.get("/api/user-ip", (req, res) => {
    const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
    res.json({ ip: userIp });
  });

  // Get all microplastic entries
  app.get("/api/microplastic-entries", async (req, res) => {
    try {
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const entries = await storage.getMicroplasticEntries(userIp);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries" });
    }
  });

  // Get entries by date range
  app.get("/api/microplastic-entries/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const entries = await storage.getMicroplasticEntriesByDateRange(
        userIp,
        startDate as string, 
        endDate as string
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch entries by date range" });
    }
  });

  // Create new microplastic entry
  app.post("/api/microplastic-entries", async (req, res) => {
    try {
      const validatedData = insertMicroplasticEntrySchema.parse(req.body);
      
      const totalParticles = calculateTotalParticles(validatedData);
      const riskLevel = getRiskLevel(totalParticles);
      
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const entry = await storage.createMicroplasticEntry(userIp, {
        ...validatedData,
        totalParticles,
        riskLevel,
      });
      
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create entry" });
      }
    }
  });

  // Update microplastic entry
  app.put("/api/microplastic-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertMicroplasticEntrySchema.parse(req.body);
      
      const totalParticles = calculateTotalParticles(validatedData);
      const riskLevel = getRiskLevel(totalParticles);
      
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const entry = await storage.updateMicroplasticEntry(id, userIp, {
        ...validatedData,
        totalParticles,
        riskLevel,
      });
      
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update entry" });
      }
    }
  });

  // Delete microplastic entry
  app.delete("/api/microplastic-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const deleted = await storage.deleteMicroplasticEntry(id, userIp);
      
      if (!deleted) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json({ message: "Entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete entry" });
    }
  });

  // Get dashboard statistics
  app.get("/api/dashboard-stats", async (req, res) => {
    try {
      const userIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const entries = await storage.getMicroplasticEntries(userIp);
      
      if (entries.length === 0) {
        return res.json({
          currentRiskLevel: "No Data",
          currentParticleCount: 0,
          weeklyIntake: 0,
          monthlyAverage: 0,
          dataCompleteness: 0,
          weeklyChange: 0,
        });
      }
      
      const latest = entries[0];
      const previousWeek = entries[1];
      
      // Calculate monthly average (last 4 weeks)
      const last4Weeks = entries.slice(0, 4);
      const monthlyAverage = last4Weeks.length > 0 
        ? last4Weeks.reduce((sum, entry) => sum + entry.totalParticles, 0) / last4Weeks.length
        : 0;
      
      // Calculate weekly change
      const weeklyChange = previousWeek 
        ? ((latest.totalParticles - previousWeek.totalParticles) / previousWeek.totalParticles) * 100
        : 0;
      
      // Calculate data completeness (assuming 12 weeks target)
      const dataCompleteness = Math.min((entries.length / 12) * 100, 100);
      
      res.json({
        currentRiskLevel: latest.riskLevel,
        currentParticleCount: latest.totalParticles,
        weeklyIntake: latest.totalParticles,
        monthlyAverage: Math.round(monthlyAverage * 100) / 100,
        dataCompleteness: Math.round(dataCompleteness),
        weeklyChange: Math.round(weeklyChange * 100) / 100,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
