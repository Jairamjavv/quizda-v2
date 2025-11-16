import axios, { AxiosError, AxiosResponse } from "axios";

/**
 * Configure base API URL for Axios
 *
 * Always connects to deployed Cloudflare Worker.
 * Override with VITE_API_BASE_URL if needed.
 */

// Default to deployed Worker (no local backend server)
let API_BASE_URL = "https://quizda-worker-prod.b-jairam0512.workers.dev";

// Allow override via environment variable (e.g., for testing)
if ((import.meta as any).env?.VITE_API_BASE_URL) {
  API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL;
}

console.log(`[API Config] Using API Base URL: ${API_BASE_URL}`);

// Create axios instance with proper configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error("[API Error]", error.response?.status, error.message);

    // Handle specific status codes
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

// Export axios for backwards compatibility with existing code
export default apiClient;
