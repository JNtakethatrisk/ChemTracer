import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMicroplasticEntrySchema, insertUserProfileSchema, insertPfaEntrySchema, RISK_LEVELS, PFA_RISK_LEVELS } from "@shared/schema";
import { z } from "zod";

// Conversion factors for each microplastic source (particles per unit per mL of blood)
const CONVERSION_FACTORS = {
  bottledWater: 0.2,      // particles per bottle per mL blood
  seafood: 0.5,          // particles per serving per mL blood  
  salt: 0.1,            // particles per gram per mL blood
  plasticPackaged: 0.2,  // particles per item per mL blood
  teaBags: 0.1,         // particles per bag per mL blood
  householdDust: 0.02,   // particles per exposure per mL blood
  syntheticClothing: 0.15, // particles per wear per mL blood
  cannedFood: 0.3,       // particles per can per mL blood
  plasticKitchenware: 0.1, // particles per use per mL blood
  coffeeCups: 0.15,      // particles per cup per mL blood
  takeoutContainers: 0.25, // particles per container per mL blood
};

// PFA conversion factors (parts per trillion per unit)
const PFA_CONVERSION_FACTORS = {
  dentalFloss: 0.05,      // ppt per use per week
  toiletPaper: 0.02,      // ppt per roll per week
  yogaPants: 0.012,       // ppt per wear per week
  sportsBras: 0.012,      // ppt per wear per week
  tapWater: 0.001,        // ppt per glass per week
  nonStickPans: 0.03,     // ppt per use per week
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
  total += (entry.plasticKitchenware || 0) * CONVERSION_FACTORS.plasticKitchenware;
  total += (entry.coffeeCups || 0) * CONVERSION_FACTORS.coffeeCups;
  total += (entry.takeoutContainers || 0) * CONVERSION_FACTORS.takeoutContainers;
  
  return Math.round(total * 100) / 100; // Round to 2 decimal places
}

function getRiskLevel(totalParticles: number): string {
  if (totalParticles < RISK_LEVELS.LOW.max) return RISK_LEVELS.LOW.label;
  if (totalParticles < RISK_LEVELS.NORMAL.max) return RISK_LEVELS.NORMAL.label;
  if (totalParticles < RISK_LEVELS.HIGH.max) return RISK_LEVELS.HIGH.label;
  return RISK_LEVELS.EXTREME.label;
}

function calculateTotalPfas(entry: any): number {
  let total = 0;
  
  total += (entry.dentalFloss || 0) * PFA_CONVERSION_FACTORS.dentalFloss;
  total += (entry.toiletPaper || 0) * PFA_CONVERSION_FACTORS.toiletPaper;
  total += (entry.yogaPants || 0) * PFA_CONVERSION_FACTORS.yogaPants;
  total += (entry.sportsBras || 0) * PFA_CONVERSION_FACTORS.sportsBras;
  total += (entry.tapWater || 0) * PFA_CONVERSION_FACTORS.tapWater;
  total += (entry.nonStickPans || 0) * PFA_CONVERSION_FACTORS.nonStickPans;
  
  return Math.round(total * 1000) / 1000; // Round to 3 decimal places for ppt
}

