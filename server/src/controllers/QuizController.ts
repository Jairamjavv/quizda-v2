/**
 * Quiz Controller
 * Handles HTTP request/response for quiz endpoints
 */

import { Context } from "hono";
import type { Env } from "../types";
import { QuizBusinessService } from "../services/QuizBusinessService";
import { verifyAccessToken } from "../utils/session";
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
  static async getQuizzes(c: Context<{ Bindings: Env }>) {
    try {
      const category = c.req.query("category");
      const difficulty = c.req.query("difficulty");
      const userId = c.req.query("userId");

      const result = await QuizBusinessService.getQuizzes(c.env, {
        category,
        difficulty,
        userId: userId ? parseInt(userId) : undefined,
      });

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 500);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error("GetQuizzes error:", error);
      return c.json({ error: error.message || "Failed to fetch quizzes" }, 500);
    }
  }

  /**
   * GET /api/quizzes/:id
   * Get quiz by ID
   */
  static async getQuizById(c: Context<{ Bindings: Env }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

      const result = await QuizBusinessService.getQuizById(c.env, id);

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 404);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error("GetQuizById error:", error);
      return c.json({ error: error.message || "Failed to fetch quiz" }, 500);
    }
  }

  /**
   * POST /api/quizzes
   * Create new quiz (requires authentication)
   */
  static async createQuiz(c: Context<{ Bindings: Env }>) {
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

      // Sanitize and validate input
      if (!input.title || !input.category) {
        return c.json({ error: "Title and category are required" }, 400);
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

      const result = await QuizBusinessService.createQuiz(c.env, {
        ...input,
        title: sanitizedTitle,
        description: sanitizedDescription,
        createdBy: payload.userId,
      });

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 500);
      }

      return c.json(result.data, 201);
    } catch (error: any) {
      console.error("CreateQuiz error:", error);
      return c.json({ error: error.message || "Failed to create quiz" }, 500);
    }
  }

  /**
   * PUT /api/quizzes/:id
   * Update quiz (requires authentication and ownership)
   */
  static async updateQuiz(c: Context<{ Bindings: Env }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

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

      const result = await QuizBusinessService.updateQuiz(
        c.env,
        id,
        input,
        payload.userId
      );

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 500);
      }

      return c.json(result.data);
    } catch (error: any) {
      console.error("UpdateQuiz error:", error);
      return c.json({ error: error.message || "Failed to update quiz" }, 500);
    }
  }

  /**
   * DELETE /api/quizzes/:id
   * Delete quiz (requires authentication and ownership)
   */
  static async deleteQuiz(c: Context<{ Bindings: Env }>) {
    try {
      const id = parseInt(c.req.param("id"));

      if (isNaN(id)) {
        return c.json({ error: "Invalid quiz ID" }, 400);
      }

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

      const result = await QuizBusinessService.deleteQuiz(
        c.env,
        id,
        payload.userId
      );

      if (!result.success) {
        return c.json({ error: result.error }, result.status || 500);
      }

      return c.json({ message: "Quiz deleted successfully" });
    } catch (error: any) {
      console.error("DeleteQuiz error:", error);
      return c.json({ error: error.message || "Failed to delete quiz" }, 500);
    }
  }
}
