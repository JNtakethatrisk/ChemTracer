import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const microplasticEntries = pgTable("microplastic_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  weekStart: text("week_start").notNull(),
  bottledWater: integer("bottled_water").default(0),
  seafood: integer("seafood").default(0),
  salt: real("salt").default(0),
  plasticPackaged: integer("plastic_packaged").default(0),
  teaBags: integer("tea_bags").default(0),
  householdDust: integer("household_dust").default(0),
  syntheticClothing: integer("synthetic_clothing").default(0),
  cannedFood: integer("canned_food").default(0),
  cosmetics: integer("cosmetics").default(0),
  plasticKitchenware: integer("plastic_kitchenware").default(0),
  totalParticles: real("total_particles").notNull(),
  riskLevel: text("risk_level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMicroplasticEntrySchema = createInsertSchema(microplasticEntries).omit({
  id: true,
  totalParticles: true,
  riskLevel: true,
  createdAt: true,
});

export type InsertMicroplasticEntry = z.infer<typeof insertMicroplasticEntrySchema>;
export type MicroplasticEntry = typeof microplasticEntries.$inferSelect;

// Risk level thresholds
export const RISK_LEVELS = {
  LOW: { min: 0, max: 1.5, label: "Low", color: "green" },
  MEDIUM: { min: 1.5, max: 3.0, label: "Medium", color: "orange" },
  HIGH: { min: 3.0, max: Infinity, label: "High", color: "red" },
} as const;
