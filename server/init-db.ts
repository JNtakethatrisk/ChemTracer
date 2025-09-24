import { db } from "./db";

export async function initializeDatabase() {
  try {
    // Check if pfa_entries table exists
    const tableCheck = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'pfa_entries'
      );
    `);
    
    const tableExists = tableCheck.rows[0]?.exists;
    
    if (!tableExists) {
      console.log("Creating pfa_entries table...");
      
      // Create the PFA entries table
      await db.execute(`
        CREATE TABLE IF NOT EXISTS pfa_entries (
          id VARCHAR DEFAULT gen_random_uuid() PRIMARY KEY,
          user_ip TEXT NOT NULL,
          week_start TEXT NOT NULL,
          dental_floss INTEGER DEFAULT 0,
          toilet_paper INTEGER DEFAULT 0,
          yoga_pants INTEGER DEFAULT 0,
          sports_bras INTEGER DEFAULT 0,
          tap_water INTEGER DEFAULT 0,
          non_stick_pans INTEGER DEFAULT 0,
          total_pfas REAL NOT NULL,
          risk_level TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log("PFA entries table created successfully");
    } else {
      console.log("PFA entries table already exists");
    }
  } catch (error) {
    console.error("Database initialization error:", error);
    // Don't throw - let the app continue even if table creation fails
  }
}
