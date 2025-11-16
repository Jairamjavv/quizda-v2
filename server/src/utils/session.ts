/**
 * Session Management Utilities for Cloudflare Workers
 * Handles JWT token generation, validation, and refresh logic
 */

export interface SessionPayload {
  userId: number;
  email: string;
  role: string;
  firebaseUid?: string;
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  userId: number;
  email: string;
  tokenVersion: number;
  iat: number;
  exp: number;
}

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Generate a JWT-like access token with short expiry
 */
export async function generateAccessToken(
  userId: number,
  email: string,
  role: string,
  firebaseUid?: string
): Promise<string> {
  const payload: SessionPayload = {
    userId,
    email,
    role,
    firebaseUid,
    iat: Date.now(),
    exp: Date.now() + ACCESS_TOKEN_EXPIRY,
  };

  // In production, use a proper JWT library with signing
  // For now, using base64 encoding (should be signed with HMAC/RS256)
  return btoa(JSON.stringify(payload));
}

/**
 * Generate a refresh token with long expiry
 */
export async function generateRefreshToken(
  userId: number,
  email: string,
  tokenVersion: number = 0
): Promise<string> {
  const payload: RefreshTokenPayload = {
    userId,
    email,
    tokenVersion,
    iat: Date.now(),
    exp: Date.now() + REFRESH_TOKEN_EXPIRY,
  };

  return btoa(JSON.stringify(payload));
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): SessionPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as SessionPayload;

    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as RefreshTokenPayload;

    // Check if token is expired
    if (payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

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
