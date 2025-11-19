/**
 * UserAnswer Repository - Data Access Layer
 *
 * Handles all database operations for user answers.
 */

import { eq, and } from "drizzle-orm";
import { DrizzleD1Database } from "drizzle-orm/d1";
import { userAnswers } from "../db/schema";

export interface CreateUserAnswerData {
  attemptId: number;
  questionIndex: number;
  userAnswer: string; // JSON string
  isCorrect: boolean;
  timeSpent?: number | null;
}

export class UserAnswerRepository {
  constructor(private db: DrizzleD1Database<any>) {}

  /**
   * Create a user answer
   */
  async create(data: CreateUserAnswerData): Promise<void> {
    await this.db.insert(userAnswers).values({
      attemptId: data.attemptId,
      questionIndex: data.questionIndex,
      userAnswer: data.userAnswer,
      isCorrect: data.isCorrect,
      timeSpent: data.timeSpent || null,
    });
  }

  /**
   * Create multiple user answers
   */
  async createMany(answers: CreateUserAnswerData[]): Promise<void> {
    if (answers.length === 0) return;

    for (const answer of answers) {
      await this.create(answer);
    }
  }

  /**
   * Find answers by attempt ID
   */
  async findByAttempt(attemptId: number): Promise<any[]> {
    const results = await this.db
      .select()
      .from(userAnswers)
      .where(eq(userAnswers.attemptId, attemptId))
      .all();

    return results;
  }

  /**
   * Find specific answer by attempt and question index
   */
  async findByAttemptAndQuestion(
    attemptId: number,
    questionIndex: number
  ): Promise<any | null> {
    const result = await this.db
      .select()
      .from(userAnswers)
      .where(
        and(
          eq(userAnswers.attemptId, attemptId),
          eq(userAnswers.questionIndex, questionIndex)
        )
      )
      .get();

    return result || null;
  }
}
