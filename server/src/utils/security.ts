/**
 * Security Utilities
 * Prevents XSS, SQL Injection, and other security vulnerabilities
 */

/**
 * Sanitize user input to prevent XSS attacks
 * Removes/escapes potentially dangerous HTML/JavaScript
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return (
    input
      .trim()
      // Remove HTML tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
      .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
      // Escape special HTML characters
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  );
}

/**
 * Sanitize an object's string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    if (typeof sanitized[key] === "string") {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    } else if (
      typeof sanitized[key] === "object" &&
      sanitized[key] !== null &&
      !Array.isArray(sanitized[key])
    ) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    } else if (Array.isArray(sanitized[key])) {
      sanitized[key] = sanitized[key].map((item: any) =>
        typeof item === "string"
          ? sanitizeInput(item)
          : typeof item === "object" && item !== null
          ? sanitizeObject(item)
          : item
      ) as any;
    }
  }

  return sanitized;
}

/**
 * Validate email format to prevent injection
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validate username to prevent injection
 * Only allows alphanumeric characters, underscores, and hyphens
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
  return usernameRegex.test(username);
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  error?: string;
} {
  if (password.length < 8) {
    return {
      isValid: false,
      error: "Password must be at least 8 characters long",
    };
  }

  if (password.length > 128) {
    return {
      isValid: false,
      error: "Password must not exceed 128 characters",
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }

  return { isValid: true };
}

/**
 * Sanitize SQL-like input (extra layer on top of parameterized queries)
 * Note: This is NOT a replacement for parameterized queries!
 * Drizzle ORM already prevents SQL injection, but this adds defense in depth.
 */
export function sanitizeSQLInput(input: string): string {
  if (typeof input !== "string") return "";

  // Remove SQL keywords and special characters commonly used in SQL injection
  return input
    .replace(
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|WHERE|FROM|JOIN|--|;|'|"|\*|\/\*|\*\/)\b)/gi,
      ""
    )
    .replace(/[;'"\\]/g, "")
    .trim();
}

/**
 * Validate and sanitize quiz title
 */
export function sanitizeQuizTitle(title: string): string {
  if (typeof title !== "string") return "";

  return title
    .trim()
    .substring(0, 200) // Limit length
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>'"]/g, ""); // Remove potentially dangerous characters
}

/**
 * Validate and sanitize quiz description
 */
export function sanitizeQuizDescription(description: string): string {
  if (typeof description !== "string") return "";

  return description
    .trim()
    .substring(0, 1000) // Limit length
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ""); // Remove iframes
}

/**
 * Generate CSRF token
 */
export async function generateCSRFToken(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) return false;
  if (token.length !== expectedToken.length) return false;

  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Rate limiting check (simple in-memory implementation)
 * For production, use a distributed cache like Redis
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record
    const resetTime = now + windowMs;
    rateLimitMap.set(identifier, { count: 1, resetTime });
    return { allowed: true, remaining: maxRequests - 1, resetTime };
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Clean up expired rate limit records (call periodically)
 */
export function cleanupRateLimitRecords(): void {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Validate integer input to prevent injection
 */
export function validateInteger(
  value: any,
  min?: number,
  max?: number
): { isValid: boolean; value?: number; error?: string } {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return { isValid: false, error: "Invalid number" };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Number must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Number must not exceed ${max}` };
  }

  return { isValid: true, value: num };
}

/**
 * Escape JSON for safe output in HTML
 */
export function escapeJSON(obj: any): string {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/'/g, "\\u0027");
}
