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

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

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
      acc[decodeURIComponent(key)] = decodeURIComponent(value);
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
 */
export function setAuthCookies(
  response: Response,
  accessToken: string,
  refreshToken: string,
  isProduction: boolean = true
): Response {
  const accessTokenMaxAge = 15 * 60; // 15 minutes
  const refreshTokenMaxAge = 7 * 24 * 60 * 60; // 7 days

  // For production: use Strict SameSite for maximum security
  // For development: use None to allow cross-origin (client on different port)
  const cookieOptions: CookieOptions = {
    httpOnly: true,
    secure: true, // Always true - protects against man-in-the-middle attacks
    sameSite: isProduction ? "Strict" : "None", // Strict in production for XSS/CSRF protection
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
