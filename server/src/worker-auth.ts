import { Hono } from "hono";
import { getDb, users } from "./db";
import type { Env } from "./types";
import { eq } from "drizzle-orm";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getSessionFromRequest,
} from "./utils/session";
import { setAuthCookies, clearAuthCookies, getCookie } from "./utils/cookies";

/**
 * Worker-compatible auth routes with session management
 * Uses D1 for storage, Web Crypto API for password hashing,
 * and HTTP-only cookies for secure session management
 */
const workerAuth = new Hono<{ Bindings: Env }>();

// Simple password hashing using Web Crypto API (available in Workers)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

workerAuth.post("/register", async (c) => {
  try {
    const { email, password, username, role, firebaseUid } = await c.req.json();

    // Validate input
    if (!email || !username || !firebaseUid) {
      return c.json(
        { error: "Email, username, and firebaseUid are required" },
        400
      );
    }

    // Validate role
    const validRoles = ["admin", "contributor", "attempter"];
    const userRole = role && validRoles.includes(role) ? role : "attempter";

    // Get database instance
    const db = getDb(c.env);

    // Check if user already exists by email or firebaseUid
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Hash password (optional backup auth)
    const passwordHash = password ? await hashPassword(password) : null;

    // Create user in database with Firebase UID
    const result = await db
      .insert(users)
      .values({
        firebaseUid,
        email,
        username,
        role: userRole,
        passwordHash,
      })
      .returning()
      .get();

    if (!result) {
      return c.json({ error: "Failed to create user" }, 500);
    }

    // Generate access and refresh tokens
    const accessToken = await generateAccessToken(
      result.id,
      result.email,
      result.role,
      result.firebaseUid || undefined
    );
    const refreshToken = await generateRefreshToken(result.id, result.email);

    // Create response with user data
    const response = c.json(
      {
        message: "User registered successfully",
        user: {
          id: result.id,
          email: result.email,
          username: result.username,
          role: result.role,
        },
        token: accessToken, // For backward compatibility
      },
      201
    );

    // Set authentication cookies
    const isProduction = c.env.ENVIRONMENT === "production";
    return setAuthCookies(response, accessToken, refreshToken, isProduction);
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json(
      { error: "Registration failed", details: error.message },
      500
    );
  }
});

workerAuth.post("/login", async (c) => {
  try {
    const { email, password, firebaseUid } = await c.req.json();

    const db = getDb(c.env);
    let user;

    // Support both Firebase UID login and password login
    if (firebaseUid) {
      // Login with Firebase UID (preferred)
      user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, firebaseUid))
        .get();

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
    } else if (email && password) {
      // Fallback: Login with email/password
      user = await db.select().from(users).where(eq(users.email, email)).get();

      if (!user || !user.passwordHash) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      // Verify password
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return c.json({ error: "Invalid credentials" }, 401);
      }
    } else {
      return c.json(
        { error: "Email and password or firebaseUid required" },
        400
      );
    }

    // Generate access and refresh tokens
    const accessToken = await generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.firebaseUid || undefined
    );
    const refreshToken = await generateRefreshToken(user.id, user.email);

    // Create response with user data
    const response = c.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token: accessToken, // For backward compatibility
    });

    // Set authentication cookies
    const isProduction = c.env.ENVIRONMENT === "production";
    return setAuthCookies(response, accessToken, refreshToken, isProduction);
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed", details: error.message }, 500);
  }
});

workerAuth.get("/me", async (c) => {
  try {
    // Get session from request (checks both cookie and Authorization header)
    const session = getSessionFromRequest(c.req.raw);

    if (!session) {
      return c.json({ error: "No valid session found" }, 401);
    }

    const db = getDb(c.env);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .get();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
});

// Logout endpoint - clears authentication cookies
workerAuth.post("/logout", async (c) => {
  try {
    const response = c.json({ message: "Logged out successfully" });
    return clearAuthCookies(response);
  } catch (error: any) {
    console.error("Logout error:", error);
    return c.json({ error: "Logout failed" }, 500);
  }
});

// Refresh token endpoint - generates new access token using refresh token
workerAuth.post("/refresh", async (c) => {
  try {
    // Get refresh token from cookie
    const refreshToken = getCookie(c.req.raw, "refresh_token");

    if (!refreshToken) {
      return c.json({ error: "No refresh token provided" }, 401);
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return c.json({ error: "Invalid or expired refresh token" }, 401);
    }

    // Get user from database to ensure they still exist
    const db = getDb(c.env);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .get();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Generate new access token (keep same refresh token)
    const newAccessToken = await generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.firebaseUid || undefined
    );

    // Create response
    const response = c.json({
      message: "Token refreshed successfully",
      token: newAccessToken, // For backward compatibility
    });

    // Update access token cookie (refresh token stays the same)
    const isProduction = c.env.ENVIRONMENT === "production";
    return setAuthCookies(response, newAccessToken, refreshToken, isProduction);
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return c.json({ error: "Token refresh failed" }, 500);
  }
});

export default workerAuth;
