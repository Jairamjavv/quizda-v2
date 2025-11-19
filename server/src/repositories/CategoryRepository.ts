/**
 * Category Repository - Data Access Layer
 */

import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { categories } from "../db/schema";
import type { Category } from "../domain/models";

export class CategoryRepository {
  constructor(private db: DrizzleD1Database<any>) {}

  /**
   * Find all categories
   */
  async findAll(): Promise<Category[]> {
    const results = await this.db.select().from(categories).all();
    return results as Category[];
  }

  /**
   * Find category by ID
   */
  async findById(id: number): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    return result as unknown as Category | null;
  }

  /**
   * Find category by name
   */
  async findByName(name: string): Promise<Category | null> {
    const result = await this.db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .get();

    return result as unknown as Category | null;
  }
}
