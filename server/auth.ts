import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User } from "@shared/schema";

// Serialize/Deserialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    done(null, user || null);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user exists
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.googleId, profile.id));

        if (existingUser) {
          // Update user info
          const [updatedUser] = await db
            .update(users)
            .set({
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              updatedAt: new Date(),
            })
            .where(eq(users.id, existingUser.id))
            .returning();
          
          return done(null, updatedUser);
        }

        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            googleId: profile.id,
            email: profile.emails![0].value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          })
          .returning();

        done(null, newUser);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
