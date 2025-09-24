import { microplasticEntries, userProfiles, pfaEntries, type MicroplasticEntry, type InsertMicroplasticEntry, type UserProfile, type InsertUserProfile, type PfaEntry, type InsertPfaEntry } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  getMicroplasticEntries(userIp: string): Promise<MicroplasticEntry[]>;
  getMicroplasticEntry(id: string, userIp: string): Promise<MicroplasticEntry | undefined>;
  getMicroplasticEntriesByDateRange(userIp: string, startDate: string, endDate: string): Promise<MicroplasticEntry[]>;
  createMicroplasticEntry(userIp: string, entry: InsertMicroplasticEntry & { totalParticles: number; riskLevel: string }): Promise<MicroplasticEntry>;
  updateMicroplasticEntry(id: string, userIp: string, entry: Partial<MicroplasticEntry>): Promise<MicroplasticEntry | undefined>;
  deleteMicroplasticEntry(id: string, userIp: string): Promise<boolean>;
  
  // PFA methods
  getPfaEntries(userIp: string): Promise<PfaEntry[]>;
  getPfaEntry(id: string, userIp: string): Promise<PfaEntry | undefined>;
  getPfaEntriesByDateRange(userIp: string, startDate: string, endDate: string): Promise<PfaEntry[]>;
  createPfaEntry(userIp: string, entry: InsertPfaEntry & { totalPfas: number; riskLevel: string }): Promise<PfaEntry>;
  updatePfaEntry(id: string, userIp: string, entry: Partial<PfaEntry>): Promise<PfaEntry | undefined>;
  deletePfaEntry(id: string, userIp: string): Promise<boolean>;
  
  // User profile methods
  getUserProfile(userIp: string): Promise<UserProfile | undefined>;
  createOrUpdateUserProfile(userIp: string, profile: InsertUserProfile): Promise<UserProfile>;
  
  // Percentile calculation methods
  getPercentileData(ageGroup?: string): Promise<{ totalParticles: number; count: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getMicroplasticEntries(userIp: string): Promise<MicroplasticEntry[]> {
    const entries = await db.select().from(microplasticEntries)
      .where(eq(microplasticEntries.userIp, userIp))
      .orderBy(desc(microplasticEntries.createdAt));
    return entries;
  }

  async getMicroplasticEntry(id: string, userIp: string): Promise<MicroplasticEntry | undefined> {
    const [entry] = await db.select().from(microplasticEntries)
      .where(and(eq(microplasticEntries.id, id), eq(microplasticEntries.userIp, userIp)));
    return entry || undefined;
  }

  async getMicroplasticEntriesByDateRange(userIp: string, startDate: string, endDate: string): Promise<MicroplasticEntry[]> {
    const entries = await db.select().from(microplasticEntries)
      .where(and(
        eq(microplasticEntries.userIp, userIp),
        gte(microplasticEntries.weekStart, startDate),
        lte(microplasticEntries.weekStart, endDate)
      ))
      .orderBy(desc(microplasticEntries.createdAt));
    return entries;
  }

  async createMicroplasticEntry(userIp: string, insertEntry: InsertMicroplasticEntry & { totalParticles: number; riskLevel: string }): Promise<MicroplasticEntry> {
    const [entry] = await db
      .insert(microplasticEntries)
      .values({
        userIp,
        weekStart: insertEntry.weekStart,
        bottledWater: insertEntry.bottledWater ?? 0,
        seafood: insertEntry.seafood ?? 0,
        salt: insertEntry.salt ?? 0,
        plasticPackaged: insertEntry.plasticPackaged ?? 0,
        teaBags: insertEntry.teaBags ?? 0,
        householdDust: insertEntry.householdDust ?? 0,
        syntheticClothing: insertEntry.syntheticClothing ?? 0,
        cannedFood: insertEntry.cannedFood ?? 0,
        plasticKitchenware: insertEntry.plasticKitchenware ?? 0,
        coffeeCups: insertEntry.coffeeCups ?? 0,
        takeoutContainers: insertEntry.takeoutContainers ?? 0,
        totalParticles: insertEntry.totalParticles,
        riskLevel: insertEntry.riskLevel,
      })
      .returning();
    return entry;
  }

  async updateMicroplasticEntry(id: string, userIp: string, updateEntry: Partial<MicroplasticEntry>): Promise<MicroplasticEntry | undefined> {
    const [entry] = await db
      .update(microplasticEntries)
      .set(updateEntry)
      .where(and(eq(microplasticEntries.id, id), eq(microplasticEntries.userIp, userIp)))
      .returning();
    return entry || undefined;
  }

  async deleteMicroplasticEntry(id: string, userIp: string): Promise<boolean> {
    const result = await db
      .delete(microplasticEntries)
      .where(and(eq(microplasticEntries.id, id), eq(microplasticEntries.userIp, userIp)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // PFA methods
  async getPfaEntries(userIp: string): Promise<PfaEntry[]> {
    try {
      const entries = await db.select().from(pfaEntries)
        .where(eq(pfaEntries.userIp, userIp))
        .orderBy(desc(pfaEntries.createdAt));
      return entries;
    } catch (error) {
      console.error("getPfaEntries error:", error);
      // Return empty array if table doesn't exist
      return [];
    }
  }

  async getPfaEntry(id: string, userIp: string): Promise<PfaEntry | undefined> {
    try {
      const [entry] = await db.select().from(pfaEntries)
        .where(and(eq(pfaEntries.id, id), eq(pfaEntries.userIp, userIp)));
      return entry || undefined;
    } catch (error) {
      console.error("getPfaEntry error:", error);
      return undefined;
    }
  }

  async getPfaEntriesByDateRange(userIp: string, startDate: string, endDate: string): Promise<PfaEntry[]> {
    try {
      const entries = await db.select().from(pfaEntries)
        .where(and(
          eq(pfaEntries.userIp, userIp),
          gte(pfaEntries.weekStart, startDate),
          lte(pfaEntries.weekStart, endDate)
        ))
        .orderBy(desc(pfaEntries.createdAt));
      return entries;
    } catch (error) {
      console.error("getPfaEntriesByDateRange error:", error);
      return [];
    }
  }

  async createPfaEntry(userIp: string, insertEntry: InsertPfaEntry & { totalPfas: number; riskLevel: string }): Promise<PfaEntry> {
    try {
      const [entry] = await db
        .insert(pfaEntries)
        .values({
          userIp,
          weekStart: insertEntry.weekStart,
          dentalFloss: insertEntry.dentalFloss ?? 0,
          toiletPaper: insertEntry.toiletPaper ?? 0,
          sweatResistantClothing: insertEntry.sweatResistantClothing ?? 0,
          tapWater: insertEntry.tapWater ?? 0,
          nonStickPans: insertEntry.nonStickPans ?? 0,
          totalPfas: insertEntry.totalPfas,
          riskLevel: insertEntry.riskLevel,
        })
        .returning();
      return entry;
    } catch (error) {
      console.error("createPfaEntry error:", error);
      // Throw error so API returns 500
      throw error;
    }
  }

  async updatePfaEntry(id: string, userIp: string, updateEntry: Partial<PfaEntry>): Promise<PfaEntry | undefined> {
    const [entry] = await db
      .update(pfaEntries)
      .set(updateEntry)
      .where(and(eq(pfaEntries.id, id), eq(pfaEntries.userIp, userIp)))
      .returning();
    return entry || undefined;
  }

  async deletePfaEntry(id: string, userIp: string): Promise<boolean> {
    const result = await db
      .delete(pfaEntries)
      .where(and(eq(pfaEntries.id, id), eq(pfaEntries.userIp, userIp)));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // User profile methods
  async getUserProfile(userIp: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles)
      .where(eq(userProfiles.userIp, userIp));
    return profile || undefined;
  }

  async createOrUpdateUserProfile(userIp: string, profileData: InsertUserProfile): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(userIp);
    
    if (existingProfile) {
      const [updatedProfile] = await db
        .update(userProfiles)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(userProfiles.userIp, userIp))
        .returning();
      return updatedProfile;
    } else {
      const [newProfile] = await db
        .insert(userProfiles)
        .values({ userIp, ...profileData })
        .returning();
      return newProfile;
    }
  }

  // Percentile calculation methods
  async getPercentileData(ageGroup?: string): Promise<{ totalParticles: number; count: number }[]> {
    let query = db
      .select({
        totalParticles: microplasticEntries.totalParticles,
        count: sql<number>`count(*)`.as('count')
      })
      .from(microplasticEntries);

    if (ageGroup) {
      // Join with user profiles to filter by age group
      query = query
        .innerJoin(userProfiles, eq(microplasticEntries.userIp, userProfiles.userIp))
        .where(sql`${userProfiles.age} >= ${ageGroup.split('-')[0]} AND ${userProfiles.age} <= ${ageGroup.split('-')[1]}`);
    }

    const results = await query
      .groupBy(microplasticEntries.totalParticles)
      .orderBy(microplasticEntries.totalParticles);

    return results;
  }
}

export const storage = new DatabaseStorage();
