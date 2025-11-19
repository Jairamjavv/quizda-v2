/**
 * Quiz Routes
 * Defines quiz-related HTTP endpoints
 */

import { Hono } from "hono";
import type { Env, Variables } from "../types";
import { QuizController } from "../controllers/QuizController";
import { requireAuth, requireRole } from "../middleware/auth";

const quizRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/quizzes - Get all quizzes (public, with optional filters)
quizRoutes.get("/", (c) => QuizController.getQuizzes(c));

// GET /api/quizzes/:id - Get quiz by ID (public)
quizRoutes.get("/:id", (c) => QuizController.getQuizById(c));

// GET /api/quizzes/:id/questions - Get quiz questions from R2 (requires authentication)
quizRoutes.get("/:id/questions", requireAuth, (c) =>
  QuizController.getQuizQuestions(c)
);

// POST /api/quizzes - Create new quiz (requires contributor or admin role)
quizRoutes.post("/", requireRole("contributor", "admin"), (c) =>
  QuizController.createQuiz(c)
);

// PUT /api/quizzes/:id - Update quiz (requires contributor or admin role)
quizRoutes.put("/:id", requireRole("contributor", "admin"), (c) =>
  QuizController.updateQuiz(c)
);

// DELETE /api/quizzes/:id - Delete quiz (requires admin role)
quizRoutes.delete("/:id", requireRole("admin"), (c) =>
  QuizController.deleteQuiz(c)
);

export default quizRoutes;
