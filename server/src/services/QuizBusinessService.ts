/**
 * Quiz Service - Business Logic Layer (Backend)
 *
 * Handles quiz-related business logic.
 * Orchestrates between repositories and API handlers.
 */

import { QuizRepository } from "../repositories";
import type { QuizDTO, CreateQuizDTO, UpdateQuizDTO } from "../domain/dtos";
import type { Quiz } from "../domain/models";

export class QuizBusinessService {
  constructor(private quizRepo: QuizRepository) {}

  /**
   * Create new quiz
   */
  async createQuiz(data: CreateQuizDTO, creatorId: number): Promise<QuizDTO> {
    // Validate quiz data
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Quiz title is required");
    }

    // Create quiz
    const quiz = await this.quizRepo.create({
      title: data.title,
      description: data.description || null,
      categoryId: data.categoryId || null,
      creatorId,
      difficulty: data.difficulty || "medium",
      timeLimit: data.timeLimit || null,
      totalQuestions: 0,
      isPublished: false,
    });

    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      await this.quizRepo.addTags(quiz.id, data.tags);
    }

    return this.mapToQuizDTO(quiz);
  }

  /**
   * Get quiz by ID
   */
  async getQuizById(id: number): Promise<QuizDTO | null> {
    const quiz = await this.quizRepo.findById(id);
    return quiz ? this.mapToQuizDTO(quiz) : null;
  }

  /**
   * Get all published quizzes
   */
  async getPublishedQuizzes(
    limit: number = 100,
    offset: number = 0
  ): Promise<QuizDTO[]> {
    const quizzes = await this.quizRepo.findPublished(limit, offset);
    return quizzes.map((q) => this.mapToQuizDTO(q));
  }

  /**
   * Get quizzes by creator
   */
  async getQuizzesByCreator(creatorId: number): Promise<QuizDTO[]> {
    const quizzes = await this.quizRepo.findByCreator(creatorId);
    return quizzes.map((q) => this.mapToQuizDTO(q));
  }

  /**
   * Update quiz
   */
  async updateQuiz(
    id: number,
    updates: UpdateQuizDTO,
    userId: number
  ): Promise<QuizDTO> {
    // Get existing quiz
    const quiz = await this.quizRepo.findById(id);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Check permission (only creator can update)
    if (quiz.creatorId !== userId) {
      throw new Error("You do not have permission to update this quiz");
    }

    // Update quiz
    const updated = await this.quizRepo.update(id, updates);
    if (!updated) {
      throw new Error("Failed to update quiz");
    }

    return this.mapToQuizDTO(updated);
  }

  /**
   * Publish quiz
   */
  async publishQuiz(id: number, userId: number): Promise<QuizDTO> {
    const quiz = await this.quizRepo.findById(id);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (quiz.creatorId !== userId) {
      throw new Error("You do not have permission to publish this quiz");
    }

    // Validate quiz has questions
    if (quiz.totalQuestions === 0) {
      throw new Error("Cannot publish quiz without questions");
    }

    const updated = await this.quizRepo.update(id, { isPublished: true });
    if (!updated) {
      throw new Error("Failed to publish quiz");
    }

    return this.mapToQuizDTO(updated);
  }

  /**
   * Delete quiz
   */
  async deleteQuiz(id: number, userId: number): Promise<void> {
    const quiz = await this.quizRepo.findById(id);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    if (quiz.creatorId !== userId) {
      throw new Error("You do not have permission to delete this quiz");
    }

    await this.quizRepo.delete(id);
  }

  /**
   * Map Quiz entity to QuizDTO
   */
  private mapToQuizDTO(quiz: Quiz): QuizDTO {
    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      isPublished: quiz.isPublished,
      timeLimit: quiz.timeLimit || undefined,
      questionsCount: quiz.totalQuestions,
      totalQuestions: quiz.totalQuestions,
      r2Key: quiz.r2Key,
      createdAt: quiz.createdAt.toISOString(),
      updatedAt: quiz.updatedAt.toISOString(),
    };
  }
}
