/**
 * Auth Routes
 * Defines authentication-related HTTP endpoints
 */

import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { AuthController } from "../controllers/AuthController";
import { requireAuth } from "../middleware/auth";

const authRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/auth/register - Register new user (public)
authRoutes.post("/register", (c) => AuthController.register(c));

// POST /api/auth/login - Login user (public)
authRoutes.post("/login", (c) => AuthController.login(c));

// GET /api/auth/me - Get current user (requires auth)
authRoutes.get("/me", requireAuth, (c) => AuthController.getMe(c));

// POST /api/auth/logout - Logout user (requires auth)
authRoutes.post("/logout", requireAuth, (c) => AuthController.logout(c));

// POST /api/auth/refresh - Refresh access token (public, uses refresh token)
authRoutes.post("/refresh", (c) => AuthController.refreshToken(c));

export default authRoutes;
