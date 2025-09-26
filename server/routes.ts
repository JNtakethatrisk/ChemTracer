import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth";
import calcRoutes from "./routes/calc";
import protectedRoutes from "./routes-protected";

// Rate limiter for public calculator endpoints
const calcLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  message: "Too many requests, please try again later."
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoints
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "ChemTracer API" });
  });

  // Mount auth routes (no rate limiting on auth)
  app.use(authRoutes);

  // Mount public calculator routes with rate limiting
  app.use("/api", calcLimiter, calcRoutes);

  // Mount protected routes (require authentication) - only for /api routes
  app.use("/api", protectedRoutes);

  const httpServer = createServer(app);
  return httpServer;
}