/**
 * Service Layer Barrel Export
 *
 * Centralized export for all service layer modules.
 */

// Storage Layer
export { LocalStorageService } from "./storage/LocalStorageService";

// Domain Services (Business Logic)
export { QuizService } from "./domain/QuizService";
export type { Quiz, QuizAttempt } from "./domain/QuizService";

export { StatisticsService } from "./domain/StatisticsService";
export type {
  UserStatistics,
  PlatformStatistics,
} from "./domain/StatisticsService";

export { AuthService } from "./domain/AuthService";
export type {
  User,
  LoginCredentials,
  RegisterData,
} from "./domain/AuthService";
