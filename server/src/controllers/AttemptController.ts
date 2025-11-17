/**
 * Attempt Controller
 * Handles HTTP request/response for quiz attempt endpoints
 */

import { Context } from "hono";
import type { Env } from "../types";
import { AttemptRepository } from "../repositories/AttemptRepository";
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
}
