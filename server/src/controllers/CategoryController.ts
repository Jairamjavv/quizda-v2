/**
 * Category Controller
 */

import { Context } from "hono";
import type { Env, Variables } from "../types";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { getDb } from "../db";

export class CategoryController {
  /**
   * GET /api/categories
   * Get all categories
   */
  static async getCategories(
    c: Context<{ Bindings: Env; Variables: Variables }>
  ) {
    try {
      const db = getDb(c.env);
      const categoryRepo = new CategoryRepository(db);

      const categories = await categoryRepo.findAll();

      return c.json(categories);
    } catch (error: any) {
      console.error("GetCategories error:", error);
      return c.json(
        { error: error.message || "Failed to fetch categories" },
        500
      );
    }
  }
}
