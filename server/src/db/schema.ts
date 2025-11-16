import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Users table
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firebaseUid: text("firebase_uid").unique(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role", { enum: ["admin", "contributor", "attempter"] })
    .notNull()
    .default("attempter"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Categories table
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Tags table
export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Quizzes table
export const quizzes = sqliteTable("quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] })
    .notNull()
    .default("medium"),
  timeLimit: integer("time_limit"), // in seconds
  totalQuestions: integer("total_questions").notNull().default(0),
  isPublished: integer("is_published", { mode: "boolean" })
    .notNull()
    .default(false),
  r2Key: text("r2_key"), // Reference to R2 storage for questions JSON
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Quiz Tags junction table
export const quizTags = sqliteTable("quiz_tags", {
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  tagId: integer("tag_id")
    .notNull()
    .references(() => tags.id, { onDelete: "cascade" }),
});

// Attempts table
export const attempts = sqliteTable("attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id")
    .notNull()
    .references(() => quizzes.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  score: integer("score").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull().default(0),
  timeTaken: integer("time_taken"), // in seconds
  status: text("status", { enum: ["in_progress", "completed", "abandoned"] })
    .notNull()
    .default("in_progress"),
  startedAt: integer("started_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

// User Answers table (for storing individual question responses)
export const userAnswers = sqliteTable("user_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attemptId: integer("attempt_id")
    .notNull()
    .references(() => attempts.id, { onDelete: "cascade" }),
  questionIndex: integer("question_index").notNull(), // Index in the quiz questions array
  userAnswer: text("user_answer").notNull(), // JSON string of user's answer
  isCorrect: integer("is_correct", { mode: "boolean" }).notNull(),
  timeSpent: integer("time_spent"), // in seconds
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

// Type exports for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Tag = typeof tags.$inferSelect;
export type NewTag = typeof tags.$inferInsert;

export type Quiz = typeof quizzes.$inferSelect;
export type NewQuiz = typeof quizzes.$inferInsert;

export type QuizTag = typeof quizTags.$inferSelect;
export type NewQuizTag = typeof quizTags.$inferInsert;

export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;

export type UserAnswer = typeof userAnswers.$inferSelect;
export type NewUserAnswer = typeof userAnswers.$inferInsert;
