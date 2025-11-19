/**
 * Category Routes
 */

import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { CategoryController } from "../controllers/CategoryController";

const categoryRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/categories - Get all categories (public)
categoryRoutes.get("/", (c) => CategoryController.getCategories(c));

export default categoryRoutes;
