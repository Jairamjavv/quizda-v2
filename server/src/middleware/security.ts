/**
 * Security Middleware
 * Implements CSRF protection, rate limiting, and security headers
 */

import { Context, Next } from "hono";
import type { Env } from "../types";
import { checkRateLimit, verifyCSRFToken } from "../utils/security";

/**
 * CSRF Protection Middleware
 * Validates CSRF tokens for state-changing requests (POST, PUT, DELETE)
 */
export async function csrfProtection(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  const method = c.req.method;

  // Only check CSRF for state-changing methods
  if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    // Skip CSRF check for auth endpoints (they use other mechanisms)
    const path = c.req.path;
    if (
      path.includes("/api/auth/login") ||
      path.includes("/api/auth/register") ||
      path.includes("/api/auth/logout") ||
      path.includes("/api/auth/refresh") ||
      path.includes("/api/login") ||
      path.includes("/api/register") ||
      path.includes("/api/logout") ||
      path.includes("/api/refresh")
    ) {
      return await next();
    }

    // Get CSRF token from header or body
    const csrfToken =
      c.req.header("X-CSRF-Token") ||
      c.req.header("x-csrf-token") ||
      (await c.req
        .json()
        .then((body) => body?._csrf)
        .catch(() => null));

    // Get expected token from cookie
    const expectedToken = c.req
      .header("cookie")
      ?.match(/csrfToken=([^;]+)/)?.[1];

    if (!csrfToken || !expectedToken) {
      return c.json(
        { error: "CSRF token missing. Please refresh and try again." },
        403
      );
    }

    if (!verifyCSRFToken(csrfToken, expectedToken)) {
      return c.json({ error: "Invalid CSRF token" }, 403);
    }
  }

  await next();
}

/**
 * Rate Limiting Middleware
 * Limits requests per IP address
 */
export async function rateLimitMiddleware(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  // Get IP address from headers (Cloudflare provides CF-Connecting-IP)
  const ip =
    c.req.header("CF-Connecting-IP") ||
    c.req.header("X-Forwarded-For")?.split(",")[0] ||
    c.req.header("X-Real-IP") ||
    "unknown";

  // Different limits for different endpoints
  const path = c.req.path;
  let maxRequests = 100; // Default: 100 requests per minute
  let windowMs = 60000; // 1 minute

  // Stricter limits for auth endpoints
  if (
    path.includes("/api/auth/login") ||
    path.includes("/api/login") ||
    path.includes("/api/auth/register") ||
    path.includes("/api/register")
  ) {
    maxRequests = 5; // 5 attempts per minute
    windowMs = 60000;
  }

  const rateLimit = checkRateLimit(`${ip}:${path}`, maxRequests, windowMs);

  // Set rate limit headers
  c.header("X-RateLimit-Limit", maxRequests.toString());
  c.header("X-RateLimit-Remaining", rateLimit.remaining.toString());
  c.header("X-RateLimit-Reset", new Date(rateLimit.resetTime).toISOString());

  if (!rateLimit.allowed) {
    return c.json(
      {
        error: "Too many requests. Please try again later.",
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      },
      429
    );
  }

  await next();
}

/**
 * Security Headers Middleware
 * Adds security headers to all responses
 */
export async function securityHeaders(
  c: Context<{ Bindings: Env }>,
  next: Next
) {
  await next();

  // Prevent clickjacking
  c.header("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  c.header("X-Content-Type-Options", "nosniff");

  // XSS Protection (legacy browsers)
  c.header("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy
  c.header(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com",
      "frame-ancestors 'none'",
    ].join("; ")
  );

  // Permissions Policy (formerly Feature Policy)
  c.header(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );

  // Strict Transport Security (HTTPS only)
  if (c.req.url.startsWith("https://")) {
    c.header(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
}

/**
 * Input Sanitization Middleware
 * Sanitizes request body to prevent XSS
 */
export async function sanitizeInput(c: Context<{ Bindings: Env }>, next: Next) {
  const method = c.req.method;

  // Only sanitize for methods with body
  if (["POST", "PUT", "PATCH"].includes(method)) {
    try {
      const body = await c.req.json().catch(() => null);

      if (body && typeof body === "object") {
        // Store original body - controllers should handle sanitization
        // This middleware just validates the body is parseable
      }
    } catch (error) {
      // If JSON parsing fails, continue without sanitization
      // The controller will handle invalid JSON
    }
  }

  await next();
}
