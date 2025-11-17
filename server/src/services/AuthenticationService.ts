/**
 * Authentication Service - Business Logic Layer (Backend)
 *
 * Handles authentication business logic.
 * Orchestrates between repositories and auth handlers.
 */

import { UserRepository } from "../repositories";
import { hashPassword, verifyPassword } from "../auth/crypto";
import { generateAccessToken, generateRefreshToken } from "../utils/session";
import type {
  CreateUserDTO,
  LoginDTO,
  AuthResponseDTO,
  UserDTO,
} from "../domain/dtos";
import type { User } from "../domain/models";

export class AuthenticationService {
  constructor(private userRepo: UserRepository) {}

  /**
   * Register new user
   */
  async register(data: CreateUserDTO): Promise<AuthResponseDTO> {
    // Check if user exists
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Check Firebase UID if provided
    if (data.firebaseUid) {
      const existingByFirebase = await this.userRepo.findByFirebaseUid(
        data.firebaseUid
      );
      if (existingByFirebase) {
        throw new Error("User already exists with this Firebase UID");
      }
    }

    // Hash password if provided
    const passwordHash = data.password
      ? await hashPassword(data.password)
      : null;

    // Create user
    const user = await this.userRepo.create({
      ...data,
      passwordHash,
    });

    // Generate tokens
    const accessToken = await generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.firebaseUid || undefined
    );
    const refreshToken = await generateRefreshToken(user.id, user.email);

    return {
      user: this.mapToUserDTO(user),
      token: accessToken,
      message: "User registered successfully",
    };
  }

  /**
   * Login user
   */
  async login(credentials: LoginDTO): Promise<AuthResponseDTO> {
    // Find user by email
    const user = await this.userRepo.findByEmail(credentials.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password if using password auth
    if (credentials.password) {
      if (!user.passwordHash) {
        throw new Error(
          "Password authentication not available for this account"
        );
      }

      const isValid = await verifyPassword(
        credentials.password,
        user.passwordHash
      );
      if (!isValid) {
        throw new Error("Invalid credentials");
      }
    }

    // Generate tokens
    const accessToken = await generateAccessToken(
      user.id,
      user.email,
      user.role,
      user.firebaseUid || undefined
    );
    const refreshToken = await generateRefreshToken(user.id, user.email);

    return {
      user: this.mapToUserDTO(user),
      token: accessToken,
      message: "Login successful",
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<UserDTO | null> {
    const user = await this.userRepo.findById(id);
    return user ? this.mapToUserDTO(user) : null;
  }

  /**
   * Map User entity to UserDTO
   */
  private mapToUserDTO(user: User): UserDTO {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
}
