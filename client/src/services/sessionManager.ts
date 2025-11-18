/**
 * Client-side Session Management
 * Handles authentication state, token refresh, and session persistence
 *
 * Features:
 * - Multi-tab session synchronization
 * - Automatic token refresh before expiration
 * - Session expiration detection and auto-logout
 * - Login persistence across page loads, tabs, and windows
 */

import { useState, useEffect } from "react";

// Get API base URL with fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://quizda-worker-prod.b-jairam0512.workers.dev";

// Storage keys for cross-tab communication and activity tracking
// NOTE: USER is NOT stored in localStorage for security
// Only session events and activity timestamps are stored
const STORAGE_KEYS = {
  SESSION_EVENT: "quizda_session_event",
  LAST_ACTIVITY: "quizda_last_activity",
} as const;

// Session event types for cross-tab communication
type SessionEventType = "login" | "logout" | "refresh" | "expired";

interface SessionEvent {
  type: SessionEventType;
  timestamp: number;
  user?: User | null;
}

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
  private expirationCheckTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {
    this.setupStorageListener();
    this.initializeSession();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  /**
   * Setup storage event listener for multi-tab synchronization
   */
  private setupStorageListener() {
    if (typeof window === "undefined") return;

    window.addEventListener("storage", (event) => {
      // Only respond to our session events
      if (event.key === STORAGE_KEYS.SESSION_EVENT && event.newValue) {
        try {
          const sessionEvent: SessionEvent = JSON.parse(event.newValue);
          this.handleSessionEvent(sessionEvent);
        } catch (error) {
          console.error("Failed to parse session event:", error);
        }
      }
    });
  }

  /**
   * Handle session events from other tabs
   */
  private handleSessionEvent(event: SessionEvent) {
    console.log(
      `[SessionManager] Received ${event.type} event from another tab`
    );

    switch (event.type) {
      case "login":
        if (event.user) {
          this.setUser(event.user, false); // false = don't broadcast
        }
        break;

      case "logout":
        this.clearUser(false); // false = don't broadcast
        // Redirect to login if not already there
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
        break;

      case "expired":
        this.handleSessionExpired(false); // false = don't broadcast
        break;

      case "refresh":
        // Update last activity timestamp
        this.updateLastActivity();
        break;
    }
  }

  /**
   * Broadcast session event to other tabs
   */
  private broadcastSessionEvent(type: SessionEventType, user?: User | null) {
    if (typeof window === "undefined") return;

    const event: SessionEvent = {
      type,
      timestamp: Date.now(),
      user,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.SESSION_EVENT, JSON.stringify(event));
      // Clear immediately so same event can be sent again
      setTimeout(() => {
        localStorage.removeItem(STORAGE_KEYS.SESSION_EVENT);
      }, 100);
    } catch (error) {
      console.error("Failed to broadcast session event:", error);
    }
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity() {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  }

  /**
   * Initialize session from server
   *
   * SECURITY: No localStorage usage for authentication data
   * All auth state comes from HTTP-only cookies verified by the server
   */
  private async initializeSession() {
    if (this.isInitialized) return;

    try {
      // Verify session with server (cookies sent automatically)
      // No optimistic UI from localStorage - all auth data comes from server
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: "GET",
        credentials: "include", // Include HTTP-only cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setUser(data.user, false); // Don't broadcast on initial load
        this.scheduleTokenRefresh();
        this.startExpirationCheck();
        this.updateLastActivity();
      } else if (response.status === 401) {
        // Session expired or invalid - this is expected when not logged in
        console.log("[SessionManager] No valid session found");
        this.clearUser(false); // Don't broadcast on initial load
      } else {
        console.error(
          `[SessionManager] Session initialization failed with status ${response.status}`
        );
        this.clearUser(false);
      }
    } catch (error) {
      console.error("[SessionManager] Session initialization error:", error);
      this.clearUser(false);
    } finally {
      this.authState.isLoading = false;
      this.isInitialized = true;
      this.notifyListeners();
    }
  }
  /**
   * Set authenticated user
   * @param user - User object
   * @param broadcast - Whether to broadcast to other tabs (default: true)
   */
  setUser(user: User, broadcast = true) {
    this.authState = {
      user,
      isAuthenticated: true,
      isLoading: false,
    };

    // DO NOT store user in localStorage (security best practice)
    // Authentication state is managed via HTTP-only cookies only
    // Only update activity timestamp
    this.updateLastActivity();

    this.notifyListeners();
    this.scheduleTokenRefresh();
    this.startExpirationCheck();

    // Broadcast login event to other tabs (includes user data in event)
    if (broadcast) {
      this.broadcastSessionEvent("login", user);
    }
  }
  /**
   * Clear user session
   * @param broadcast - Whether to broadcast to other tabs (default: true)
   */
  clearUser(broadcast = true) {
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    // Clear activity timestamp only (no user data stored in localStorage)
    try {
      localStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    } catch (error) {
      console.error("Failed to clear activity timestamp:", error);
    }

    // Clear all timers
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
    if (this.expirationCheckTimer) {
      clearInterval(this.expirationCheckTimer);
      this.expirationCheckTimer = null;
    }

    this.notifyListeners();

    // Broadcast logout to other tabs
    if (broadcast) {
      this.broadcastSessionEvent("logout");
    }
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
   * Start periodic expiration check
   */
  private startExpirationCheck() {
    if (this.expirationCheckTimer) {
      clearInterval(this.expirationCheckTimer);
    }

    // Check for inactivity every minute
    this.expirationCheckTimer = setInterval(() => {
      this.checkSessionExpiration();
    }, 60 * 1000); // 1 minute
  }

  /**
   * Check if session has expired due to inactivity
   */
  private checkSessionExpiration() {
    if (!this.authState.isAuthenticated) return;

    try {
      const lastActivityStr = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (!lastActivityStr) return;

      const lastActivity = parseInt(lastActivityStr, 10);
      const now = Date.now();
      const inactiveTime = now - lastActivity;

      // Refresh token expires after 7 days (604800000 ms)
      const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60 * 1000;

      if (inactiveTime > REFRESH_TOKEN_LIFETIME) {
        console.log("[SessionManager] Session expired due to inactivity");
        this.handleSessionExpired();
      }
    } catch (error) {
      console.error("Failed to check session expiration:", error);
    }
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(broadcast = true) {
    console.log("[SessionManager] Session expired, logging out");
    this.clearUser(false); // Don't broadcast logout, broadcast expired instead

    if (broadcast) {
      this.broadcastSessionEvent("expired");
    }

    // Redirect to login if not already there
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register" &&
      window.location.pathname !== "/landing"
    ) {
      window.location.href = "/login?reason=expired";
    }
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
    if (!this.authState.isAuthenticated) {
      console.log("[SessionManager] Not authenticated, skipping token refresh");
      return false;
    }

    try {
      console.log("[SessionManager] Refreshing access token...");
      const response = await fetch(`${API_BASE_URL}/api/refresh`, {
        method: "POST",
        credentials: "include", // Include cookies (refresh token)
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        console.log("[SessionManager] Token refreshed successfully");
        this.updateLastActivity();
        this.scheduleTokenRefresh();
        this.broadcastSessionEvent("refresh");
        return true;
      } else if (response.status === 401) {
        // Refresh token expired or invalid
        console.log("[SessionManager] Refresh token expired");
        this.handleSessionExpired();
        return false;
      } else {
        console.error(
          `[SessionManager] Token refresh failed with status ${response.status}`
        );
        this.handleSessionExpired();
        return false;
      }
    } catch (error) {
      console.error("[SessionManager] Token refresh error:", error);
      // Don't logout on network errors, just log and retry later
      this.scheduleTokenRefresh();
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    console.log("[SessionManager] Logging out...");
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("[SessionManager] Logout error:", error);
    } finally {
      this.clearUser(true); // Broadcast logout to other tabs
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
