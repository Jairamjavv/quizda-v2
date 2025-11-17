/**
 * CSRF Routes
 * Defines CSRF token endpoints
 */

import { Hono } from "hono";
import type { Env } from "../types";
import { CSRFController } from "../controllers/CSRFController";

const csrfRoutes = new Hono<{ Bindings: Env }>();

// GET /api/csrf/token - Get CSRF token
csrfRoutes.get("/token", (c) => CSRFController.getToken(c));

export default csrfRoutes;
