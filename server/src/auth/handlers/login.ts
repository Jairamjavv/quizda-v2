import { Context } from "hono";
import { getDb, users } from "../../db";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../../utils/session";
import { setAuthCookies } from "../../utils/cookies";
import { verifyPassword } from "../crypto";
import { validateLoginInput, type LoginInput } from "../validation";
import type { Env, Variables } from "../../types";

export async function handleLogin(
  c: Context<{ Bindings: Env; Variables: Variables }>
) {
  try {
    const input: LoginInput = await c.req.json();

    // Validate input
    const validation = validateLoginInput(input);
    if (!validation.isValid) {
      return c.json({ error: validation.error }, 400);
    }

    const db = getDb(c.env);
    let user;

    // Support both Firebase UID login and password login
    if (input.firebaseUid) {
      // Login with Firebase UID (preferred)
      user = await db
        .select()
        .from(users)
        .where(eq(users.firebaseUid, input.firebaseUid))
        .get();

      if (!user) {
        return c.json({ error: "User not found" }, 404);
      }
    } else if (input.email && input.password) {
      // Fallback: Login with email/password
      user = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .get();

      if (!user || !user.passwordHash) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      // Verify password
      const isValid = await verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        return c.json({ error: "Invalid credentials" }, 401);
      }
    }

    if (!user) {
      return c.json({ error: "Authentication failed" }, 401);
    }

    // Generate access and refresh tokens
    const accessToken = await generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.firebaseUid || undefined
    );
    const refreshToken = await generateRefreshToken(user.id, user.email);

    // Create response with user data (NO TOKEN in response body for security)
    const response = c.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      // Token is set in HTTP-only cookie, not in response body
    });

    // Set authentication cookies
    const isProduction = c.env.ENVIRONMENT === "production";
    console.log("Setting cookies - isProduction:", isProduction);
    const finalResponse = setAuthCookies(
      response,
      accessToken,
      refreshToken,
      isProduction
    );

    // Debug: Log Set-Cookie headers
    const setCookieHeaders = finalResponse.headers.getSetCookie?.() || [];
    console.log("Set-Cookie headers:", setCookieHeaders);

    return finalResponse;
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: "Login failed", details: error.message }, 500);
  }
}
