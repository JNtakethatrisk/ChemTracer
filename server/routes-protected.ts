import { Router } from "express";
import { storage } from "./storage";
import { insertMicroplasticEntrySchema, insertUserProfileSchema, insertPfaEntrySchema } from "@shared/schema";
import { z } from "zod";
import { calculateTotalParticles, getRiskLevel } from "./calculations/microplastic";
import { calculateTotalPfas, getPfaRiskLevel } from "./calculations/pfa";
import { requireAuth } from "./middleware/auth";

const router = Router();

// All routes in this file require authentication
router.use(requireAuth);

// Microplastic entries - now user-scoped
router.get("/api/microplastic-entries", async (req, res) => {
  try {
    const userId = req.user!.id;
    const entries = await storage.getMicroplasticEntriesByUser(userId);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching microplastic entries:", error);
    res.status(500).json({ message: "Failed to fetch entries" });
  }
});

router.post("/api/microplastic-entries", async (req, res) => {
  console.log("POST /api/microplastic-entries - Request body:", req.body);
  console.log("POST /api/microplastic-entries - User:", req.user);
  
  try {
    const userId = req.user!.id;
    const validatedData = insertMicroplasticEntrySchema.parse(req.body);
    
    const totalParticles = calculateTotalParticles(validatedData);
    const riskLevel = getRiskLevel(totalParticles);
    
    const entry = await storage.createMicroplasticEntryForUser(userId, {
      ...validatedData,
      totalParticles,
      riskLevel,
    });
    
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating microplastic entry:", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create entry", error: error.message });
    }
  }
});

// PFA entries - now user-scoped
router.get("/api/pfa-entries", async (req, res) => {
  try {
    const userId = req.user!.id;
    const entries = await storage.getPfaEntriesByUser(userId);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching PFA entries:", error);
    res.status(500).json({ message: "Failed to fetch PFA entries" });
  }
});

router.post("/api/pfa-entries", async (req, res) => {
  console.log("POST /api/pfa-entries - Request body:", req.body);
  console.log("POST /api/pfa-entries - User:", req.user);
  
  try {
    const userId = req.user!.id;
    const validatedData = insertPfaEntrySchema.parse(req.body);
    
    const totalPfas = calculateTotalPfas(validatedData);
    const riskLevel = getPfaRiskLevel(totalPfas);
    
    const entry = await storage.createPfaEntryForUser(userId, {
      ...validatedData,
      totalPfas,
      riskLevel,
    });
    
    res.status(201).json(entry);
  } catch (error) {
    console.error("Error creating PFA entry:", error);
    if (error instanceof z.ZodError) {
      console.error("PFA validation errors:", error.errors);
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create PFA entry", error: error.message });
    }
  }
});

// User profile - now user-scoped
router.get("/api/user-profile", async (req, res) => {
  try {
    const userId = req.user!.id;
    const profile = await storage.getUserProfileByUserId(userId);
    res.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

router.post("/api/user-profile", async (req, res) => {
  try {
    const userId = req.user!.id;
    const validatedData = insertUserProfileSchema.parse(req.body);
    const profile = await storage.createUserProfileForUser(userId, validatedData);
    res.status(201).json(profile);
  } catch (error) {
    console.error("Error creating user profile:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to create user profile" });
    }
  }
});

router.put("/api/user-profile/:id", async (req, res) => {
  try {
    const userId = req.user!.id;
    const profileId = req.params.id;
    const validatedData = insertUserProfileSchema.parse(req.body);
    
    // Verify the profile belongs to the user
    const existingProfile = await storage.getUserProfileByUserId(userId);
    if (!existingProfile || existingProfile.id !== profileId) {
      return res.status(404).json({ message: "Profile not found" });
    }
    
    const profile = await storage.updateUserProfile(profileId, validatedData);
    res.json(profile);
  } catch (error) {
    console.error("Error updating user profile:", error);
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Failed to update user profile" });
    }
  }
});

