# Quizda - Quiz Platform

A full-stack quiz application with React frontend and Cloudflare Worker backend.

## 🏗️ Tech Stack

- **Frontend**: React + Vite → Deploy to Vercel
- **Backend**: Hono + Cloudflare Workers (Deployed)
- **Database**: Cloudflare D1
- **Authentication**: Firebase Auth
- **Storage**: Cloudflare R2 (Quiz Questions)
- **Caching**: Cloudflare KV

## 🚀 Quick Start

### Frontend Development

```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

The frontend connects to the **deployed** Worker at:
`https://quizda-worker-prod.b-jairam0512.workers.dev`

### Test Credentials

| Role        | Username           | Password      |
| ----------- | ------------------ | ------------- |
| Contributor | `test_contributor` | `password123` |
| Attempter   | `test_attempter`   | `password123` |
| Admin       | `test_admin`       | `password123` |

### Backend Deployment (When Needed)

```bash
cd server
npm install
npm run build:worker
npx wrangler deploy
```

## 📚 Documentation

### Deployment Checklist

Your Quizda app is configured to connect the React frontend (local or Vercel) to the deployed Cloudflare Worker.

- Cloudflare Worker deployed at `https://quizda-worker-prod.b-jairam0512.workers.dev`
- CORS configured for `localhost:5173` and Vercel
- Test users hardcoded in Worker (3 users)
- All API endpoints implemented (`/api/login`, `/api/register`, `/api/quizzes`, etc.)
- Frontend configured to connect to deployed Worker
- API service layer with TypeScript types
- Error handling and interceptors

### Getting Started

Your Quizda application is now configured to use **Cloudflare Workers** with **Hono** as the backend framework. This document provides all the information you need to get started.

#### Backend (Server)

- **Hono Framework** - Lightweight web framework optimized for Cloudflare Workers
- **CORS Middleware** - Properly configured to accept requests from your frontend and future Vercel deployment
- **API Endpoints**:
  - `GET /api/health` - Health check
  - `GET /api/hello` - Test endpoint (returns: `{ message: "Hello from Cloudflare Worker" }`)
  - `POST /api/login` - User authentication with mock data
  - `POST /api/register` - User registration with mock data
  - `POST /api/forgot-password` - Password reset request
  - `GET /api/quizzes` - Fetch all quizzes

#### Frontend (Client)

- **Axios Configuration** (`client/src/services/api.ts`):

  - Automatic base URL detection (dev: `http://localhost:8787`, prod: `https://quizda-worker-prod.b-jairam0512.workers.dev`)
  - Request/response interceptors for logging
  - Automatic token management in Authorization header
  - Error handling with 401 redirect

- **API Service Layer** (`client/src/services/quizApi.ts`):

  - Typed API functions for all endpoints
  - Proper error handling and status code management
  - Token storage in localStorage

- **Demo Component** (`client/src/components/ApiConnectionDemo.tsx`):
  - Test connectivity with buttons to call `/api/hello` and `/api/health`

### Cloudflare Setup

Quizda uses a **deployed** Cloudflare Worker as the backend. The React frontend connects directly to the Worker at `https://quizda-worker-prod.b-jairam0512.workers.dev` - no local backend server needed!

#### Architecture

```
React Frontend    → Local Dev: http://localhost:5173
(Vite + Axios)    → Production: Vercel

Cloudflare Worker (Deployed) → Always Live
- /api/hello, /api/health
- /api/login, /api/register
- /api/forgot-password
- /api/quizzes
- CORS middleware & auth
```

#### Quick Start

1. Frontend Setup (Client)

```bash
cd client
npm install
npm run dev
# Opens at http://localhost:5173
```

2. Test Credentials (Hardcoded)

| Role        | Username           | Password      |
| ----------- | ------------------ | ------------- |
| Contributor | `test_contributor` | `password123` |
| Attempter   | `test_attempter`   | `password123` |

### Implementation Summary

#### Completed Tasks

- **wrangler.toml Configuration**

  - Set worker name: `quizda-worker`
  - Set compatibility_date: `2025-11-16`
  - Enabled nodejs_compat: `true`
  - Configured development environment
  - Configured production environment

