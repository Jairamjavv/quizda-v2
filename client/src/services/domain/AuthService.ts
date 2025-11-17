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
  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post("/api/login", credentials);

      if (response.data.user && response.data.token) {
        this.setUser(response.data.user);
        this.setToken(response.data.token);
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed");
    }
  }

  /**
   * Register new user
   */
  static async register(
    data: RegisterData
  ): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post("/api/register", data);

      if (response.data.user && response.data.token) {
        this.setUser(response.data.user);
        this.setToken(response.data.token);
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
    return this.getUser() !== null && this.getToken() !== null;
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
   * Get auth token
   */
  static getToken(): string | null {
    return LocalStorageService.getItem<string | null>(
      STORAGE_KEYS.AUTH_TOKEN,
      null
    );
  }

  /**
   * Set auth token
   */
  static setToken(token: string): void {
    LocalStorageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Clear session data
   */
  static clearSession(): void {
    LocalStorageService.removeItem(STORAGE_KEYS.USER);
    LocalStorageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Refresh authentication token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post("/api/refresh");
      if (response.data.token) {
        this.setToken(response.data.token);
        return response.data.token;
      }
      return null;
    } catch (error) {
      this.clearSession();
      return null;
    }
  }
}
