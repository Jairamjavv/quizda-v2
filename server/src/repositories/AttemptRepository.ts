/**
 * Attempt Repository - Data Access Layer
 *
 * Handles all database operations for quiz attempts.
 */

import { eq, and, desc } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { attempts } from "../db/schema";
import type { Attempt } from "../domain/models";

export interface CreateAttemptData {
  quizId: number;
  userId: number;
  totalQuestions: number;
}

export class AttemptRepository {
  constructor(private db: DrizzleD1Database) {}

  /**
   * Find attempt by ID
   */
  async findById(id: number): Promise<Attempt | null> {
    const result = await this.db
      .select()
      .from(attempts)
      .where(eq(attempts.id, id))
      .get();

    return result as Attempt | null;
  }

  /**
   * Find attempts by user
   */
  async findByUser(userId: number, limit: number = 100): Promise<Attempt[]> {
    const results = await this.db
      .select()
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.startedAt))
      .limit(limit)
      .all();

    return results as Attempt[];
  }

  /**
   * Find attempts by quiz
   */
  async findByQuiz(quizId: number, limit: number = 100): Promise<Attempt[]> {
    const results = await this.db
      .select()
      .from(attempts)
      .where(eq(attempts.quizId, quizId))
      .orderBy(desc(attempts.startedAt))
      .limit(limit)
      .all();

    return results as Attempt[];
  }

  /**
   * Find attempts by user and quiz
   */
  async findByUserAndQuiz(userId: number, quizId: number): Promise<Attempt[]> {
    const results = await this.db
      .select()
      .from(attempts)
      .where(and(eq(attempts.userId, userId), eq(attempts.quizId, quizId)))
      .orderBy(desc(attempts.startedAt))
      .all();

    return results as Attempt[];
  }

  /**
   * Create new attempt
   */
  async create(data: CreateAttemptData): Promise<Attempt> {
    const result = await this.db
      .insert(attempts)
      .values({
        quizId: data.quizId,
        userId: data.userId,
        totalQuestions: data.totalQuestions,
        score: 0,
        correctAnswers: 0,
        status: "in_progress",
      })
      .returning()
      .get();

    return result as unknown as Attempt;
  }

  /**
   * Update attempt
   */
  async update(id: number, updates: Partial<Attempt>): Promise<Attempt | null> {
    const result = await this.db
      .update(attempts)
      .set(updates)
      .where(eq(attempts.id, id))
      .returning()
      .get();

    return result as Attempt | null;
  }

  /**
   * Complete attempt
   */
  async complete(
    id: number,
    score: number,
    correctAnswers: number,
    timeTaken: number | null
  ): Promise<Attempt | null> {
    const result = await this.db
      .update(attempts)
      .set({
        score,
        correctAnswers,
        timeTaken,
        status: "completed",
        completedAt: new Date(),
      })
      .where(eq(attempts.id, id))
      .returning()
      .get();

    return result as Attempt | null;
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: number): Promise<{
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    totalTimeSpent: number;
  }> {
    const userAttempts = await this.findByUser(userId, 1000);
    const completed = userAttempts.filter((a) => a.status === "completed");

    const totalAttempts = completed.length;
    const scores = completed.map((a) => a.score);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const totalTimeSpent = completed.reduce(
      (sum, a) => sum + (a.timeTaken || 0),
      0
    );

    return {
      totalAttempts,
      averageScore,
      bestScore,
      totalTimeSpent,
    };
  }

  /**
   * Get quiz statistics
   */
  async getQuizStats(quizId: number): Promise<{
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
  }> {
    const quizAttempts = await this.findByQuiz(quizId, 1000);
    const completed = quizAttempts.filter((a) => a.status === "completed");

    const totalAttempts = quizAttempts.length;
    const scores = completed.map((a) => a.score);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length)
        : 0;
    const completionRate =
      totalAttempts > 0
        ? Math.round((completed.length / totalAttempts) * 100)
        : 0;

    return {
      totalAttempts,
      averageScore,
      completionRate,
    };
  }
}