- **Cloudflare Worker with Hono**

  - Created `/api/hello` - Returns `{ message: "Hello from Cloudflare Worker" }`
  - Implemented `/api/health` - Health check endpoint
  - Implemented `/api/login` - User authentication (POST)
    - Validates credentials
    - Returns user data and token
    - Status codes: 200, 400, 401, 403
  - Implemented `/api/register` - User registration (POST)
    - Validates email and username uniqueness
    - Creates new users
    - Status codes: 201, 400, 409
  - Implemented `/api/forgot-password` - Password reset (POST)
    - Secure email verification
    - Returns consistent response for security
    - Status code: 200
  - Existing `/api/quizzes` - Quiz listing (GET)
    - Returns mock quiz data
    - Fully populated with questions
  - CORS middleware configured
    - Allows localhost and production origins
    - Proper preflight request handling
    - Authorization header support

- **Frontend API Integration**
  - Axios Configuration
    - Automatic environment detection
    - Base URL management (dev: `http://localhost:8787`)
    - Request interceptors for token injection
    - Response interceptors for error handling
    - Automatic 401 redirect to login

### Server Notes

The worker uses an `ALLOWED_ORIGINS` allowlist to determine which origins are allowed to access API endpoints (CORS). By default the worker allows:

`https://quizda-worker-prod.b-jairam0512.workers.dev`

Set `ALLOWED_ORIGINS` in your `wrangler.toml` or locally during development.

1. Set in `wrangler.toml` (per-environment):

```toml
[env.production]
vars = { ALLOWED_ORIGINS = "https://app.quizda.example.com,https://quizda-worker-prod.b-jairam0512.workers.dev" }

[env.dev]
vars = { ALLOWED_ORIGINS = "http://localhost:5173,https://quizda-worker-prod.b-jairam0512.workers.dev" }
```

2. Set locally (bash/zsh) before running the worker or building:

```bash
# allow local dev and the worker origin
export ALLOWED_ORIGINS="http://localhost:5173,https://quizda-worker-prod.b-jairam0512.workers.dev"

# then run the worker build or start your local server
cd server
npm run build:worker
# or to run the node bundle (after building):
PORT=4001 npm start
```

---

# Layer-by-Layer Implementation Guide

## Quick Reference

| Layer            | Location                                            | Purpose              | Dependencies        |
| ---------------- | --------------------------------------------------- | -------------------- | ------------------- |
| **Frontend**     |                                                     |                      |                     |
| Presentation     | `client/src/components/`                            | UI rendering         | Hooks               |
| State Management | `client/src/hooks/`                                 | State & side effects | Services            |
| Business Logic   | `client/src/services/domain/`                       | Business rules       | API Client, Storage |
| Storage          | `client/src/services/storage/`                      | Data persistence     | -                   |
| API Client       | `client/src/services/api.ts`                        | HTTP communication   | -                   |
| **Backend**      |                                                     |                      |                     |
| API Handlers     | `server/src/auth/handlers/`, `server/src/worker.ts` | Request/Response     | Services            |
| Business Logic   | `server/src/services/`                              | Business rules       | Repositories        |
| Data Access      | `server/src/repositories/`                          | Database operations  | Database            |
| Domain           | `server/src/domain/`                                | Models & DTOs        | -                   |
| Database         | `server/src/db/`                                    | Schema & persistence | -                   |

## Frontend Layers

### 1. Presentation Layer

**Files**: `client/src/components/**/*.tsx`

**Import Examples**:

```tsx
import { useQuizzes, useUserStatistics } from "../../../hooks";

const AttempterDashboard: React.FC = () => {
  const { stats } = useUserStatistics();
  const { quizzes, loading } = useQuizzes();

  return <StatsCard title="Total" value={stats.totalQuizzesTaken} />;
};
```

**Rules**:

- ✅ Use hooks for data
- ✅ Receive props for configuration
- ✅ Emit events via callbacks
- ❌ No localStorage
- ❌ No API calls
- ❌ No calculations

### 2. State Management Layer

**Files**: `client/src/hooks/*.ts`

**Available Hooks**:

```tsx
// Authentication
import { useAuth } from "../hooks";
const { user, login, logout, isAuthenticated } = useAuth();

// Quizzes
import { useQuizzes } from "../hooks";
const { quizzes, saveQuiz, updateQuiz, deleteQuiz } = useQuizzes();

// Statistics
import { useUserStatistics, usePlatformStatistics } from "../hooks";
const { stats, refreshStats } = useUserStatistics();
const { stats: platformStats } = usePlatformStatistics();
```

