/**
 * Quiz Routes
 * Defines quiz-related HTTP endpoints
 */

import { Hono } from "hono";
import type { Env } from "../types";
import { QuizController } from "../controllers/QuizController";

const quizRoutes = new Hono<{ Bindings: Env }>();

// GET /api/quizzes - Get all quizzes (with optional filters)
quizRoutes.get("/", (c) => QuizController.getQuizzes(c));

// GET /api/quizzes/:id - Get quiz by ID
quizRoutes.get("/:id", (c) => QuizController.getQuizById(c));

// POST /api/quizzes - Create new quiz (requires auth)
quizRoutes.post("/", (c) => QuizController.createQuiz(c));

// PUT /api/quizzes/:id - Update quiz (requires auth)
quizRoutes.put("/:id", (c) => QuizController.updateQuiz(c));

// DELETE /api/quizzes/:id - Delete quiz (requires auth)
quizRoutes.delete("/:id", (c) => QuizController.deleteQuiz(c));

export default quizRoutes;
