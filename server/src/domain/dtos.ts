/**
 * Data Transfer Objects - Backend
 *
 * DTOs for API communication, separate from domain models.
 * Define the contract between frontend and backend.
 */

// User DTOs
export interface UserDTO {
  id: number;
  email: string;
  username: string;
  role: "admin" | "contributor" | "attempter";
}

export interface CreateUserDTO {
  firebaseUid?: string;
  email: string;
  username: string;
  password?: string;
  role: "admin" | "contributor" | "attempter";
}

export interface LoginDTO {
  email: string;
  password: string;
  firebaseToken?: string;
}

export interface AuthResponseDTO {
  user: UserDTO;
  token: string;
  message?: string;
}

// Quiz DTOs
export interface QuizDTO {
  id: number;
  title: string;
  description: string | null;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  isPublished: boolean;
  timeLimit?: number;
  passingScore?: number;
  questionsCount?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  r2Key?: string | null;
  totalQuestions?: number;
}

export interface CreateQuizDTO {
  title: string;
  description?: string;
  categoryId?: number;
  difficulty?: "easy" | "medium" | "hard";
  timeLimit?: number;
  passingScore?: number;
  tags?: number[];
}

export interface UpdateQuizDTO {
  title?: string;
  description?: string;
  categoryId?: number;
  difficulty?: "easy" | "medium" | "hard";
  isPublished?: boolean;
  timeLimit?: number;
  passingScore?: number;
  r2Key?: string;
  totalQuestions?: number;
}

// Question DTOs
export interface QuestionDTO {
  id: number;
  type: string;
  questionText: string;
  options: any;
  points: number;
  explanation?: string;
  order: number;
}

export interface CreateQuestionDTO {
  quizId: number;
  type: string;
  questionText: string;
  options: any;
  correctAnswer: any;
  points: number;
  explanation?: string;
  order: number;
}

// Attempt DTOs
export interface AttemptDTO {
  id: number;
  quizId: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  completedAt?: string;
  createdAt: string;
}

export interface CreateAttemptDTO {
  quizId: number;
  answers: any;
  timeSpent?: number;
}

export interface SubmitAttemptDTO {
  attemptId: number;
  answers: any;
  timeSpent?: number;
}

// Category DTOs
export interface CategoryDTO {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
}

// Tag DTOs
export interface TagDTO {
  id: number;
  name: string;
}

// Statistics DTOs
export interface UserStatsDTO {
  totalQuizzesTaken: number;
  totalQuizzesCreated: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
}

export interface QuizStatsDTO {
  quizId: number;
  totalAttempts: number;
  averageScore: number;
  completionRate: number;
}
