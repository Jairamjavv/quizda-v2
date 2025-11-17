import { Context } from "hono";
import { getDb, users } from "../../db";
import { eq } from "drizzle-orm";
import { generateAccessToken, verifyRefreshToken } from "../../utils/session";
import { setAuthCookies, getCookie } from "../../utils/cookies";
import type { Env, Variables } from "../../types";

export async function handleRefreshToken(
  c: Context<{ Bindings: Env; Variables: Variables }>
) {
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

    // Create response (NO TOKEN in response body for security)
    const response = c.json({
      message: "Token refreshed successfully",
      // Token is set in HTTP-only cookie, not in response body
    });

    // Update access token cookie (refresh token stays the same)
    const isProduction = c.env.ENVIRONMENT === "production";
    return setAuthCookies(response, newAccessToken, refreshToken, isProduction);
  } catch (error: any) {
    console.error("Token refresh error:", error);
    return c.json({ error: "Token refresh failed" }, 500);
  }
}
