import { Router } from "express";
import passport from "../auth";

const router = Router();

// Get current user
router.get("/me", (req, res) => {
  if (req.isAuthenticated() && req.user) {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture,
    });
  } else {
    res.json(null);
  }
});

// Google OAuth routes
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { 
    failureRedirect: "/?auth=failed" 
  }),
  (req, res) => {
    // Successful authentication
    // Check if we need to import guest data
    res.redirect("/?auth=success&import=check");
  }
);

// Logout
router.post("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

export default router;