**Rules**:

- ✅ Manage component state
- ✅ Call service layer methods
- ✅ Handle side effects
- ❌ No business logic
- ❌ No direct storage access

### 3. Business Logic Layer

**Files**: `client/src/services/domain/*.ts`

**Available Services**:

```tsx
import { QuizService, AuthService, StatisticsService } from "../services";

// Quiz operations
const quizzes = await QuizService.getAllQuizzes();
QuizService.saveContributorQuiz(quiz);
const attempts = QuizService.getAttempts();

// Authentication
await AuthService.login({ email, password });
await AuthService.register({ email, username, password, role });
const user = AuthService.getUser();

// Statistics
const stats = StatisticsService.calculateUserStats();
const platformStats = await StatisticsService.calculatePlatformStats();
```

**Rules**:

- ✅ Implement business rules
- ✅ Orchestrate operations
- ✅ Transform data
- ❌ No UI concerns
- ❌ No direct HTTP (use API client)

### 4. Storage Layer

**Files**: `client/src/services/storage/*.ts`

**Usage**:

```tsx
import { LocalStorageService } from "../services/storage/LocalStorageService";

// Type-safe operations
const quizzes = LocalStorageService.getItem<Quiz[]>("quizzes", []);
LocalStorageService.setItem("user", userData);
LocalStorageService.removeItem("cache");
```

**Rules**:

- ✅ Abstract storage operations
- ✅ Handle errors gracefully
- ✅ Provide type safety
- ❌ No business logic

## Backend Layers

### 1. API Handler Layer

**Files**: `server/src/auth/handlers/*.ts`, `server/src/worker.ts`

**Example**:

```tsx
import { UserRepository } from "../../repositories";
import { AuthenticationService } from "../../services";

export async function handleRegister(c: Context) {
  // 1. Validate input
  const validation = validateRegisterInput(input);
  if (!validation.isValid) {
    return c.json({ error: validation.error }, 400);
  }

  // 2. Initialize dependencies
  const db = getDb(c.env);
  const userRepo = new UserRepository(db);
  const authService = new AuthenticationService(userRepo);

  // 3. Call service
  const result = await authService.register(input);

  // 4. Return response
  return c.json(result, 201);
}
```

**Rules**:

- ✅ Validate requests
- ✅ Format responses
- ✅ Handle errors
- ✅ Initialize services
- ❌ No business logic
- ❌ No direct database access

### 2. Business Logic Layer

**Files**: `server/src/services/*.ts`

**Available Services**:

```tsx
import { AuthenticationService, QuizBusinessService } from "../services";

// Dependency injection
const authService = new AuthenticationService(userRepository);
const quizService = new QuizBusinessService(quizRepository);

// Operations
const authResult = await authService.register(userData);
const quiz = await quizService.createQuiz(quizData, userId);
await quizService.publishQuiz(quizId, userId);
```

**Rules**:

- ✅ Enforce business rules
- ✅ Validate domain logic
- ✅ Orchestrate repositories
- ✅ Transform entities to DTOs
- ❌ No HTTP concerns
- ❌ No direct database queries

### 3. Data Access Layer

**Files**: `server/src/repositories/*.ts`

**Available Repositories**:

```tsx
import {
  UserRepository,
  QuizRepository,
  AttemptRepository,
} from "../repositories";

// Initialize with database connection
const userRepo = new UserRepository(db);
const quizRepo = new QuizRepository(db);
const attemptRepo = new AttemptRepository(db);

// CRUD operations
const user = await userRepo.findByEmail(email);
const newUser = await userRepo.create(userData);
const quizzes = await quizRepo.findPublished(100, 0);
const stats = await attemptRepo.getUserStats(userId);
```

**Rules**:

- ✅ Database operations only
- ✅ Return domain models
- ✅ Handle query construction
- ❌ No business logic
- ❌ No validation (except DB constraints)

### 4. Domain Layer

**Files**: `server/src/domain/*.ts`

**Models** (`models.ts`):

```tsx
import type { User, Quiz, Attempt } from "../domain/models";

// Internal representations
const user: User = {
  id: 1,
  email: "user@example.com",
  passwordHash: "hashed...",
  // ... all fields
};
```

**DTOs** (`dtos.ts`):

