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
   */
  static async login(credentials: LoginCredentials): Promise<{ user: User }> {
    try {
      const response = await apiClient.post("/api/login", credentials);

      if (response.data.user) {
        this.setUser(response.data.user);
        // Token is in HTTP-only cookie, no need to store it
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  /**
   * Register new user
   */
  static async register(data: RegisterData): Promise<{ user: User }> {
    try {
      const response = await apiClient.post("/api/register", data);

      if (response.data.user) {
        this.setUser(response.data.user);
        // Token is in HTTP-only cookie, no need to store it
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await apiClient.post("/api/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      this.clearSession();
    }
  }

  /**
   * Get current user from session
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get("/api/me");
      if (response.data.user) {
        this.setUser(response.data.user);
        return response.data.user;
      }
      return null;
    } catch (error) {
      this.clearSession();
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    // Only check if user exists in localStorage
    // Token is in HTTP-only cookie and handled by the browser
    return this.getUser() !== null;
  }

  /**
   * Get stored user
   */
  static getUser(): User | null {
    return LocalStorageService.getItem<User | null>(STORAGE_KEYS.USER, null);
  }

  /**
   * Set user in storage
   */
  static setUser(user: User): void {
    LocalStorageService.setItem(STORAGE_KEYS.USER, user);
  }

  /**
   * Clear session data
   */
  static clearSession(): void {
    LocalStorageService.removeItem(STORAGE_KEYS.USER);
    // Tokens are in HTTP-only cookies and cleared by logout endpoint
  }
}
