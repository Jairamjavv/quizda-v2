/**
 * User Repository - Data Access Layer
 *
 * Handles all database operations for users.
 * Isolated from business logic.
 */

import { eq } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { users } from "../db/schema";
import type { User } from "../domain/models";
import type { CreateUserDTO } from "../domain/dtos";

export class UserRepository {
  constructor(private db: DrizzleD1Database) { }

  /**
   * Find user by ID
   */
  async findById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .get();

    return result as User | null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    return result as User | null;
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .get();

    return result as User | null;
  }

  /**
   * Find user by Firebase UID
   */
  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.firebaseUid, firebaseUid))
      .get();

    return result as User | null;
  }

  /**
   * Create new user
   */
  async create(
    data: CreateUserDTO & { passwordHash?: string | null }
  ): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        firebaseUid: data.firebaseUid || null,
        email: data.email,
        username: data.username,
        role: data.role,
        passwordHash: data.passwordHash || null,
      })
      .returning()
      .get();

    return result as User;
  }

  /**
   * Update user
   */
  async update(id: number, updates: Partial<User>): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning()
      .get();

    return result as User | null;
  }

  /**
   * Delete user
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning()
      .get();

    return !!result;
  }

  /**
   * List all users
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<User[]> {
    const results = await this.db
      .select()
      .from(users)
      .limit(limit)
      .offset(offset)
      .all();

    return results as User[];
  }

  /**
   * Count users by role
   */
  async countByRole(
    role: "admin" | "contributor" | "attempter"
  ): Promise<number> {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.role, role))
      .all();

    return results.length;
  }
}
