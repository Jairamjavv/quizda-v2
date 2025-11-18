import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { sessionManager } from "./sessionManager";

/**
 * Configure base API URL for Axios with cookie-based authentication
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
  withCredentials: true, // Enable sending/receiving cookies
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Request interceptor - cookies are sent automatically
apiClient.interceptors.request.use(
  (config) => {
    // Cookies are automatically included due to withCredentials: true
    // No need to manually set Authorization header
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only log errors that are not 401 (unauthorized) or during initial session check
    const isSessionCheck = originalRequest.url?.includes("/api/me");
    const isRefreshEndpoint = originalRequest.url?.includes("/api/refresh");
    const is401 = error.response?.status === 401;

    if (!is401 || (!isSessionCheck && !isRefreshEndpoint)) {
      console.error("[API Error]", error.response?.status, error.message);
    }

    // Handle 401 Unauthorized - attempt token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't attempt refresh for specific endpoints
      const isAuthEndpoint =
        originalRequest.url?.includes("/api/login") ||
        originalRequest.url?.includes("/api/register") ||
        originalRequest.url?.includes("/api/logout");

      // Don't retry /api/me or /api/refresh endpoints
      if (isSessionCheck || isRefreshEndpoint || isAuthEndpoint) {
        // If refresh endpoint failed, session is expired
        if (isRefreshEndpoint) {
          console.log("[API] Refresh token expired, logging out");
          // Let sessionManager handle the expiration
          await sessionManager.logout();
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("[API] Access token expired, refreshing...");

        // Use sessionManager's refresh method for consistency
        const refreshed = await sessionManager.refreshToken();

        if (refreshed) {
          // Token refreshed successfully, process queued requests
          console.log(
            "[API] Token refresh successful, retrying queued requests"
          );
          processQueue();
          isRefreshing = false;

          // Retry the original request
          return apiClient(originalRequest);
        } else {
          // Refresh failed
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        // Token refresh failed, clear queue
        console.log("[API] Token refresh failed, clearing queue");
        processQueue(refreshError);
        isRefreshing = false;

        // SessionManager already handled logout, just reject
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Export axios for backwards compatibility with existing code
export default apiClient;
