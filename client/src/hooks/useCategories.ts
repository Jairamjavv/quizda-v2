import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCategories } from '../store/slices/categoriesSlice';

/**
 * Custom hook to access categories from Redux store
 * Automatically fetches categories on first use if not already loaded
 */
export const useCategories = () => {
  const dispatch = useAppDispatch();
  const { categories, categoryNames, loading, error, lastFetched } = useAppSelector(
    (state) => state.categories
  );

  useEffect(() => {
    // Fetch categories if not loaded or if data is stale (older than 5 minutes)
    const FIVE_MINUTES = 5 * 60 * 1000;
    const isStale = lastFetched ? Date.now() - lastFetched > FIVE_MINUTES : true;

    if (categoryNames.length === 0 || isStale) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categoryNames.length, lastFetched]);

  return {
    categories,
    categoryNames,
    loading,
    error,
    refetch: () => dispatch(fetchCategories()),
  };
};
