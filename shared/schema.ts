import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const microplasticEntries = pgTable("microplastic_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userIp: text("user_ip").notNull(),
  weekStart: text("week_start").notNull(),
  bottledWater: integer("bottled_water").default(0),
  seafood: integer("seafood").default(0),
  salt: real("salt").default(0),
  plasticPackaged: integer("plastic_packaged").default(0),
  teaBags: integer("tea_bags").default(0),
  householdDust: integer("household_dust").default(0),
  syntheticClothing: integer("synthetic_clothing").default(0),
  cannedFood: integer("canned_food").default(0),
  plasticKitchenware: integer("plastic_kitchenware").default(0),
  coffeeCups: integer("coffee_cups").default(0),
  takeoutContainers: integer("takeout_containers").default(0),
  totalParticles: real("total_particles").notNull(),
  riskLevel: text("risk_level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userIp: text("user_ip").notNull().unique(),
  age: integer("age"),
  gender: text("gender"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pfaEntries = pgTable("pfa_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userIp: text("user_ip").notNull(),
  weekStart: text("week_start").notNull(),
  dentalFloss: integer("dental_floss").default(0),
  toiletPaper: integer("toilet_paper").default(0),
  sweatResistantClothing: integer("sweat_resistant_clothing").default(0),
  tapWater: integer("tap_water").default(0),
  nonStickPans: integer("non_stick_pans").default(0),
  totalPfas: real("total_pfas").notNull(),
  riskLevel: text("risk_level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMicroplasticEntrySchema = createInsertSchema(microplasticEntries).omit({
  id: true,
  userIp: true,
  totalParticles: true,
  riskLevel: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  userIp: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPfaEntrySchema = createInsertSchema(pfaEntries).omit({
  id: true,
  userIp: true,
  totalPfas: true,
  riskLevel: true,
  createdAt: true,
});

export type InsertMicroplasticEntry = z.infer<typeof insertMicroplasticEntrySchema>;
export type MicroplasticEntry = typeof microplasticEntries.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertPfaEntry = z.infer<typeof insertPfaEntrySchema>;
export type PfaEntry = typeof pfaEntries.$inferSelect;

// Risk level thresholds based on research data
export const RISK_LEVELS = {
  LOW: { min: 0, max: 5, label: "Low", color: "green", description: "No or minimal microplastic detected" },
  NORMAL: { min: 5, max: 20, label: "Normal", color: "blue", description: "Around the mean, typical range" },
  HIGH: { min: 20, max: 90, label: "High", color: "red", description: "Upper end of observed range" },
  EXTREME: { min: 90, max: Infinity, label: "Extreme", color: "purple", description: "Significantly above normal range" },
} as const;

// PFA risk level thresholds (in ppt - parts per trillion)
export const PFA_RISK_LEVELS = {
  LOW: { min: 0, max: 0.02, label: "Low", color: "green", description: "Below EPA limits for PFOS/PFOA" },
  NORMAL: { min: 0.02, max: 0.1, label: "Normal", color: "lightgreen", description: "Within acceptable range" },
  HIGH: { min: 0.1, max: 1.0, label: "High", color: "orange", description: "Above recommended levels" },
  EXTREME: { min: 1.0, max: Infinity, label: "Extreme", color: "red", description: "Significantly above safe levels" },
} as const;

export type DashboardStats = {
  currentRiskLevel: string;
  currentParticleCount: number;
  weeklyIntake: number;
  weeklyChange: number;
  monthlyAverage: number;
  dataCompleteness: number;
};
