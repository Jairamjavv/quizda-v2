/**
 * Auth Controller
 * Handles HTTP request/response for authentication endpoints
 */

import { Context } from "hono";
import type { Env } from "../types";
import { AuthenticationService } from "../services/AuthenticationService";
import { setAuthCookies, clearAuthCookies } from "../utils/cookies";
import {
  validateLoginInput,
  validateRegisterInput,
  type LoginInput,
  type RegisterInput,
} from "../auth/validation";
import { verifyAccessToken } from "../utils/session";

export class AuthController {
  /**
   * POST /api/register
   * Register a new user
   */
  static async register(c: Context<{ Bindings: Env }>) {
    try {
      const input: RegisterInput = await c.req.json();

      // Validate input
      const validation = validateRegisterInput(input);
      if (!validation.isValid) {
        return c.json({ error: validation.error }, 400);
      }

      // Use service to create user
      const result = await AuthenticationService.registerUser(c.env, input);

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 400);
      }

      // Set auth cookies
      setAuthCookies(c, result.data!.accessToken, result.data!.refreshToken);

      return c.json(
        {
          user: result.data!.user,
          message: "Registration successful",
        },
        201
      );
    } catch (error: any) {
      console.error("Register error:", error);
      return c.json({ error: error.message || "Registration failed" }, 500);
    }
  }

  /**
   * POST /api/login
   * Login existing user
   */
  static async login(c: Context<{ Bindings: Env }>) {
    try {
      const input: LoginInput = await c.req.json();

      // Validate input
      const validation = validateLoginInput(input);
      if (!validation.isValid) {
        return c.json({ error: validation.error }, 400);
      }

      // Use service to authenticate
      const result = await AuthenticationService.loginUser(c.env, input);

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 401);
      }

      // Set auth cookies
      setAuthCookies(c, result.data!.accessToken, result.data!.refreshToken);

      return c.json({
        user: result.data!.user,
        message: "Login successful",
      });
    } catch (error: any) {
      console.error("Login error:", error);
      return c.json({ error: error.message || "Login failed" }, 500);
    }
  }

  /**
   * GET /api/me
   * Get current authenticated user
   */
  static async getMe(c: Context<{ Bindings: Env }>) {
    try {
      // Get token from cookie or Authorization header
      const token =
        c.req.header("cookie")?.match(/accessToken=([^;]+)/)?.[1] ||
        c.req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return c.json({ error: "No token provided" }, 401);
      }

      // Verify token
      const payload = await verifyAccessToken(token, c.env.JWT_SECRET);
      if (!payload) {
        return c.json({ error: "Invalid token" }, 401);
      }

      // Get user from service
      const result = await AuthenticationService.getUserById(
        c.env,
        payload.userId
      );

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 404);
      }

      return c.json({ user: result.data });
    } catch (error: any) {
      console.error("GetMe error:", error);
      return c.json({ error: error.message || "Failed to get user" }, 500);
    }
  }

  /**
   * POST /api/logout
   * Logout user and clear cookies
   */
  static async logout(c: Context<{ Bindings: Env }>) {
    try {
      clearAuthCookies(c);
      return c.json({ message: "Logout successful" });
    } catch (error: any) {
      console.error("Logout error:", error);
      return c.json({ error: error.message || "Logout failed" }, 500);
    }
  }

  /**
   * POST /api/refresh
   * Refresh access token using refresh token
   */
  static async refreshToken(c: Context<{ Bindings: Env }>) {
    try {
      const refreshToken = c.req
        .header("cookie")
        ?.match(/refreshToken=([^;]+)/)?.[1];

      if (!refreshToken) {
        return c.json({ error: "No refresh token provided" }, 401);
      }

      // Use service to refresh tokens
      const result = await AuthenticationService.refreshTokens(
        c.env,
        refreshToken
      );

      if (!result.success) {
        clearAuthCookies(c);
        return c.json({ error: result.error }, result.status || 401);
      }

      // Set new auth cookies
      setAuthCookies(c, result.data!.accessToken, result.data!.refreshToken);

      return c.json({
        message: "Token refreshed successfully",
      });
    } catch (error: any) {
      console.error("Refresh token error:", error);
      clearAuthCookies(c);
      return c.json({ error: error.message || "Token refresh failed" }, 500);
    }
  }
}
