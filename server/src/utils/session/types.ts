/**
 * Session type definitions
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

export const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days
