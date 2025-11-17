/**
 * Quiz Repository - Data Access Layer
 *
 * Handles all database operations for quizzes.
 */

import { eq, desc, and } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { quizzes, quizTags } from "../db/schema";
import type { Quiz } from "../domain/models";

export interface CreateQuizData {
  title: string;
  description?: string | null;
  categoryId?: number | null;
  creatorId: number;
  difficulty?: "easy" | "medium" | "hard";
  timeLimit?: number | null;
  totalQuestions?: number;
  isPublished?: boolean;
  r2Key?: string | null;
}

export class QuizRepository {
  constructor(private db: DrizzleD1Database<any>) {}

  /**
   * Find quiz by ID
   */
  async findById(id: number): Promise<Quiz | null> {
    const result = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id))
      .get();

    return result as unknown as Quiz | null;
  }

  /**
   * Find all published quizzes
   */
  async findPublished(
    limit: number = 100,
    offset: number = 0
  ): Promise<Quiz[]> {
    const results = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isPublished, true))
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    return results as Quiz[];
  }

  /**
   * Find quizzes by creator
   */
  async findByCreator(creatorId: number, limit: number = 100): Promise<Quiz[]> {
    const results = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.creatorId, creatorId))
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .all();

    return results as Quiz[];
  }

  /**
   * Find quizzes by category
   */
  async findByCategory(
    categoryId: number,
    limit: number = 100
  ): Promise<Quiz[]> {
    const results = await this.db
      .select()
      .from(quizzes)
      .where(
        and(eq(quizzes.categoryId, categoryId), eq(quizzes.isPublished, true))
      )
      .orderBy(desc(quizzes.createdAt))
      .limit(limit)
      .all();

    return results as Quiz[];
  }

  /**
   * Create new quiz
   */
  async create(data: CreateQuizData): Promise<Quiz> {
    const result = await this.db
      .insert(quizzes)
      .values({
        title: data.title,
        description: data.description || null,
        categoryId: data.categoryId || null,
        creatorId: data.creatorId,
        difficulty: data.difficulty || "medium",
        timeLimit: data.timeLimit || null,
        totalQuestions: data.totalQuestions || 0,
        isPublished: data.isPublished || false,
        r2Key: data.r2Key || null,
      })
      .returning()
      .get();

    return result as unknown as Quiz;
  }

  /**
   * Update quiz
   */
  async update(
    id: number,
    updates: Partial<CreateQuizData>
  ): Promise<Quiz | null> {
    const result = await this.db
      .update(quizzes)
      .set(updates as any)
      .where(eq(quizzes.id, id))
      .returning()
      .get();

    return result as unknown as Quiz | null;
  }
  /**
   * Delete quiz
   */
  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(quizzes)
      .where(eq(quizzes.id, id))
      .returning()
      .get();

    return !!result;
  }

  /**
   * Add tags to quiz
   */
  async addTags(quizId: number, tagIds: number[]): Promise<void> {
    for (const tagId of tagIds) {
      await this.db.insert(quizTags).values({ quizId, tagId }).execute();
    }
  }

  /**
   * Remove all tags from quiz
   */
  async clearTags(quizId: number): Promise<void> {
    await this.db.delete(quizTags).where(eq(quizTags.quizId, quizId)).execute();
  }

  /**
   * Get quiz count by creator
   */
  async countByCreator(creatorId: number): Promise<number> {
    const results = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.creatorId, creatorId))
      .all();

    return results.length;
  }

  /**
   * Get total published quizzes count
   */
  async countPublished(): Promise<number> {
    const results = await this.db
      .select()
      .from(quizzes)
      .where(eq(quizzes.isPublished, true))
      .all();

    return results.length;
  }
}
