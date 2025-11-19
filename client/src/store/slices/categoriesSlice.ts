import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetCategories, CategoryResponse } from '../../services/quizApi';

interface CategoriesState {
  categories: CategoryResponse[];
  categoryNames: string[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: CategoriesState = {
  categories: [],
  categoryNames: [],
  loading: false,
  error: null,
  lastFetched: null,
};

// Async thunk to fetch categories from the API
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const categories = await apiGetCategories();
      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch categories');
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCategoriesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.categoryNames = action.payload.map((cat) => cat.name);
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCategoriesError } = categoriesSlice.actions;
export default categoriesSlice.reducer;
