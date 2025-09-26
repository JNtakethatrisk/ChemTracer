import { Router } from "express";
import { db } from "../db";
import { users, microplasticEntries, pfaEntries } from "../../shared/schema";
import { sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Basic analytics endpoint - protect with auth or add your own security
router.get("/api/analytics/summary", async (req, res) => {
  try {
    // Get total users
    const totalUsers = await db.select({ count: sql<number>`count(*)` })
      .from(users);

    // Get users registered in last 24 hours
    const newUsersToday = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at > NOW() - INTERVAL '24 hours'`);

    // Get users registered in last 7 days
    const newUsersWeek = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(sql`created_at > NOW() - INTERVAL '7 days'`);

    // Get total entries
    const totalMicroplasticEntries = await db.select({ count: sql<number>`count(*)` })
      .from(microplasticEntries);

    const totalPfasEntries = await db.select({ count: sql<number>`count(*)` })
      .from(pfaEntries);

    // Get active users (those who created entries in last 7 days)
    const activeUsers = await db.execute(sql`
      SELECT COUNT(DISTINCT user_id) as count
      FROM (
        SELECT user_id FROM microplastic_entries 
        WHERE created_at > NOW() - INTERVAL '7 days' AND user_id IS NOT NULL
        UNION
        SELECT user_id FROM pfa_entries 
        WHERE created_at > NOW() - INTERVAL '7 days' AND user_id IS NOT NULL
      ) as active
    `);

    res.json({
      users: {
        total: totalUsers[0]?.count || 0,
        newToday: newUsersToday[0]?.count || 0,
        newThisWeek: newUsersWeek[0]?.count || 0,
        activeThisWeek: activeUsers.rows[0]?.count || 0
      },
      entries: {
        microplastic: totalMicroplasticEntries[0]?.count || 0,
        pfas: totalPfasEntries[0]?.count || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get user growth over time
router.get("/api/analytics/growth", async (req, res) => {
  try {
    const growth = await db.execute(sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users,
        SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total_users
      FROM users
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date
    `);

    res.json({
      growth: growth.rows,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Growth analytics error:", error);
    res.status(500).json({ error: "Failed to fetch growth data" });
  }
});

export default router;
