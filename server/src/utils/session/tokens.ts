/**
 * JWT-like token generation and verification
 */

import type { SessionPayload, RefreshTokenPayload } from "./types";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "./types";

/**
 * Convert base64 to base64url (URL-safe)
 */
function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Convert base64url back to base64
 */
function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

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

  // Use base64url encoding (URL-safe)
  return toBase64Url(btoa(JSON.stringify(payload)));
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

  return toBase64Url(btoa(JSON.stringify(payload)));
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): SessionPayload | null {
  try {
    // Convert base64url back to base64
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const payload = JSON.parse(atob(base64)) as SessionPayload;

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
    // Convert base64url back to base64
    let base64 = token.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }

    const payload = JSON.parse(atob(base64)) as RefreshTokenPayload;

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
