/**
 * Authentication Service - Business Logic Layer
 *
 * Handles user authentication operations and session management.
 */

import { apiClient } from "../api";
import { LocalStorageService } from "../storage/LocalStorageService";

export interface User {
  id: number;
  email: string;
  username: string;
  role: "admin" | "contributor" | "attempter";
  firebaseUid?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  firebaseToken?: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  role: "admin" | "contributor" | "attempter";
  firebaseUid?: string;
}

const STORAGE_KEYS = {
  USER: "user",
  AUTH_TOKEN: "authToken",
};

export class AuthService {
  /**
   * Login user
   *
   * SECURITY: Tokens stored in HTTP-only cookies only
   * No localStorage usage for authentication data
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User }> {
    try {
      const response = await apiClient.post("/api/login", credentials);

      // Tokens are in HTTP-only cookies, no manual storage needed
      // Do NOT store user in localStorage for security

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  /**
   * Register new user
   *
   * SECURITY: Tokens stored in HTTP-only cookies only
   * No localStorage usage for authentication data
   */
  static async register(data: RegisterData): Promise<{ user: User }> {
    try {
      const response = await apiClient.post("/api/register", data);

      // Tokens are in HTTP-only cookies, no manual storage needed
      // Do NOT store user in localStorage for security

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  }

  /**
   * Logout user
   *
   * SECURITY: Clears HTTP-only cookies on backend
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/api/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    // No localStorage cleanup needed - no auth data stored locally
  }

  /**
   * Get current user from session
   *
   * SECURITY: Validates session via HTTP-only cookies
   * No localStorage usage
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get("/api/me");
      if (response.data.user) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   *
   * NOTE: This is a client-side check only
   * Real authentication is verified via HTTP-only cookies on the server
   * Use sessionManager.isAuthenticated for accurate state
   */
  static isAuthenticated(): boolean {
    // This method is deprecated - use sessionManager instead
    // Cannot determine auth state without calling /api/me
    console.warn(
      "AuthService.isAuthenticated() is deprecated. Use sessionManager.getState().isAuthenticated instead."
    );
    return false;
  }
}
