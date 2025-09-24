import "dotenv/config";
import { db } from "./db";
import { pfaEntries } from "../shared/schema";

async function debugPFA() {
  try {
    console.log("Testing PFA database connection...");
    
    // Check if table exists
    const result = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pfa_entries'
      );
    `);
    
    console.log("Table exists check:", result);
    
    // Try to count entries
    const count = await db.select({ count: db.$count(pfaEntries) }).from(pfaEntries);
    console.log("PFA entries count:", count);
    
  } catch (error) {
    console.error("Error:", error);
  }
  
  process.exit(0);
}

debugPFA();
