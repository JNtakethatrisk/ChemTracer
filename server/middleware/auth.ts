import { Request, Response, NextFunction } from "express";
import type { User } from "@shared/schema";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User extends Omit<import("@shared/schema").User, "createdAt" | "updatedAt"> {
      id: string;
      createdAt: Date | null;
      updatedAt: Date | null;
    }
  }
}

// Middleware to require authentication
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Login required to save/view data" });
}

// Middleware to optionally load user (for guest/auth mixed routes)
export function loadUser(req: Request, res: Response, next: NextFunction) {
  // User is already loaded by passport if authenticated
  next();
}