function getPfaRiskLevel(totalPfas: number): string {
  if (totalPfas < PFA_RISK_LEVELS.LOW.max) return PFA_RISK_LEVELS.LOW.label;
  if (totalPfas < PFA_RISK_LEVELS.NORMAL.max) return PFA_RISK_LEVELS.NORMAL.label;
  if (totalPfas < PFA_RISK_LEVELS.HIGH.max) return PFA_RISK_LEVELS.HIGH.label;
  return PFA_RISK_LEVELS.EXTREME.label;
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

  // Helper function to extract user IP
  function getUserIp(req: any): string {
    return req.ip || 
           req.connection?.remoteAddress || 
           req.socket?.remoteAddress ||
           (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
           req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           '127.0.0.1';
  }

  // Get current user session (for cache invalidation)
  app.get("/api/user-session", (req, res) => {
    const userIp = getUserIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Create a consistent session ID based on IP and user agent (without timestamp)
    // This ensures the same IP gets the same session ID across visits
    const sessionId = Buffer.from(`${userIp}-${userAgent}`).toString('base64').substring(0, 16);
    
    res.json({ 
      ip: userIp,
      sessionId: sessionId,
      isNewSession: false // This will be determined by the frontend based on localStorage
    });
  });

  // Get all microplastic entries
  app.get("/api/microplastic-entries", async (req, res) => {
    try {
      const userIp = getUserIp(req);
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
      
      const userIp = getUserIp(req);
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
      
      const userIp = getUserIp(req);
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
      
      const userIp = getUserIp(req);
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
      const userIp = getUserIp(req);
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
      const userIp = getUserIp(req);
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

  // Get user profile
  app.get("/api/user-profile", async (req, res) => {
    try {
      const userIp = getUserIp(req);
      const profile = await storage.getUserProfile(userIp);
      res.json(profile || null);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  // Create or update user profile
  app.post("/api/user-profile", async (req, res) => {
    try {
      const userIp = getUserIp(req);
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createOrUpdateUserProfile(userIp, validatedData);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to save user profile" });
      }
    }
  });

  // PFA Routes
  // Get all PFA entries
  app.get("/api/pfa-entries", async (req, res) => {
    try {
      const userIp = getUserIp(req);
      const entries = await storage.getPfaEntries(userIp);
      res.json(entries);
    } catch (error) {
      console.error("PFA entries error:", error);
      res.status(500).json({ message: "Failed to fetch PFA entries", error: error.message });
    }
  });

  // Get PFA entries by date range
  app.get("/api/pfa-entries/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const userIp = getUserIp(req);
      const entries = await storage.getPfaEntriesByDateRange(
        userIp,
        startDate as string, 
        endDate as string
      );
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch PFA entries by date range" });
    }
  });

  // Create new PFA entry
  app.post("/api/pfa-entries", async (req, res) => {
    try {
      const validatedData = insertPfaEntrySchema.parse(req.body);
      
      const totalPfas = calculateTotalPfas(validatedData);
      const riskLevel = getPfaRiskLevel(totalPfas);
      
      const userIp = getUserIp(req);
      const entry = await storage.createPfaEntry(userIp, {
        ...validatedData,
        totalPfas,
        riskLevel,
      });
      
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create PFA entry" });
      }
    }
  });

  // Update PFA entry
  app.put("/api/pfa-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPfaEntrySchema.parse(req.body);
      
      const totalPfas = calculateTotalPfas(validatedData);
      const riskLevel = getPfaRiskLevel(totalPfas);
      
      const userIp = getUserIp(req);
      const entry = await storage.updatePfaEntry(id, userIp, {
        ...validatedData,
        totalPfas,
        riskLevel,
      });
      
      if (!entry) {
        return res.status(404).json({ message: "PFA entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update PFA entry" });
      }
    }
  });

  // Delete PFA entry
  app.delete("/api/pfa-entries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const userIp = getUserIp(req);
      const deleted = await storage.deletePfaEntry(id, userIp);
      
      if (!deleted) {
        return res.status(404).json({ message: "PFA entry not found" });
      }
      
      res.json({ message: "PFA entry deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete PFA entry" });
    }
  });

  // Get PFA dashboard statistics
  app.get("/api/pfa-dashboard-stats", async (req, res) => {
    try {
      const userIp = getUserIp(req);
      const entries = await storage.getPfaEntries(userIp);
      
      if (entries.length === 0) {
        return res.json({
          currentRiskLevel: "No Data",
          currentPfaCount: 0,
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
        ? last4Weeks.reduce((sum, entry) => sum + entry.totalPfas, 0) / last4Weeks.length
        : 0;
      
      // Calculate weekly change
      const weeklyChange = previousWeek 
        ? ((latest.totalPfas - previousWeek.totalPfas) / previousWeek.totalPfas) * 100
        : 0;
      
      // Calculate data completeness (assuming 12 weeks target)
      const dataCompleteness = Math.min((entries.length / 12) * 100, 100);
      
      res.json({
        currentRiskLevel: latest.riskLevel,
        currentPfaCount: latest.totalPfas,
        weeklyIntake: latest.totalPfas,
        monthlyAverage: Math.round(monthlyAverage * 1000) / 1000,
        dataCompleteness: Math.round(dataCompleteness),
        weeklyChange: Math.round(weeklyChange * 100) / 100,
      });
    } catch (error) {
      console.error("PFA dashboard stats error:", error);
      res.status(500).json({ message: "Failed to fetch PFA dashboard statistics", error: error.message });
    }
  });

  // Get percentile comparison
  app.get("/api/percentile-comparison", async (req, res) => {
    try {
      const userIp = getUserIp(req);
      const { ageGroup } = req.query;
      
      // Get user's latest entry
      const userEntries = await storage.getMicroplasticEntries(userIp);
      if (userEntries.length === 0) {
        return res.json({ 
          percentile: null, 
          message: "No data available for comparison" 
        });
      }
      
      const userValue = userEntries[0].totalParticles;
      
      // Get percentile data
      const percentileData = await storage.getPercentileData(ageGroup as string);
      
      if (percentileData.length === 0) {
        return res.json({ 
          percentile: null, 
          message: "No comparison data available" 
        });
      }
      
      // Calculate percentile
      const totalCount = percentileData.reduce((sum, item) => sum + item.count, 0);
      let countBelow = 0;
      
      for (const item of percentileData) {
        if (item.totalParticles < userValue) {
          countBelow += item.count;
        } else {
          break;
        }
      }
      
      const percentile = Math.round((countBelow / totalCount) * 100);
      
      res.json({
        percentile,
        userValue,
        totalCount,
        ageGroup: ageGroup || "all",
        message: `You're in the ${percentile}th percentile for your ${ageGroup || 'all users'}`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate percentile comparison" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
