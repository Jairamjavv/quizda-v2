/**
 * Custom Hook: useQuizzes
 *
 * Manages quiz data fetching and state.
 * Separates data management from UI components.
 */

import { useState, useEffect, useCallback } from "react";
import { QuizService, Quiz } from "../services";

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await QuizService.getAllQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch quizzes");
      // Fallback to local quizzes
      setQuizzes(QuizService.getContributorQuizzes());
    } finally {
      setLoading(false);
    }
  }, []);

  const saveQuiz = useCallback((quiz: Quiz) => {
    const success = QuizService.saveContributorQuiz(quiz);
    if (success) {
      setQuizzes((prev) => [...prev, quiz]);
    }
    return success;
  }, []);

  const updateQuiz = useCallback((quizId: number, updates: Partial<Quiz>) => {
    const success = QuizService.updateContributorQuiz(quizId, updates);
    if (success) {
      setQuizzes((prev) =>
        prev.map((q) => (q.id === quizId ? { ...q, ...updates } : q))
      );
    }
    return success;
  }, []);

  const deleteQuiz = useCallback((quizId: number) => {
    const success = QuizService.deleteContributorQuiz(quizId);
    if (success) {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
    }
    return success;
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  return {
    quizzes,
    loading,
    error,
    fetchQuizzes,
    saveQuiz,
    updateQuiz,
    deleteQuiz,
  };
}
