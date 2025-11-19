import { useQuery } from '@tanstack/react-query';
import { QuizService } from '../services/domain/QuizService';
import { Quiz } from '../services/domain/QuizService';

export const useQuizzesQuery = () => {
    return useQuery({
        queryKey: ['quizzes'],
        queryFn: async () => {
            const quizzes = await QuizService.getAllQuizzes();
            return quizzes;
        },
    });
};
