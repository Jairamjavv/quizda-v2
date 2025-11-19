/**
 * Attempt Controller
 * Handles HTTP request/response for quiz attempt endpoints
 */

import { Context } from "hono";
import type { Env } from "../types";
import { AttemptRepository } from "../repositories/AttemptRepository";
import { UserAnswerRepository } from "../repositories/UserAnswerRepository";
import { QuizRepository } from "../repositories/QuizRepository";
import { getSessionFromRequest } from "../utils/session";
import { getDb } from "../db";

export class AttemptController {
  /**
   * POST /api/attempts
   * Submit a quiz attempt
   */
  static async createAttempt(c: Context<{ Bindings: Env }>) {
    try {
      // Get authenticated user session
      const session = getSessionFromRequest(c.req.raw);

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const input = await c.req.json();

      // Validate required fields
      if (!input.quizId || typeof input.score !== "number") {
        return c.json({ error: "Quiz ID and score are required" }, 400);
      }

      const db = getDb(c.env);
      const attemptRepo = new AttemptRepository(db);
      const attempt = await attemptRepo.create({
        userId: session.userId,
        quizId: input.quizId,
        totalQuestions: input.totalQuestions || 0,
      });

      return c.json(attempt, 201);
    } catch (error: any) {
      console.error("CreateAttempt error:", error);
      return c.json(
        { error: error.message || "Failed to create attempt" },
        500
      );
    }
  }

  /**
   * GET /api/attempts/user/:userId
   * Get all attempts for a user
   */
  static async getUserAttempts(c: Context<{ Bindings: Env }>) {
    try {
      const userId = parseInt(c.req.param("userId"));

      if (isNaN(userId)) {
        return c.json({ error: "Invalid user ID" }, 400);
      }

      // Verify authentication
      const session = getSessionFromRequest(c.req.raw);

      if (!session || session.userId !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const db = getDb(c.env);
      const attemptRepo = new AttemptRepository(db);
      const attempts = await attemptRepo.findByUser(userId);

      return c.json(attempts);
    } catch (error: any) {
      console.error("GetUserAttempts error:", error);
      return c.json(
        { error: error.message || "Failed to fetch attempts" },
        500
      );
    }
  }

  /**
   * GET /api/attempts/quiz/:quizId
   * Get all attempts for a quiz
   */
  static async getQuizAttempts(c: Context<{ Bindings: Env }>) {
    try {
      const quizId = parseInt(c.req.param("quizId"));

      if (isNaN(quizId)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

      const db = getDb(c.env);
      const attemptRepo = new AttemptRepository(db);
      const attempts = await attemptRepo.findByQuiz(quizId);

      return c.json(attempts);
    } catch (error: any) {
      console.error("GetQuizAttempts error:", error);
      return c.json(
        { error: error.message || "Failed to fetch attempts" },
        500
      );
    }
  }

  /**
   * GET /api/attempts/:id
   * Get attempt by ID
   */
  static async getAttemptById(c: Context<{ Bindings: Env }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid attempt ID" }, 400);
      }

      const db = getDb(c.env);
      const attemptRepo = new AttemptRepository(db);
      const attempt = await attemptRepo.findById(id);

      if (!attempt) {
        return c.json({ error: "Attempt not found" }, 404);
      }

      return c.json(attempt);
    } catch (error: any) {
      console.error("GetAttemptById error:", error);
      return c.json({ error: error.message || "Failed to fetch attempt" }, 500);
    }
  }

  /**
   * PUT /api/attempts/:id/complete
   * Complete a quiz attempt with answers
   */
  static async completeAttempt(c: Context<{ Bindings: Env }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid attempt ID" }, 400);
      }

      // Get authenticated user session
      const session = getSessionFromRequest(c.req.raw);

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const input = await c.req.json();

      // Validate required fields
      if (
        typeof input.score !== "number" ||
        typeof input.correctAnswers !== "number" ||
        !Array.isArray(input.answers)
      ) {
        return c.json(
          {
            error: "Score, correctAnswers, and answers array are required",
          },
          400
        );
      }

      const db = getDb(c.env);
      const attemptRepo = new AttemptRepository(db);
      const userAnswerRepo = new UserAnswerRepository(db);
      const quizRepo = new QuizRepository(db);

      // Get the attempt to verify ownership and get quiz details
      const attempt = await attemptRepo.findById(id);

      if (!attempt) {
        return c.json({ error: "Attempt not found" }, 404);
      }

      if (attempt.userId !== session.userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      if (attempt.status === "completed") {
        return c.json({ error: "Attempt already completed" }, 400);
      }

      // Get quiz to validate time limit
      const quiz = await quizRepo.findById(attempt.quizId);

      if (!quiz) {
        return c.json({ error: "Quiz not found" }, 404);
      }

      // Validate time limit if set
      const timeTaken = input.timeTaken || null;
      if (quiz.timeLimit && timeTaken && timeTaken > quiz.timeLimit) {
        return c.json(
          {
            error: `Time limit exceeded. Quiz limit: ${quiz.timeLimit}s, Time taken: ${timeTaken}s`,
          },
          400
        );
      }

      // Save user answers
      const userAnswers = input.answers.map((answer: any, index: number) => ({
        attemptId: id,
        questionIndex: answer.questionIndex ?? index,
        userAnswer: JSON.stringify(answer.userAnswer),
        isCorrect: answer.isCorrect || false,
        timeSpent: answer.timeSpent || null,
      }));

      await userAnswerRepo.createMany(userAnswers);

      // Complete the attempt
      const completedAttempt = await attemptRepo.complete(
        id,
        input.score,
        input.correctAnswers,
        timeTaken
      );

      if (!completedAttempt) {
        return c.json({ error: "Failed to complete attempt" }, 500);
      }

      return c.json({
        ...completedAttempt,
        answersRecorded: userAnswers.length,
      });
    } catch (error: any) {
      console.error("CompleteAttempt error:", error);
      return c.json(
        { error: error.message || "Failed to complete attempt" },
        500
      );
    }
  }

  /**
   * GET /api/attempts/:id/answers
   * Get user answers for an attempt
   */
  static async getAttemptAnswers(c: Context<{ Bindings: Env }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid attempt ID" }, 400);
      }

      // Get authenticated user session
      const session = getSessionFromRequest(c.req.raw);

      if (!session) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const db = getDb(c.env);
      const attemptRepo = new AttemptRepository(db);
      const userAnswerRepo = new UserAnswerRepository(db);

      // Verify attempt ownership
      const attempt = await attemptRepo.findById(id);

      if (!attempt) {
        return c.json({ error: "Attempt not found" }, 404);
      }

      if (attempt.userId !== session.userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      // Get answers
      const answers = await userAnswerRepo.findByAttempt(id);

      return c.json({ answers });
    } catch (error: any) {
      console.error("GetAttemptAnswers error:", error);
      return c.json({ error: error.message || "Failed to fetch answers" }, 500);
    }
  }
}
