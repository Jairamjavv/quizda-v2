/**
 * Cookie Management Utilities for Cloudflare Workers
 * Handles secure HTTP-only cookie creation and parsing
 */

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  maxAge?: number; // in seconds
  path?: string;
  domain?: string;
}

const DEFAULT_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
  path: "/",
};

/**
 * Create a Set-Cookie header value
 */
export function createCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  const opts = { ...DEFAULT_COOKIE_OPTIONS, ...options };

  // Don't encode the value - base64url tokens are already URL-safe
  // Only encode the name to be safe
  let cookie = `${encodeURIComponent(name)}=${value}`;

  if (opts.maxAge !== undefined) {
    cookie += `; Max-Age=${opts.maxAge}`;
  }

  if (opts.path) {
    cookie += `; Path=${opts.path}`;
  }

  if (opts.domain) {
    cookie += `; Domain=${opts.domain}`;
  }

  if (opts.httpOnly) {
    cookie += "; HttpOnly";
  }

  if (opts.secure) {
    cookie += "; Secure";
  }

  if (opts.sameSite) {
    cookie += `; SameSite=${opts.sameSite}`;
  }

  return cookie;
}

/**
 * Create a cookie deletion header
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, "path" | "domain"> = {}
): string {
  return createCookie(name, "", {
    ...options,
    maxAge: 0,
  });
}

/**
 * Parse cookies from Cookie header
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  return cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    if (key && value) {
      // Don't decode value - base64url tokens don't need decoding
      acc[decodeURIComponent(key)] = value;
    }
    return acc;
  }, {} as Record<string, string>);
}

/**
 * Get a specific cookie value from request
 */
export function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  const cookies = parseCookies(cookieHeader);
  return cookies[name] || null;
}

/**
 * Set authentication cookies (access token + refresh token)
 *
 * SECURITY CONFIGURATION:
 * - httpOnly: true  → Prevents JavaScript access (XSS protection)
 * - secure: true    → HTTPS only (prevents MITM attacks)
 * - sameSite: "None" → Required for cross-site cookies
 *
 * CROSS-SITE vs SAME-SITE:
 *
 * Current Setup (Cross-Site):
 *   Frontend: quizda-v2-client.pages.dev
 *   Backend:  quizda-worker-prod.b-jairam0512.workers.dev
 *   Required: SameSite=None (different domains)
 *
 * Recommended Setup (Same-Site) - MOST SECURE:
 *   Frontend: app.yourdomain.com
 *   Backend:  api.yourdomain.com  OR  app.yourdomain.com/api
 *   Use:      SameSite=Strict (same domain, maximum security)
 *
 * SameSite Options:
 *   - Strict: Most secure, only same-site requests (recommended for production)
 *   - Lax:    Allows top-level navigation (GET only)
 *   - None:   Allows cross-site (requires Secure flag, less secure)
 *
 * TO ENABLE SameSite=Strict:
 *   1. Serve frontend and backend from same domain (e.g., api.yourdomain.com)
 *   2. OR use Cloudflare Workers Routes to proxy API through same domain
 *   3. Change sameSite from "None" to "Strict" below
 */
export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
  isProduction: boolean = true
): Response {
  const accessTokenMaxAge = 15 * 60; // 15 minutes
  const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7 days

  // Cookie configuration optimized for security
  // Using SameSite=None because frontend and backend are on different domains
  // To use SameSite=Strict (most secure), deploy backend on same domain as frontend
  const cookieOptions: CookieOptions = {
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    secure: true, // HTTPS only (required for SameSite=None)
    sameSite: "None", // Cross-site cookies (change to "Strict" for same-domain setup)
    path: "/",
  };

  response.headers.append(
    "Set-Cookie",
    createCookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: accessTokenMaxAge,
    })
  );

  response.headers.append(
    "Set-Cookie",
    createCookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenMaxAge,
    })
  );

  return response;
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(response: Response): Response {
  response.headers.append("Set-Cookie", deleteCookie("access_token"));
  response.headers.append("Set-Cookie", deleteCookie("refresh_token"));
  return response;
}
