/**
 * Client-side Session Management
 * Handles authentication state, token refresh, and session persistence
 */

import { useState, useEffect } from "react";

// Get API base URL with fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://quizda-worker-prod.b-jairam0512.workers.dev";

export interface User {
  id: number;
  email: string;
  username: string;
  role: "admin" | "contributor" | "attempter";
  firebaseUid?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Session manager for handling authentication state
 */
class SessionManager {
  private static instance: SessionManager;
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
  };
  private listeners: Set<(state: AuthState) => void> = new Set();
  private refreshTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSession();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Initialize session from server
   */
  private async initializeSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: "GET",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setUser(data.user);
        this.scheduleTokenRefresh();
      } else {
        // 401 is expected when user is not logged in, don't log as error
        if (response.status !== 401) {
          console.error(
            `Session initialization failed with status ${response.status}`
          );
        }
        this.clearUser();
      }
    } catch (error) {
      // Network errors or other issues
      console.error("Session initialization error:", error);
      this.clearUser();
    } finally {
      this.authState.isLoading = false;
      this.notifyListeners();
    }
  }

  /**
   * Set authenticated user
   */
  setUser(user: User) {
    this.authState = {
      user,
      isAuthenticated: true,
      isLoading: false,
    };
    // Store user in localStorage for quick access (not sensitive data)
    localStorage.setItem("user", JSON.stringify(user));
    this.notifyListeners();
    this.scheduleTokenRefresh();
  }

  /**
   * Clear user session
   */
  clearUser() {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
    localStorage.removeItem("user");
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.notifyListeners();
  }

  /**
   * Get current auth state
   */
  getState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Subscribe to auth state changes
   */
  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.getState());
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  /**
   * Schedule automatic token refresh (13 minutes, before 15-minute expiry)
   */
  private scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh token 2 minutes before expiry (15 min - 2 min = 13 min)
    const refreshInterval = 13 * 60 * 1000; // 13 minutes

    this.refreshTimer = setTimeout(async () => {
      await this.refreshToken();
    }, refreshInterval);
  }

  /**
   * Manually refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies (refresh token)
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("Token refreshed successfully");
        this.scheduleTokenRefresh();
        return true;
      } else {
        console.error("Token refresh failed");
        this.clearUser();
        return false;
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearUser();
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearUser();
    }
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance();

/**
 * React hook for using session state
 */
export function useSession() {
  const [authState, setAuthState] = useState<AuthState>(
    sessionManager.getState()
  );

  useEffect(() => {
    const unsubscribe = sessionManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    refreshToken: () => sessionManager.refreshToken(),
    logout: () => sessionManager.logout(),
  };
}

// For non-React usage
export { sessionManager as default };
