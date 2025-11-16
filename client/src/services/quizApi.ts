/**
 * API Service Layer for Quizda
 *
 * This file provides typed API calls for the frontend.
 * Each function handles the request/response pattern and error handling.
 */

import { apiClient } from "./api";

// ============ Types ============

export interface HelloResponse {
  message: string;
}

export interface HealthResponse {
  status: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: "contributor" | "attempter" | "admin";
  remember?: boolean;
  firebaseUid?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  token: string;
  remember: boolean;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  role: "contributor" | "attempter" | "admin";
  firebaseUid: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface QuizResponse {
  id: number | string;
  title: string;
  category: string;
  subcategory?: string;
  tags?: string[];
  totalTimeMinutes?: number;
  questionsCount: number;
  questions?: any[];
}

// ============ API Calls ============

/**
 * Test endpoint - verifies connection to Worker
 */
export const apiHello = async (): Promise<HelloResponse> => {
  const response = await apiClient.get<HelloResponse>("/api/hello");
  return response.data;
};

/**
 * Health check endpoint
 */
export const apiHealth = async (): Promise<HealthResponse> => {
  const response = await apiClient.get<HealthResponse>("/api/health");
  return response.data;
};

/**
 * User login
 */
export const apiLogin = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/api/login", data);
  const { token } = response.data;

  // Store token in localStorage for future requests
  if (token) {
    localStorage.setItem("authToken", token);
  }

  // Store user info so UI can route and display profile
  if (response.data.user) {
    try {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    } catch (e) {
      // ignore storage errors
    }
  }

  return response.data;
};

/**
 * User registration
 */
export const apiRegister = async (
  data: RegisterRequest
): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(
    "/api/register",
    data
  );
  return response.data;
};

/**
 * Forgot password request
 */
export const apiForgotPassword = async (
  data: ForgotPasswordRequest
): Promise<ForgotPasswordResponse> => {
  const response = await apiClient.post<ForgotPasswordResponse>(
    "/api/forgot-password",
    data
  );
  return response.data;
};

/**
 * Get all quizzes
 */
export const apiGetQuizzes = async (): Promise<QuizResponse[]> => {
  const response = await apiClient.get<QuizResponse[]>("/api/quizzes");
  return response.data;
};

/**
 * Clear authentication (logout)
 */
export const apiLogout = (): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("user");
};
