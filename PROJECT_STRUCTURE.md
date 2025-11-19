# Project Structure - Separation of Concerns

This document outlines the reorganized project structure with strict separation of concerns.

## Client Structure (`client/src/`)

### ✅ Current Organization

```
client/src/
├── components/
│   ├── Dashboard/              # Role-specific dashboard components
│   │   ├── AdminDashboard/
│   │   ├── AttempterDashboard/
│   │   └── ContributorDashboard/
│   ├── LandingPage/            # Public landing page
│   ├── UserAuthentication/     # Auth-related components
│   │   ├── Login/
│   │   └── Register/
│   ├── Layout/                 # Layout components (NEW)
│   │   └── Header.tsx
│   ├── Routing/                # Route protection components (NEW)
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   ├── Quiz/                   # Quiz-related components (NEW)
│   │   ├── QuizCatalog.tsx
│   │   ├── QuizList.tsx
│   │   ├── QuizQuestion.tsx
│   │   ├── NewQuizDialog.tsx
│   │   ├── QuestionCard/
│   │   └── QuizWindow/
│   ├── types/                  # Question type components
│   │   ├── MCQQuestion.tsx
│   │   ├── TrueFalseQuestion.tsx
│   │   ├── MultipleResponse.tsx
│   │   ├── FillBlank.tsx
│   │   ├── Matching.tsx
│   │   ├── DragDrop.tsx
│   │   ├── Hotspot.tsx
│   │   └── AssertionReasoning.tsx
│   └── ui/                     # Reusable UI components
│       ├── Button.tsx
│       ├── Text.tsx
│       ├── Card.tsx
│       └── ...
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useQuizzes.ts
│   └── useQuizzesQuery.ts     # React Query hook (NEW)
├── services/                   # API and business logic
│   ├── api.ts
│   ├── quizApi.ts
│   ├── sessionManager.ts
│   └── domain/
├── theme/                      # Design system
│   ├── constants.ts
│   ├── designTokens.ts
│   └── designSystem.ts
└── App.tsx                     # Main app component
```

## Server Structure (`server/src/`)

### ✅ Current Organization

```
server/src/
├── auth/                       # Authentication logic
│   ├── firebase.ts
│   └── tokenManager.ts
├── controllers/                # Request handlers
│   ├── AuthController.ts
│   ├── QuizController.ts
│   ├── AttemptController.ts
│   └── SystemController.ts
├── db/                         # Database configuration
│   ├── index.ts
│   └── schema.ts
├── domain/                     # Domain models
│   ├── User.ts
│   └── Quiz.ts
├── middleware/                 # Request middleware
│   ├── authMiddleware.ts
│   └── csrfMiddleware.ts
├── repositories/               # Data access layer
│   ├── UserRepository.ts
│   ├── QuizRepository.ts
│   ├── AttemptRepository.ts
│   └── UserAnswerRepository.ts
├── routes/                     # API routes
│   ├── authRoutes.ts
│   ├── quizRoutes.ts
│   ├── attemptRoutes.ts
│   └── systemRoutes.ts
├── services/                   # Business logic
│   ├── AuthService.ts
│   ├── QuizService.ts
│   └── AttemptService.ts
├── test/                       # Tests (NEW - separated)
│   ├── repositories/
│   │   └── UserRepository.test.ts
│   └── setup.ts
├── utils/                      # Utility functions
│   ├── validation.ts
│   ├── errorHandler.ts
│   └── rateLimiter.ts
└── worker.ts                   # Main entry point
```

## Key Improvements

### 1. **Client Reorganization**

#### Before:
- Loose files in `components/` (Header, ProtectedRoute, QuizCatalog, etc.)
- Confusing for new developers

#### After:
- **Layout/**: All layout-related components (Header)
- **Routing/**: Route protection logic (ProtectedRoute, PublicRoute)
- **Quiz/**: All quiz-related UI components consolidated
- Clear separation by feature/responsibility

### 2. **Server Test Organization**

#### Before:
- Tests mixed with source code in `repositories/UserRepository.test.ts`

#### After:
- Dedicated `test/` directory
- Mirrors source structure: `test/repositories/UserRepository.test.ts`
- Clean separation of concerns

### 3. **Import Patterns**

All imports now follow consistent relative path patterns:
- Within same directory: `./Component`
- Parent directory: `../Component`
- Services/utils: `../../services/api`

## Benefits

1. **Clarity**: New developers can quickly understand where to find components
2. **Scalability**: Easy to add new features in the right place
3. **Maintainability**: Related code is grouped together
4. **Testability**: Clear separation of tests from source code
5. **Modularity**: Components are organized by feature, not by type

## File Naming Conventions

- **Components**: PascalCase (e.g., `Header.tsx`, `QuizCatalog.tsx`)
- **Utilities**: camelCase (e.g., `sessionManager.ts`, `validation.ts`)
- **Tests**: `*.test.ts` or `*.test.tsx`
- **Types**: `types.ts` or inline in component files
