import { db } from "./db";

export async function initializeDatabase() {
  try {
    console.log("Checking database tables...");
    
    // Create the PFA entries table if it doesn't exist
    await db.execute(`
      CREATE TABLE IF NOT EXISTS pfa_entries (
        id VARCHAR DEFAULT gen_random_uuid() PRIMARY KEY,
        user_ip TEXT NOT NULL,
        week_start TEXT NOT NULL,
        dental_floss INTEGER DEFAULT 0,
        toilet_paper INTEGER DEFAULT 0,
        sweat_resistant_clothing INTEGER DEFAULT 0,
        tap_water INTEGER DEFAULT 0,
        non_stick_pans INTEGER DEFAULT 0,
        total_pfas REAL NOT NULL,
        risk_level TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Check if we need to migrate from old columns
    try {
      const checkResult = await db.execute(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'pfa_entries' 
        AND column_name IN ('yoga_pants', 'sports_bras', 'sweat_resistant_clothing')
      `);
      
      const existingColumns = checkResult.rows.map((row: any) => row.column_name);
      console.log("PFA table columns:", existingColumns);
      
      if (existingColumns.includes('yoga_pants') || existingColumns.includes('sports_bras')) {
        console.log("Migrating PFA schema from old columns...");
        
        // Add the new column if it doesn't exist
        if (!existingColumns.includes('sweat_resistant_clothing')) {
          await db.execute(`
            ALTER TABLE pfa_entries 
            ADD COLUMN sweat_resistant_clothing INTEGER DEFAULT 0
          `);
          console.log("Added sweat_resistant_clothing column");
        }
        
        // Migrate data from old columns to new column
        await db.execute(`
          UPDATE pfa_entries 
          SET sweat_resistant_clothing = COALESCE(yoga_pants, 0) + COALESCE(sports_bras, 0)
          WHERE sweat_resistant_clothing IS NULL OR sweat_resistant_clothing = 0
        `);
        console.log("Migrated data from old columns");
        
        // Drop the old columns
        await db.execute(`
          ALTER TABLE pfa_entries 
          DROP COLUMN IF EXISTS yoga_pants,
          DROP COLUMN IF EXISTS sports_bras
        `);
        console.log("Dropped old columns");
      } else if (!existingColumns.includes('sweat_resistant_clothing')) {
        // Table exists but doesn't have any of the columns, add the new one
        await db.execute(`
          ALTER TABLE pfa_entries 
          ADD COLUMN IF NOT EXISTS sweat_resistant_clothing INTEGER DEFAULT 0
        `);
        console.log("Added sweat_resistant_clothing column");
      }
    } catch (migrationError) {
      console.log("Migration check/update:", migrationError.message);
    }
    
    // Make user_ip nullable for authenticated users
    try {
      console.log("Making user_ip columns nullable...");
      await db.execute(`
        ALTER TABLE microplastic_entries 
        ALTER COLUMN user_ip DROP NOT NULL
      `);
      await db.execute(`
        ALTER TABLE user_profiles 
        ALTER COLUMN user_ip DROP NOT NULL
      `);
      await db.execute(`
        ALTER TABLE pfa_entries 
        ALTER COLUMN user_ip DROP NOT NULL
      `);
      console.log("Made user_ip columns nullable");
    } catch (error: any) {
      // This will fail if already nullable, which is fine
      console.log("user_ip nullable migration:", error.message);
    }

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    // Don't throw - let the app continue even if table creation fails
  }
}
