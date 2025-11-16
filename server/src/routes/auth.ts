import { Hono } from "hono";
import { getDb, users, Env as DbEnv } from "../db";
import { createFirebaseUser, verifyToken } from "../services/firebase";
import { eq } from "drizzle-orm";

const auth = new Hono<{ Bindings: DbEnv }>();

// Register endpoint
auth.post("/register", async (c) => {
  try {
    const { email, password, username, role } = await c.req.json();

    // Validate input
    if (!email || !password || !username) {
      return c.json(
        { error: "Email, password, and username are required" },
        400
      );
    }

    // Validate role
    const validRoles = ["admin", "contributor", "attempter"];
    const userRole = role && validRoles.includes(role) ? role : "attempter";

    // Create user in Firebase
    const firebaseUser = await createFirebaseUser(email, password, username);

    // Get database instance
    const db = getDb(c.env);

    // Check if user already exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }

    // Create user in database
    const newUser = await db
      .insert(users)
      .values({
        firebaseUid: firebaseUser.uid,
        email,
        username,
        role: userRole,
      })
      .returning()
      .get();

    return c.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          firebaseUid: newUser.firebaseUid,
        },
      },
      201
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return c.json({ error: error.message || "Registration failed" }, 500);
  }
});

// Login endpoint (verify token and return user data)
auth.post("/login", async (c) => {
  try {
    const { idToken } = await c.req.json();

    if (!idToken) {
      return c.json({ error: "ID token is required" }, 400);
    }

    // Verify Firebase token
    const decodedToken = await verifyToken(idToken);

    // Get database instance
    const db = getDb(c.env);

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decodedToken.uid))
      .get();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        firebaseUid: user.firebaseUid,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: error.message || "Login failed" }, 401);
  }
});

// Get current user endpoint (requires valid token)
auth.get("/me", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "No token provided" }, 401);
    }

    const idToken = authHeader.substring(7);

    // Verify Firebase token
    const decodedToken = await verifyToken(idToken);

    // Get database instance
    const db = getDb(c.env);

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, decodedToken.uid))
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
    console.error("Get user error:", error);
    return c.json({ error: error.message || "Failed to get user" }, 401);
  }
});

export default auth;