// Dashboard stats - now user-scoped
router.get("/api/dashboard-stats", async (req, res) => {
  try {
    const userId = req.user!.id;
    const entries = await storage.getMicroplasticEntriesByUser(userId);
    
    if (entries.length === 0) {
      return res.json({
        currentRiskLevel: "No Data",
        currentParticleCount: 0,
        weeklyIntake: 0,
        monthlyAverage: 0,
        dataCompleteness: 0,
        weeklyChange: 0,
        totalEntries: 0,
      });
    }

    // Get latest entry for current values
    const latest = entries[entries.length - 1];
    
    // Calculate monthly average
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );
    const monthlyAverage = lastMonthEntries.length > 0
      ? lastMonthEntries.reduce((sum, entry) => sum + entry.totalParticles, 0) / lastMonthEntries.length
      : 0;

    // Calculate weekly change
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEntries = entries.filter(entry => 
      new Date(entry.createdAt) < oneWeekAgo && 
      new Date(entry.createdAt) >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const lastWeekAverage = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((sum, entry) => sum + entry.totalParticles, 0) / lastWeekEntries.length
      : 0;
    const weeklyChange = lastWeekAverage > 0 
      ? ((latest.totalParticles - lastWeekAverage) / lastWeekAverage) * 100
      : 0;

    // Calculate data completeness
    const expectedWeeks = 4; // Expect data for last 4 weeks
    const actualWeeks = new Set(entries.map(entry => entry.weekStart)).size;
    const dataCompleteness = (actualWeeks / expectedWeeks) * 100;

    res.json({
      currentRiskLevel: latest.riskLevel,
      currentParticleCount: latest.totalParticles,
      weeklyIntake: latest.totalParticles,
      monthlyAverage: Math.round(monthlyAverage * 100) / 100,
      dataCompleteness: Math.round(dataCompleteness),
      weeklyChange: Math.round(weeklyChange * 100) / 100,
      totalEntries: entries.length,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard statistics" });
  }
});

router.get("/api/pfa-dashboard-stats", async (req, res) => {
  try {
    const userId = req.user!.id;
    const entries = await storage.getPfaEntriesByUser(userId);
    
    if (!entries || entries.length === 0) {
      return res.json({
        currentRiskLevel: "No Data",
        currentPfaCount: 0,
        weeklyIntake: 0,
        monthlyAverage: 0,
        dataCompleteness: 0,
        weeklyChange: 0,
        totalEntries: 0,
      });
    }

    // Similar calculations for PFA...
    const latest = entries[entries.length - 1];
    
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastMonthEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= thirtyDaysAgo
    );
    const monthlyAverage = lastMonthEntries.length > 0
      ? lastMonthEntries.reduce((sum, entry) => sum + entry.totalPfas, 0) / lastMonthEntries.length
      : 0;

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEntries = entries.filter(entry => 
      new Date(entry.createdAt) < oneWeekAgo && 
      new Date(entry.createdAt) >= new Date(oneWeekAgo.getTime() - 7 * 24 * 60 * 60 * 1000)
    );
    const lastWeekAverage = lastWeekEntries.length > 0
      ? lastWeekEntries.reduce((sum, entry) => sum + entry.totalPfas, 0) / lastWeekEntries.length
      : 0;
    const weeklyChange = lastWeekAverage > 0 
      ? ((latest.totalPfas - lastWeekAverage) / lastWeekAverage) * 100
      : 0;

    const expectedWeeks = 4;
    const actualWeeks = new Set(entries.map(entry => entry.weekStart)).size;
    const dataCompleteness = (actualWeeks / expectedWeeks) * 100;

    res.json({
      currentRiskLevel: latest.riskLevel,
      currentPfaCount: latest.totalPfas,
      weeklyIntake: latest.totalPfas,
      monthlyAverage: Math.round(monthlyAverage * 1000) / 1000,
      dataCompleteness: Math.round(dataCompleteness),
      weeklyChange: Math.round(weeklyChange * 100) / 100,
      totalEntries: entries.length,
    });
  } catch (error) {
    console.error("PFA dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch PFA dashboard statistics", error: error.message });
  }
});

export default router;
