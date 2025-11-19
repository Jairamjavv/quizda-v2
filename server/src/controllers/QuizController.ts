/**
 * Quiz Controller
 * Handles HTTP request/response for quiz endpoints
 */

import { Context } from "hono";
import type { Env, Variables } from "../types";
import { QuizBusinessService } from "../services/QuizBusinessService";
import { QuizRepository } from "../repositories";
import { getSessionFromRequest } from "../utils/session";
import { getDb } from "../db";
import { R2Service } from "../services/R2Service";
import {
  sanitizeQuizTitle,
  sanitizeQuizDescription,
  validateInteger,
} from "../utils/security";

export class QuizController {
  /**
   * GET /api/quizzes
   * Get all quizzes (with optional filters)
   */
  static async getQuizzes(c: Context<{ Bindings: Env; Variables: Variables }>) {
    try {
      const db = getDb(c.env);
      const quizRepo = new QuizRepository(db);
      const quizService = new QuizBusinessService(quizRepo);

      const category = c.req.query("category");
      const difficulty = c.req.query("difficulty");

      // For now, just get quiz by ID since getAll might not exist
      // TODO: Implement proper quiz listing with filters
      const quizzes: any[] = [];

      return c.json(quizzes);
    } catch (error: any) {
      console.error("GetQuizzes error:", error);
      return c.json({ error: error.message || "Failed to fetch quizzes" }, 500);
    }
  }

  /**
   * GET /api/quizzes/:id
   * Get quiz by ID
   */
  static async getQuizById(
    c: Context<{ Bindings: Env; Variables: Variables }>
  ) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

      const db = getDb(c.env);
      const quizRepo = new QuizRepository(db);
      const quizService = new QuizBusinessService(quizRepo);

      const quiz = await quizService.getQuizById(id);

      if (!quiz) {
        return c.json({ error: "Quiz not found" }, 404);
      }

      return c.json(quiz);
    } catch (error: any) {
      console.error("GetQuizById error:", error);
      return c.json({ error: error.message || "Failed to fetch quiz" }, 500);
    }
  }

  /**
   * GET /api/quizzes/:id/questions
   * Get quiz questions from R2 storage
   */
  static async getQuizQuestions(
    c: Context<{ Bindings: Env; Variables: Variables }>
  ) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

      const db = getDb(c.env);
      const quizRepo = new QuizRepository(db);
      const quizService = new QuizBusinessService(quizRepo);
      const r2Service = new R2Service(c.env.MY_BUCKET);

      // Get quiz to get R2 key
      const quiz = await quizService.getQuizById(id);

      if (!quiz) {
        return c.json({ error: "Quiz not found" }, 404);
      }

      if (!quiz.r2Key) {
        return c.json({ error: "Quiz has no questions" }, 404);
      }

      // Fetch questions from R2
      const questions = await r2Service.getQuizQuestions(quiz.r2Key);

      return c.json({ questions });
    } catch (error: any) {
      console.error("GetQuizQuestions error:", error);
      return c.json(
        { error: error.message || "Failed to fetch quiz questions" },
        500
      );
    }
  }

  /**
   * POST /api/quizzes
   * Create new quiz (requires authentication)
   */
  static async createQuiz(c: Context<{ Bindings: Env; Variables: Variables }>) {
    try {
      // Get authenticated user session
      const session = getSessionFromRequest(c.req.raw);

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const input = await c.req.json();

      // Sanitize and validate input
      if (!input.title) {
        return c.json({ error: "Title is required" }, 400);
      }

      const sanitizedTitle = sanitizeQuizTitle(input.title);
      const sanitizedDescription = input.description
        ? sanitizeQuizDescription(input.description)
        : undefined;

      if (!sanitizedTitle || sanitizedTitle.length < 3) {
        return c.json(
          { error: "Title must be at least 3 characters long" },
          400
        );
      }

      const db = getDb(c.env);
      const quizRepo = new QuizRepository(db);
      const quizService = new QuizBusinessService(quizRepo);
      const r2Service = new R2Service(c.env.MY_BUCKET);

      // Create quiz first to get ID
      const quiz = await quizService.createQuiz(
        {
          title: sanitizedTitle,
          description: sanitizedDescription,
          categoryId: input.categoryId,
          difficulty: input.difficulty,
          timeLimit: input.timeLimit,
          tags: input.tags,
        },
        session.userId
      );

      // If questions are provided, upload to R2
      if (
        input.questions &&
        Array.isArray(input.questions) &&
        input.questions.length > 0
      ) {
        const r2Key = await r2Service.uploadQuizQuestions(
          quiz.id,
          input.questions
        );

        // Update quiz with R2 key and question count
        await quizService.updateQuiz(
          quiz.id,
          {
            r2Key,
            totalQuestions: input.questions.length,
          },
          session.userId
        );

        return c.json(
          { ...quiz, r2Key, totalQuestions: input.questions.length },
          201
        );
      }

      return c.json(quiz, 201);
    } catch (error: any) {
      console.error("CreateQuiz error:", error);
      return c.json({ error: error.message || "Failed to create quiz" }, 500);
    }
  }

  /**
   * PUT /api/quizzes/:id
   * Update quiz (requires authentication and ownership)
   */
  static async updateQuiz(c: Context<{ Bindings: Env; Variables: Variables }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

      // Get authenticated user session
      const session = getSessionFromRequest(c.req.raw);

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const input = await c.req.json();

      const db = getDb(c.env);
      const quizRepo = new QuizRepository(db);
      const quizService = new QuizBusinessService(quizRepo);

      const quiz = await quizService.updateQuiz(id, input, session.userId);

      return c.json(quiz);
    } catch (error: any) {
      console.error("UpdateQuiz error:", error);
      return c.json({ error: error.message || "Failed to update quiz" }, 500);
    }
  }

  /**
   * DELETE /api/quizzes/:id
   * Delete quiz (requires authentication and ownership)
   */
  static async deleteQuiz(c: Context<{ Bindings: Env; Variables: Variables }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

      // Get authenticated user session
      const session = getSessionFromRequest(c.req.raw);

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const db = getDb(c.env);
      const quizRepo = new QuizRepository(db);
      const quizService = new QuizBusinessService(quizRepo);

      await quizService.deleteQuiz(id, session.userId);

      return c.json({ message: "Quiz deleted successfully" });
    } catch (error: any) {
      console.error("DeleteQuiz error:", error);
      return c.json({ error: error.message || "Failed to delete quiz" }, 500);
    }
  }
}
