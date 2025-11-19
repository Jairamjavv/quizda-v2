/**
 * Attempt Routes
 * Defines quiz attempt-related HTTP endpoints
 */

import { Hono } from "hono";
import type { Env } from "../types";
import { AttemptController } from "../controllers/AttemptController";

const attemptRoutes = new Hono<{ Bindings: Env }>();

// POST /api/attempts - Submit quiz attempt
attemptRoutes.post("/", (c) => AttemptController.createAttempt(c));

// PUT /api/attempts/:id/complete - Complete a quiz attempt
attemptRoutes.put("/:id/complete", (c) => AttemptController.completeAttempt(c));

// GET /api/attempts/:id/answers - Get user answers for an attempt
attemptRoutes.get("/:id/answers", (c) =>
  AttemptController.getAttemptAnswers(c)
);

// GET /api/attempts/user/:userId - Get user's attempts
attemptRoutes.get("/user/:userId", (c) => AttemptController.getUserAttempts(c));

// GET /api/attempts/quiz/:quizId - Get quiz attempts
attemptRoutes.get("/quiz/:quizId", (c) => AttemptController.getQuizAttempts(c));

// GET /api/attempts/:id - Get attempt by ID
attemptRoutes.get("/:id", (c) => AttemptController.getAttemptById(c));

export default attemptRoutes;
