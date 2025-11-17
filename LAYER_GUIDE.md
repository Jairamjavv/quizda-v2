# Layer-by-Layer Implementation Guide

## Quick Reference

| Layer | Location | Purpose | Dependencies |
|-------|----------|---------|--------------|
| **Frontend** | | | |
| Presentation | `client/src/components/` | UI rendering | Hooks |
| State Management | `client/src/hooks/` | State & side effects | Services |
| Business Logic | `client/src/services/domain/` | Business rules | API Client, Storage |
| Storage | `client/src/services/storage/` | Data persistence | - |
| API Client | `client/src/services/api.ts` | HTTP communication | - |
| **Backend** | | | |
| API Handlers | `server/src/auth/handlers/`, `server/src/worker.ts` | Request/Response | Services |
| Business Logic | `server/src/services/` | Business rules | Repositories |
| Data Access | `server/src/repositories/` | Database operations | Database |
| Domain | `server/src/domain/` | Models & DTOs | - |
| Database | `server/src/db/` | Schema & persistence | - |

## Frontend Layers

### 1. Presentation Layer

**Files**: `client/src/components/**/*.tsx`

**Import Examples**:
```tsx
import { useQuizzes, useUserStatistics } from '../../../hooks';

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
import { useAuth } from '../hooks';
const { user, login, logout, isAuthenticated } = useAuth();

// Quizzes
import { useQuizzes } from '../hooks';
const { quizzes, saveQuiz, updateQuiz, deleteQuiz } = useQuizzes();

// Statistics
import { useUserStatistics, usePlatformStatistics } from '../hooks';
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
import { QuizService, AuthService, StatisticsService } from '../services';

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
import { LocalStorageService } from '../services/storage/LocalStorageService';

// Type-safe operations
const quizzes = LocalStorageService.getItem<Quiz[]>('quizzes', []);
LocalStorageService.setItem('user', userData);
LocalStorageService.removeItem('cache');
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
import { UserRepository } from '../../repositories';
import { AuthenticationService } from '../../services';

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
import { AuthenticationService, QuizBusinessService } from '../services';

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
import { UserRepository, QuizRepository, AttemptRepository } from '../repositories';

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
import type { User, Quiz, Attempt } from '../domain/models';

// Internal representations
const user: User = {
  id: 1,
  email: 'user@example.com',
  passwordHash: 'hashed...',
  // ... all fields
};
```

**DTOs** (`dtos.ts`):
```tsx
import type { UserDTO, QuizDTO, CreateQuizDTO } from '../domain/dtos';

// API contracts
const userDTO: UserDTO = {
  id: 1,
  email: 'user@example.com',
  username: 'user',
  role: 'attempter'
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
  async findByQuiz(quizId: number): Promise<Comment[]> { }
  async create(data: CreateCommentData): Promise<Comment> { }
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
  return <div>{comments.map(c => <Comment {...c} />)}</div>;
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
}
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
}
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
describe('QuizService', () => {
  it('should merge API and local quizzes', async () => {
    const result = await QuizService.getAllQuizzes();
    expect(result).toHaveLength(expectedCount);
  });
});
```

**Repositories** (Data Access):
```tsx
describe('UserRepository', () => {
  it('should find user by email', async () => {
    const user = await userRepo.findByEmail('test@example.com');
    expect(user).toBeDefined();
  });
});
```

### Integration Tests

**API Endpoints**:
```tsx
describe('POST /api/register', () => {
  it('should create new user', async () => {
    const response = await request(app)
      .post('/api/register')
      .send(userData);
    expect(response.status).toBe(201);
  });
});
```

### Component Tests

**React Components**:
```tsx
describe('Dashboard', () => {
  it('should display user stats', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Total Quizzes/)).toBeInTheDocument();
  });
});
```
