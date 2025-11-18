/**
 * Input validation utilities for authentication
 */

import {
  sanitizeInput,
  isValidEmail,
  isValidUsername,
  isStrongPassword,
} from "../utils/security";

export type RegisterInput = {
  email: string;
  password?: string;
  username: string;
  role?: string;
  firebaseUid?: string; // Optional: only needed for Firebase auth
};

export type LoginInput = {
  email?: string;
  password?: string;
  firebaseUid?: string;
};

export function validateRegisterInput(input: any): {
  isValid: boolean;
  error?: string;
  role: string;
} {
  // Email and username are required
  // FirebaseUid is optional (only for Firebase auth)
  // Password is optional (only for password-based auth)
  if (!input.email || !input.username) {
    return {
      isValid: false,
      error: "Email and username are required",
      role: "attempter",
    };
  }

  // At least one authentication method must be provided
  if (!input.password && !input.firebaseUid) {
    return {
      isValid: false,
      error: "Either password or firebaseUid must be provided",
      role: "attempter",
    };
  }

  // Sanitize and validate email
  const email = sanitizeInput(input.email);
  if (!isValidEmail(email)) {
    return {
      isValid: false,
      error: "Invalid email format",
      role: "attempter",
    };
  }

  // Sanitize and validate username
  const username = sanitizeInput(input.username);
  if (!isValidUsername(username)) {
    return {
      isValid: false,
      error:
        "Username must be 3-30 characters and contain only letters, numbers, underscores, and hyphens",
      role: "attempter",
    };
  }

  // Validate password if provided (for non-Firebase registration)
  if (input.password) {
    const passwordValidation = isStrongPassword(input.password);
    if (!passwordValidation.isValid) {
      return {
        isValid: false,
        error: passwordValidation.error,
        role: "attempter",
      };
    }
  }

  // Validate role
  const validRoles = ["admin", "contributor", "attempter"];
  const role =
    input.role && validRoles.includes(input.role) ? input.role : "attempter";

  return { isValid: true, role };
}

export function validateLoginInput(input: any): {
  isValid: boolean;
  error?: string;
} {
  if (input.firebaseUid) {
    // Sanitize Firebase UID
    const sanitized = sanitizeInput(input.firebaseUid);
    if (!sanitized) {
      return { isValid: false, error: "Invalid Firebase UID" };
    }
    return { isValid: true };
  }

  if (input.email && input.password) {
    // Sanitize and validate email
    const email = sanitizeInput(input.email);
    if (!isValidEmail(email)) {
      return { isValid: false, error: "Invalid email format" };
    }

    // Check password length (don't validate strength for login)
    if (input.password.length < 1 || input.password.length > 128) {
      return { isValid: false, error: "Invalid password" };
    }

    // Email/password login is valid
    return { isValid: true };
  }

  return {
    isValid: false,
    error: "Email and password or firebaseUid required",
  };
}
