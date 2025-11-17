/**
 * JWT-like token generation and verification
 */

import type { SessionPayload, RefreshTokenPayload } from "./types";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "./types";

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
