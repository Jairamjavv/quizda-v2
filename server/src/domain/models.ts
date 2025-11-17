/**
 * Domain Models - Backend
 *
 * Core domain entities representing business concepts.
 * Independent of database schema and API contracts.
 */

export interface User {
  id: number;
  firebaseUid: string | null;
  email: string;
  username: string;
  role: "admin" | "contributor" | "attempter";
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  categoryId: number | null;
  creatorId: number;
  difficulty: "easy" | "medium" | "hard";
  isPublished: boolean;
  timeLimit: number | null;
  totalQuestions: number;
  r2Key: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: number;
  quizId: number;
  type: string;
  questionText: string;
  options: any;
  correctAnswer: any;
  points: number;
  explanation: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attempt {
  id: number;
  quizId: number;
  userId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number | null;
  status: "in_progress" | "completed" | "abandoned";
  startedAt: Date;
  completedAt: Date | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: Date;
}

export interface QuizTag {
  quizId: number;
  tagId: number;
  createdAt: Date;
}
