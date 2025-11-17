/**
 * Quiz Service - Business Logic Layer
 *
 * Handles all quiz-related business operations.
 * Orchestrates between API calls and local storage.
 */

import { apiGetQuizzes } from "../quizApi";
import { LocalStorageService } from "../storage/LocalStorageService";

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  questions?: any[];
  questionsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuizAttempt {
  quizId: number;
  score: number;
  date: string;
  answers: any[];
}

const STORAGE_KEYS = {
  CONTRIBUTOR_QUIZZES: "contributor_quizzes",
  QUIZ_ATTEMPTS: "quiz_attempts",
  RECENT_QUIZZES: "recent_quizzes",
};

export class QuizService {
  /**
   * Fetch quizzes from API
   */
  static async fetchQuizzes(): Promise<Quiz[]> {
    try {
      const data = await apiGetQuizzes();
      return data as Quiz[];
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      throw error;
    }
  }

  /**
   * Get contributor quizzes from local storage
   */
  static getContributorQuizzes(): Quiz[] {
    return LocalStorageService.getItem<Quiz[]>(
      STORAGE_KEYS.CONTRIBUTOR_QUIZZES,
      []
    );
  }

  /**
   * Save contributor quiz
   */
  static saveContributorQuiz(quiz: Quiz): boolean {
    const quizzes = this.getContributorQuizzes();
    const updatedQuizzes = [...quizzes, quiz];
    return LocalStorageService.setItem(
      STORAGE_KEYS.CONTRIBUTOR_QUIZZES,
      updatedQuizzes
    );
  }

  /**
   * Update contributor quiz
   */
  static updateContributorQuiz(
    quizId: number,
    updates: Partial<Quiz>
  ): boolean {
    const quizzes = this.getContributorQuizzes();
    const index = quizzes.findIndex((q) => q.id === quizId);

    if (index === -1) return false;

    quizzes[index] = { ...quizzes[index], ...updates };
    return LocalStorageService.setItem(
      STORAGE_KEYS.CONTRIBUTOR_QUIZZES,
      quizzes
    );
  }

  /**
   * Delete contributor quiz
   */
  static deleteContributorQuiz(quizId: number): boolean {
    const quizzes = this.getContributorQuizzes();
    const filtered = quizzes.filter((q) => q.id !== quizId);
    return LocalStorageService.setItem(
      STORAGE_KEYS.CONTRIBUTOR_QUIZZES,
      filtered
    );
  }

  /**
   * Get all quizzes (API + local)
   */
  static async getAllQuizzes(): Promise<Quiz[]> {
    try {
      const apiQuizzes = await this.fetchQuizzes();
      const localQuizzes = this.getContributorQuizzes();

      // Merge and deduplicate
      const allQuizzes = [...apiQuizzes, ...localQuizzes];
      const uniqueQuizzes = allQuizzes.reduce((acc, quiz) => {
        if (!acc.find((q) => q.id === quiz.id)) {
          acc.push(quiz);
        }
        return acc;
      }, [] as Quiz[]);

      return uniqueQuizzes;
    } catch (error) {
      // Fallback to local quizzes if API fails
      return this.getContributorQuizzes();
    }
  }

  /**
   * Record quiz attempt
   */
  static recordAttempt(attempt: QuizAttempt): boolean {
    const attempts = LocalStorageService.getItem<QuizAttempt[]>(
      STORAGE_KEYS.QUIZ_ATTEMPTS,
      []
    );
    const updatedAttempts = [...attempts, attempt];
    return LocalStorageService.setItem(
      STORAGE_KEYS.QUIZ_ATTEMPTS,
      updatedAttempts
    );
  }

  /**
   * Get quiz attempts
   */
  static getAttempts(): QuizAttempt[] {
    return LocalStorageService.getItem<QuizAttempt[]>(
      STORAGE_KEYS.QUIZ_ATTEMPTS,
      []
    );
  }

  /**
   * Get attempts for specific quiz
   */
  static getQuizAttempts(quizId: number): QuizAttempt[] {
    const attempts = this.getAttempts();
    return attempts.filter((a) => a.quizId === quizId);
  }
}
