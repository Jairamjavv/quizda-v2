/**
 * Auth Routes
 * Defines authentication-related HTTP endpoints
 */

import { Hono } from "hono";
import type { Env } from "../types";
import { AuthController } from "../controllers/AuthController";

const authRoutes = new Hono<{ Bindings: Env }>();

// POST /api/auth/register - Register new user
authRoutes.post("/register", (c) => AuthController.register(c));

// POST /api/auth/login - Login user
authRoutes.post("/login", (c) => AuthController.login(c));

// GET /api/auth/me - Get current user
authRoutes.get("/me", (c) => AuthController.getMe(c));

// POST /api/auth/logout - Logout user
authRoutes.post("/logout", (c) => AuthController.logout(c));

// POST /api/auth/refresh - Refresh access token
authRoutes.post("/refresh", (c) => AuthController.refreshToken(c));

export default authRoutes;
