/**
 * CSRF Controller
 * Handles CSRF token generation
 */

import { Context } from "hono";
import type { Env } from "../types";
import { generateCSRFToken } from "../utils/security";

export class CSRFController {
  /**
   * GET /api/csrf-token
   * Generate and return a CSRF token
   */
  static async getToken(c: Context<{ Bindings: Env }>) {
    try {
      const csrfToken = await generateCSRFToken();

      // Set CSRF token in cookie
      c.header(
        "Set-Cookie",
        `csrfToken=${csrfToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`
      );

      return c.json({ csrfToken });
    } catch (error: any) {
      console.error("CSRF token generation error:", error);
      return c.json(
        { error: error.message || "Failed to generate CSRF token" },
        500
      );
    }
  }
}
