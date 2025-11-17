import { Context } from "hono";
import { getDb, users } from "../../db";
import { eq } from "drizzle-orm";
import { getSessionFromRequest } from "../../utils/session";
import type { Env, Variables } from "../../types";

export async function handleGetMe(
  c: Context<{ Bindings: Env; Variables: Variables }>
) {
  try {
    // Debug: Log headers
    const cookieHeader = c.req.header("Cookie");
    const authHeader = c.req.header("Authorization");
    console.log("GET /me - Cookie header:", cookieHeader);
    console.log("GET /me - Auth header:", authHeader);

    // Get session from request (checks both cookie and Authorization header)
    const session = getSessionFromRequest(c.req.raw);

    if (!session) {
      return c.json(
        {
          error: "No valid session found",
          debug: {
            hasCookie: !!cookieHeader,
            hasAuthHeader: !!authHeader,
          },
        },
        401
      );
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
}
