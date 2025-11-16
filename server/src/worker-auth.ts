import { Hono } from "hono";
import { getDb, users } from "./db";
import type { Env } from "./types";
import { eq } from "drizzle-orm";

/**
 * Worker-compatible auth routes (no firebase-admin dependency)
 * Uses D1 for storage and Web Crypto API for password hashing
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

// Generate a simple JWT-like token (for demo - use proper JWT library in production)
async function generateToken(userId: number, email: string): Promise<string> {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  return btoa(JSON.stringify(payload));
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

    // Generate token
    const token = await generateToken(result.id, result.email);

    return c.json(
      {
        message: "User registered successfully",
        user: {
          id: result.id,
          email: result.email,
          username: result.username,
          role: result.role,
        },
        token,
      },
      201
    );
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

    // Generate token
    const token = await generateToken(user.id, user.email);

    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed", details: error.message }, 500);
  }
});

workerAuth.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 401);
    }

    const token = authHeader.substring(7);
    const payload = JSON.parse(atob(token));

    // Check expiration
    if (payload.exp < Date.now()) {
      return c.json({ error: "Token expired" }, 401);
    }

    const db = getDb(c.env);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
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
      },
    });
  } catch (error: any) {
    console.error("Auth error:", error);
    return c.json({ error: "Authentication failed" }, 401);
  }
});

export default workerAuth;