```tsx
import type { UserDTO, QuizDTO, CreateQuizDTO } from "../domain/dtos";

// API contracts
const userDTO: UserDTO = {
  id: 1,
  email: "user@example.com",
  username: "user",
  role: "attempter",
  // No sensitive fields
};
```

**Rules**:

- ✅ Define data structures
- ✅ Separate internal/external representations
- ✅ Type safety
- ❌ No logic
- ❌ No dependencies

## Common Patterns

### Pattern 1: Creating a New Feature

**Step 1: Define Domain Model**

```tsx
// server/src/domain/models.ts
export interface Comment {
  id: number;
  quizId: number;
  userId: number;
  text: string;
  createdAt: Date;
}
```

**Step 2: Define DTO**

```tsx
// server/src/domain/dtos.ts
export interface CommentDTO {
  id: number;
  text: string;
  username: string;
  createdAt: string;
}
```

**Step 3: Create Repository**

```tsx
// server/src/repositories/CommentRepository.ts
export class CommentRepository {
  async findByQuiz(quizId: number): Promise<Comment[]> {}
  async create(data: CreateCommentData): Promise<Comment> {}
}
```

**Step 4: Create Service**

```tsx
// server/src/services/CommentService.ts
export class CommentService {
  async addComment(quizId: number, userId: number, text: string) {
    // Validate
    // Call repository
    // Return DTO
  }
}
```

**Step 5: Create API Handler**

```tsx
// server/src/handlers/comments.ts
export async function handleCreateComment(c: Context) {
  const service = new CommentService(commentRepo);
  const result = await service.addComment(...);
  return c.json(result);
}
```

**Step 6: Create Frontend Service**

```tsx
// client/src/services/domain/CommentService.ts
export class CommentService {
  static async getComments(quizId: number) {
    const response = await apiClient.get(`/api/comments/${quizId}`);
    return response.data;
  }
}
```

**Step 7: Create Hook**

```tsx
// client/src/hooks/useComments.ts
export function useComments(quizId: number) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    CommentService.getComments(quizId).then(setComments);
  }, [quizId]);

  return { comments };
}
```

**Step 8: Use in Component**

```tsx
// client/src/components/CommentList.tsx
const CommentList = ({ quizId }) => {
  const { comments } = useComments(quizId);
  return (
    <div>
      {comments.map((c) => (
        <Comment {...c} />
      ))}
    </div>
  );
};
```

### Pattern 2: Adding Business Logic

**❌ Wrong: Logic in Component**

```tsx
const Dashboard = () => {
  const calculateAverage = (scores: number[]) => {
    return scores.reduce((a, b) => a + b) / scores.length;
  };
  // ...
};
```

**✅ Right: Logic in Service**

```tsx
// Service
export class StatisticsService {
  static calculateAverage(scores: number[]): number {
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((a, b) => a + b) / scores.length);
  }
}

// Component
const Dashboard = () => {
  const { stats } = useStatistics();
  return <div>{stats.averageScore}</div>;
};
```

## Migration Checklist

When refactoring existing code:

- [ ] Move localStorage access to LocalStorageService
- [ ] Extract business logic to service classes
- [ ] Create custom hooks for state management
- [ ] Update components to use hooks
- [ ] Create repositories for database operations
- [ ] Create backend services for business logic
- [ ] Update handlers to use services
- [ ] Define DTOs for API contracts
- [ ] Remove direct DB access from handlers
- [ ] Add proper error handling at each layer

## Testing Strategy

### Unit Tests

**Services** (Business Logic):

```tsx
describe("QuizService", () => {
  it("should merge API and local quizzes", async () => {
    const result = await QuizService.getAllQuizzes();
    expect(result).toHaveLength(expectedCount);
  });
});
```

**Repositories** (Data Access):

```tsx
describe("UserRepository", () => {
  it("should find user by email", async () => {
    const user = await userRepo.findByEmail("test@example.com");
    expect(user).toBeDefined();
  });
});
```

### Integration Tests

**API Endpoints**:

```tsx
describe("POST /api/register", () => {
  it("should create new user", async () => {
    const response = await request(app).post("/api/register").send(userData);
    expect(response.status).toBe(201);
  });
});
```

### Component Tests

**React Components**:

```tsx
describe("Dashboard", () => {
  it("should display user stats", () => {
    render(<Dashboard />);
    expect(screen.getByText(/Total Quizzes/)).toBeInTheDocument();
  });
});
```

---

End of README
