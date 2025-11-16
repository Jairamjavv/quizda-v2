/**
 * 🚀 API Usage Examples
 *
 * This file contains practical examples of how to use the Quizda API
 * from the React frontend. Copy and adapt these patterns for your needs.
 */

import {
  apiHello,
  apiHealth,
  apiLogin,
  apiRegister,
  apiForgotPassword,
  apiGetQuizzes,
  apiLogout,
} from "./quizApi";

// ============ Example 1: Test Connection ============

export async function testConnection() {
  try {
    console.log("Testing connection to Cloudflare Worker...");
    const response = await apiHello();
    console.log("✅ Success:", response);
    return response;
  } catch (error) {
    console.error("❌ Failed:", error);
    throw error;
  }
}

// ============ Example 2: Health Check ============

export async function checkHealth() {
  try {
    const response = await apiHealth();
    console.log("API Health:", response);
    return response;
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
}

// ============ Example 3: User Registration ============

export async function registerUser() {
  try {
    const response = await apiRegister({
      email: "john@example.com",
      username: "john_doe",
      password: "SecurePass123!",
      role: "attempter", // or 'contributor', 'admin'
    });

    if (response.success) {
      console.log("✅ Registration successful:", response.user);
      return response;
    }
  } catch (error: any) {
    if (error.response?.status === 409) {
      console.error("❌ User already exists");
    } else {
      console.error("❌ Registration failed:", error.message);
    }
    throw error;
  }
}

// ============ Example 4: User Login ============

export async function loginUser() {
  try {
    const response = await apiLogin({
      username: "john_doe",
      password: "SecurePass123!",
      role: "attempter",
      remember: true, // Remember this device
    });

    if (response.success) {
      console.log("✅ Login successful!");
      console.log("User:", response.user);
      console.log("Token saved to localStorage");

      // Token is automatically saved by apiLogin()
      // Use it for subsequent requests in Authorization header
      return response;
    }
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.error("❌ Invalid username or password");
    } else {
      console.error("❌ Login failed:", error.message);
    }
    throw error;
  }
}

// ============ Example 5: Forgot Password ============

export async function requestPasswordReset(email: string) {
  try {
    const response = await apiForgotPassword({ email });
    console.log("✅ Password reset request sent");
    console.log("Response:", response);
    return response;
  } catch (error: any) {
    console.error("❌ Password reset failed:", error.message);
    throw error;
  }
}

// ============ Example 6: Fetch Quizzes ============

export async function loadQuizzes() {
  try {
    const quizzes = await apiGetQuizzes();
    console.log(`✅ Loaded ${quizzes.length} quizzes`);

    // Group by category
    const byCategory: Record<string, any[]> = {};
    quizzes.forEach((quiz) => {
      const cat = quiz.category || "Uncategorized";
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(quiz);
    });

    console.log("By Category:", byCategory);
    return quizzes;
  } catch (error: any) {
    console.error("❌ Failed to load quizzes:", error.message);
    throw error;
  }
}

// ============ Example 7: Logout ============

export function logout() {
  apiLogout();
  console.log("✅ Logged out - token and user data cleared");
}

// ============ Example 8: Error Handling Pattern ============

export async function exampleErrorHandling() {
  try {
    const response = await apiLogin({
      username: "nonexistent",
      password: "wrongpass",
      role: "attempter",
    });
  } catch (error: any) {
    // Structured error handling
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    switch (status) {
      case 400:
        console.error("Validation error:", message);
        // Handle validation - show field errors to user
        break;
      case 401:
        console.error("Authentication failed:", message);
        // Handle auth failure - show login form
        break;
      case 409:
        console.error("Conflict:", message);
        // Handle conflict - duplicate username/email
        break;
      default:
        console.error(`Error ${status}:`, message);
    }
  }
}

// ============ Example 9: Using in React Component ============

/**
 * Pattern for using API in React functional components
 * For actual implementation, use the component in ApiConnectionDemo.tsx
 */

export async function quizListExample() {
  // This is just a helper function, not a React component
  // See ApiConnectionDemo.tsx in components/ for actual React usage pattern
  try {
    const quizzes = await apiGetQuizzes();
    console.log("Quizzes loaded:", quizzes);
    return quizzes;
  } catch (error) {
    console.error("Failed to load quizzes:", error);
    throw error;
  }
}

// ============ Example 10: Request/Response Logging ============

/**
 * The axios interceptors in api.ts already log:
 * - All requests with method, URL, and body
 * - All responses with status and headers
 * - All errors with details
 *
 * Open browser DevTools Console (F12) to see logs:
 */

// Example console output:
/*
[API Config] Using API Base URL: http://localhost:8787
POST http://localhost:8787/api/login
{ success: true, user: { id: 1, username: 'john_doe', ... }, token: '...' }
[API Error] 401 Invalid credentials
*/

export default {
  testConnection,
  checkHealth,
  registerUser,
  loginUser,
  requestPasswordReset,
  loadQuizzes,
  logout,
  exampleErrorHandling,
  quizListExample,
};
