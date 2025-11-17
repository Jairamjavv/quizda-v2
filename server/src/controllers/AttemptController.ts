/**
 * Attempt Controller
 * Handles HTTP request/response for quiz attempt endpoints
 */

import { Context } from "hono";
import type { Env } from "../types";
import { AttemptRepository } from "../repositories/AttemptRepository";
import { verifyAccessToken } from "../utils/session";

export class AttemptController {
  /**
   * POST /api/attempts
   * Submit a quiz attempt
   */
  static async createAttempt(c: Context<{ Bindings: Env }>) {
    try {
      // Get authenticated user
      const token =
        c.req.header("cookie")?.match(/accessToken=([^;]+)/)?.[1] ||
        c.req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const payload = await verifyAccessToken(token, c.env.JWT_SECRET);
      if (!payload) {
        return c.json({ error: "Invalid token" }, 401);
      }

      const input = await c.req.json();

      // Validate required fields
      if (!input.quizId || typeof input.score !== "number") {
        return c.json({ error: "Quiz ID and score are required" }, 400);
      }

      const attemptRepo = new AttemptRepository(c.env);
      const attempt = await attemptRepo.create({
        userId: payload.userId,
        quizId: input.quizId,
        score: input.score,
        answers: input.answers || {},
        timeSpent: input.timeSpent || 0,
        completedAt: new Date().toISOString(),
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
      const token =
        c.req.header("cookie")?.match(/accessToken=([^;]+)/)?.[1] ||
        c.req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const payload = await verifyAccessToken(token, c.env.JWT_SECRET);
      if (!payload || payload.userId !== userId) {
        return c.json({ error: "Unauthorized" }, 403);
      }

      const attemptRepo = new AttemptRepository(c.env);
      const attempts = await attemptRepo.findByUserId(userId);

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

      const attemptRepo = new AttemptRepository(c.env);
      const attempts = await attemptRepo.findByQuizId(quizId);

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

      const attemptRepo = new AttemptRepository(c.env);
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
