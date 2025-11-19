import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchQuizzes, saveQuiz, updateQuiz, deleteQuiz } from '../store/slices/quizzesSlice';
import { Quiz } from '../services';

/**
 * Custom hook to access quizzes from Redux store
 * Automatically fetches quizzes on first use if not already loaded
 * Replaces the old useQuizzes hook with Redux integration
 */
export const useReduxQuizzes = () => {
  const dispatch = useAppDispatch();
  const { quizzes, selectedQuiz, loading, error, lastFetched } = useAppSelector(
    (state) => state.quizzes
  );

  useEffect(() => {
    // Fetch quizzes if not loaded or if data is stale (older than 5 minutes)
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isStale = lastFetched ? Date.now() - lastFetched > FIVE_MINUTES : true;

    if (quizzes.length === 0 || isStale) {
      dispatch(fetchQuizzes());
    }
  }, [dispatch, quizzes.length, lastFetched]);

  return {
    quizzes,
    selectedQuiz,
    loading,
    error,
    refetch: () => dispatch(fetchQuizzes()),
    saveQuiz: (quiz: Quiz) => dispatch(saveQuiz(quiz)),
    updateQuiz: (quizId: number, updates: Partial<Quiz>) =>
      dispatch(updateQuiz({ quizId, updates })),
    deleteQuiz: (quizId: number) => dispatch(deleteQuiz(quizId)),
  };
};
