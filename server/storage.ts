import { microplasticEntries, type MicroplasticEntry, type InsertMicroplasticEntry } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  getMicroplasticEntries(userIp: string): Promise<MicroplasticEntry[]>;
  getMicroplasticEntry(id: string, userIp: string): Promise<MicroplasticEntry | undefined>;
  getMicroplasticEntriesByDateRange(userIp: string, startDate: string, endDate: string): Promise<MicroplasticEntry[]>;
  createMicroplasticEntry(userIp: string, entry: InsertMicroplasticEntry & { totalParticles: number; riskLevel: string }): Promise<MicroplasticEntry>;
  updateMicroplasticEntry(id: string, userIp: string, entry: Partial<MicroplasticEntry>): Promise<MicroplasticEntry | undefined>;
  deleteMicroplasticEntry(id: string, userIp: string): Promise<boolean>;
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
        cosmetics: insertEntry.cosmetics ?? 0,
        plasticKitchenware: insertEntry.plasticKitchenware ?? 0,
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
}

export const storage = new DatabaseStorage();
