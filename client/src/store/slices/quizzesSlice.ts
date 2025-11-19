import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { QuizService, Quiz } from '../../services';

interface QuizzesState {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: QuizzesState = {
  quizzes: [],
  selectedQuiz: null,
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunks
export const fetchQuizzes = createAsyncThunk(
  'quizzes/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const data = await QuizService.getAllQuizzes();
      return data;
    } catch (error: any) {
      // Fallback to local quizzes
      const fallbackQuizzes = QuizService.getContributorQuizzes();
      if (fallbackQuizzes.length > 0) {
        return fallbackQuizzes;
      }
      return rejectWithValue(error.message || 'Failed to fetch quizzes');
    }
  }
);

export const saveQuiz = createAsyncThunk(
  'quizzes/saveQuiz',
  async (quiz: Quiz, { rejectWithValue }) => {
    try {
      const success = QuizService.saveContributorQuiz(quiz);
      if (success) {
        return quiz;
      }
      return rejectWithValue('Failed to save quiz');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save quiz');
    }
  }
);

export const updateQuiz = createAsyncThunk(
  'quizzes/updateQuiz',
  async ({ quizId, updates }: { quizId: number; updates: Partial<Quiz> }, { rejectWithValue }) => {
    try {
      const success = QuizService.updateContributorQuiz(quizId, updates);
      if (success) {
        return { quizId, updates };
      }
      return rejectWithValue('Failed to update quiz');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update quiz');
    }
  }
);

export const deleteQuiz = createAsyncThunk(
  'quizzes/deleteQuiz',
  async (quizId: number, { rejectWithValue }) => {
    try {
      const success = QuizService.deleteContributorQuiz(quizId);
      if (success) {
        return quizId;
      }
      return rejectWithValue('Failed to delete quiz');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete quiz');
    }
  }
);

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    setSelectedQuiz: (state, action) => {
      state.selectedQuiz = action.payload;
    },
    clearSelectedQuiz: (state) => {
      state.selectedQuiz = null;
    },
    clearQuizzesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch quizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Save quiz
      .addCase(saveQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes.push(action.payload);
        state.error = null;
      })
      .addCase(saveQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update quiz
      .addCase(updateQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.loading = false;
        const { quizId, updates } = action.payload;
        state.quizzes = state.quizzes.map((q) => (q.id === quizId ? { ...q, ...updates } : q));
        if (state.selectedQuiz?.id === quizId) {
          state.selectedQuiz = { ...state.selectedQuiz, ...updates };
        }
        state.error = null;
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete quiz
      .addCase(deleteQuiz.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
        if (state.selectedQuiz?.id === action.payload) {
          state.selectedQuiz = null;
        }
        state.error = null;
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedQuiz, clearSelectedQuiz, clearQuizzesError } = quizzesSlice.actions;
export default quizzesSlice.reducer;
