/**
 * Custom Hook: useAuth
 *
 * Manages authentication state and operations.
 * Integrates with sessionManager for session persistence and multi-tab sync.
 */

import { useState, useEffect, useCallback } from "react";
import { AuthService, User, LoginCredentials, RegisterData } from "../services";
import { sessionManager } from "../services/sessionManager";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to sessionManager for state updates
  useEffect(() => {
    const unsubscribe = sessionManager.subscribe((authState) => {
      setUser(authState.user);
      setLoading(authState.isLoading);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.login(credentials);
      // SessionManager is already updated by LoginForm component
      // This ensures consistency across the app
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.register(data);
      // Update sessionManager with registered user
      sessionManager.setUser(response.user);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // Use sessionManager logout for proper multi-tab sync
      await sessionManager.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth: () => {}, // No longer needed, sessionManager handles this
  };
}
