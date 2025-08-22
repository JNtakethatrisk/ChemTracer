import { type MicroplasticEntry, type InsertMicroplasticEntry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMicroplasticEntries(): Promise<MicroplasticEntry[]>;
  getMicroplasticEntry(id: string): Promise<MicroplasticEntry | undefined>;
  getMicroplasticEntriesByDateRange(startDate: string, endDate: string): Promise<MicroplasticEntry[]>;
  createMicroplasticEntry(entry: InsertMicroplasticEntry & { totalParticles: number; riskLevel: string }): Promise<MicroplasticEntry>;
  updateMicroplasticEntry(id: string, entry: Partial<MicroplasticEntry>): Promise<MicroplasticEntry | undefined>;
  deleteMicroplasticEntry(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private microplasticEntries: Map<string, MicroplasticEntry>;

  constructor() {
    this.microplasticEntries = new Map();
  }

  async getMicroplasticEntries(): Promise<MicroplasticEntry[]> {
    return Array.from(this.microplasticEntries.values()).sort(
      (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
    );
  }

  async getMicroplasticEntry(id: string): Promise<MicroplasticEntry | undefined> {
    return this.microplasticEntries.get(id);
  }

  async getMicroplasticEntriesByDateRange(startDate: string, endDate: string): Promise<MicroplasticEntry[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Array.from(this.microplasticEntries.values()).filter(entry => {
      const entryDate = new Date(entry.weekStart);
      return entryDate >= start && entryDate <= end;
    }).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
  }

  async createMicroplasticEntry(insertEntry: InsertMicroplasticEntry & { totalParticles: number; riskLevel: string }): Promise<MicroplasticEntry> {
    const id = randomUUID();
    const entry: MicroplasticEntry = {
      id,
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
      createdAt: new Date(),
    };
    this.microplasticEntries.set(id, entry);
    return entry;
  }

  async updateMicroplasticEntry(id: string, updateEntry: Partial<MicroplasticEntry>): Promise<MicroplasticEntry | undefined> {
    const existing = this.microplasticEntries.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updateEntry };
    this.microplasticEntries.set(id, updated);
    return updated;
  }

  async deleteMicroplasticEntry(id: string): Promise<boolean> {
    return this.microplasticEntries.delete(id);
  }
}

export const storage = new MemStorage();
