/**
 * Session extraction from HTTP requests
 */

import type { SessionPayload } from "./types";
import { verifyAccessToken, extractBearerToken } from "./tokens";

/**
 * Get session from request (checks both cookie and Authorization header)
 */
export function getSessionFromRequest(request: Request): SessionPayload | null {
  // First, try to get from Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader) {
    const token = extractBearerToken(authHeader);
    if (token) {
      const payload = verifyAccessToken(token);
      if (payload) return payload;
    }
  }

  // Then, try to get from cookie
  const cookieHeader = request.headers.get("Cookie");
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    const accessToken = cookies["access_token"];
    if (accessToken) {
      return verifyAccessToken(accessToken);
    }
  }

  return null;
}

/**
 * Parse cookie header into key-value pairs
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
}
