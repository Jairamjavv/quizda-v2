/**
 * Authentication Middleware
 * Protects routes by requiring valid authentication
 */

import { Context, Next } from "hono";
import type { Env, Variables } from "../types";
import { getSessionFromRequest } from "../utils/session";

/**
 * Middleware to require authentication
 * Use this on routes that need a valid user session
 */
export async function requireAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const session = getSessionFromRequest(c.req.raw);

  if (!session) {
    return c.json(
      {
        error: "Authentication required",
        message: "Please log in to access this resource",
      },
      401
    );
  }

  // Attach session to context for use in route handlers
  c.set("session", session);

  await next();
}

/**
 * Middleware to require specific role(s)
 * Use this on routes that need specific permissions
 */
export function requireRole(...allowedRoles: string[]) {
  return async (
    c: Context<{ Bindings: Env; Variables: Variables }>,
    next: Next
  ) => {
    const session = getSessionFromRequest(c.req.raw);

    if (!session) {
      return c.json(
        {
          error: "Authentication required",
          message: "Please log in to access this resource",
        },
        401
      );
    }

    if (!allowedRoles.includes(session.role)) {
      return c.json(
        {
          error: "Forbidden",
          message: "You don't have permission to access this resource",
        },
        403
      );
    }

    // Attach session to context
    c.set("session", session);

    await next();
  };
}

/**
 * Optional authentication middleware
 * Attaches session if available but doesn't require it
 */
export async function optionalAuth(
  c: Context<{ Bindings: Env; Variables: Variables }>,
  next: Next
) {
  const session = getSessionFromRequest(c.req.raw);

  if (session) {
    c.set("session", session);
  }

  await next();
}
