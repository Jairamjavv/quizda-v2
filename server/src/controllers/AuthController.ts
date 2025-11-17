/**
 * Auth Controller
 * Handles HTTP request/response for authentication endpoints
 */

import { Context } from "hono";
import type { Env, Variables } from "../types";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies";
import { getSessionFromRequest } from "../utils/session";
import { handleRegister } from "../auth/handlers/register";
import { handleLogin } from "../auth/handlers/login";
import { handleGetMe } from "../auth/handlers/me";
import { handleLogout } from "../auth/handlers/logout";
import { handleRefreshToken } from "../auth/handlers/refresh";

export class AuthController {
  /**
   * POST /api/register
   * Register a new user
   */
  static async register(c: Context<{ Bindings: Env; Variables: Variables }>) {
    return handleRegister(c);
  }

  /**
   * POST /api/login
   * Login existing user
   */
  static async login(c: Context<{ Bindings: Env; Variables: Variables }>) {
    return handleLogin(c);
  }

  /**
   * GET /api/me
   * Get current authenticated user
   */
  static async getMe(c: Context<{ Bindings: Env; Variables: Variables }>) {
    return handleGetMe(c);
  }

  /**
   * POST /api/logout
   * Logout user and clear cookies
   */
  static async logout(c: Context<{ Bindings: Env; Variables: Variables }>) {
    return handleLogout(c);
  }

  /**
   * POST /api/refresh
   * Refresh access token using refresh token
   */
  static async refreshToken(
    c: Context<{ Bindings: Env; Variables: Variables }>
  ) {
    return handleRefreshToken(c);
  }
}
