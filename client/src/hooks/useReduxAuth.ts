import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, register, logout, getCurrentUser, refreshAuth } from '../store/slices/authSlice';
import { LoginCredentials, RegisterData } from '../services';

/**
 * Custom hook to access auth state from Redux store
 * Automatically syncs with sessionManager
 * Replaces the old useAuth hook with Redux integration
 */
export const useReduxAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state on mount
    if (!user && !loading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, user, loading]);

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: (credentials: LoginCredentials) => dispatch(login(credentials)),
    register: (data: RegisterData) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    refreshAuth: () => dispatch(refreshAuth()),
    getCurrentUser: () => dispatch(getCurrentUser()),
  };
};
