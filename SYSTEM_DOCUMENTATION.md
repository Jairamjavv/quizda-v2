# System Documentation

This document details the technical specifications of the Quizda application, including routing, API endpoints, database schema, and data workflows.

## 1. Frontend Routing

### Public Routes
Accessible to unauthenticated users. Authenticated users are redirected to their respective dashboards.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Redirects to `/landing` |
| `/landing` | `LandingPage` | Marketing page |
| `/login` | `Login` | User login |
| `/register` | `Register` | User registration |

### Protected Routes
Requires authentication. Access is determined by user role (`attempter`, `contributor`, `admin`).

#### Attempter Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/attempter` | `AttempterDashboard` | Main dashboard for quiz takers |
| `/quiz-catalog` | `QuizCatalog` | Browse and start quizzes |

#### Contributor Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/contributor` | `ContributorDashboard` | Dashboard for quiz creators |
| `/contributor/new-quiz` | `ContributorQuizBuilder` | Quiz creation wizard |

#### Admin Routes
| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard/admin` | `AdminDashboard` | System administration |

---

## 2. Backend API Endpoints

Base URL: `https://quizda-worker-prod.b-jairam0512.workers.dev` (Prod) or `http://localhost:8787` (Dev)

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| POST | `/refresh` | Refresh access token | No (Cookie) |
| GET | `/me` | Get current user info | Yes |

### Quizzes (`/api/quizzes`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all quizzes | Yes |
| POST | `/` | Create new quiz | Yes (Contributor/Admin) |
| GET | `/:id` | Get quiz details | Yes |
| PUT | `/:id` | Update quiz | Yes (Creator/Admin) |
| DELETE | `/:id` | Delete quiz | Yes (Creator/Admin) |

### Attempts (`/api/attempts`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/` | Start new attempt | Yes |
| POST | `/:id/submit` | Submit attempt | Yes |
| GET | `/history` | Get user attempt history | Yes |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/hello` | Test endpoint |
| GET | `/api/csrf/token` | Get CSRF token |

---

## 3. Database Schema (Cloudflare D1)

### `users`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AutoInc | Unique User ID |
| `firebase_uid` | TEXT | Unique | Link to Firebase Auth |
| `email` | TEXT | Not Null, Unique | User email |
| `username` | TEXT | Not Null, Unique | Display name |
| `password_hash` | TEXT | | For non-Firebase auth |
| `role` | TEXT | Enum | `admin`, `contributor`, `attempter` |
| `created_at` | INTEGER | | Timestamp |

### `quizzes`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AutoInc | Unique Quiz ID |
| `title` | TEXT | Not Null | Quiz title |
| `description` | TEXT | | Quiz description |
| `category_id` | INTEGER | FK -> categories | Category reference |
| `creator_id` | INTEGER | FK -> users | User who created quiz |
| `difficulty` | TEXT | Enum | `easy`, `medium`, `hard` |
| `time_limit` | INTEGER | | In seconds |
| `is_published` | INTEGER | Boolean | Publishing status |
| `r2_key` | TEXT | | Reference to R2 storage (questions JSON) |

### `attempts`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AutoInc | Unique Attempt ID |
| `quiz_id` | INTEGER | FK -> quizzes | Quiz being attempted |
| `user_id` | INTEGER | FK -> users | User attempting |
| `score` | INTEGER | Default 0 | Final score |
| `status` | TEXT | Enum | `in_progress`, `completed` |

### `user_answers`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, AutoInc | Unique Answer ID |
| `attempt_id` | INTEGER | FK -> attempts | Parent attempt |
| `question_index`| INTEGER | Not Null | Index in questions array |
| `user_answer` | TEXT | Not Null | JSON string of answer |
| `is_correct` | INTEGER | Boolean | Correctness flag |

---

## 4. Data Workflows

### User Registration
1. **Frontend**: User submits form -> `registerWithFirebase()` -> Get UID.
2. **Frontend**: POST `/api/register` with `{ email, username, role, firebaseUid }`.
3. **Backend**: Validate input -> Create `User` record in D1 -> Return User DTO + HttpOnly Cookie.

### Quiz Creation
1. **Frontend**: Contributor defines quiz details & questions.
2. **Frontend**: POST `/api/quizzes`.
3. **Backend**: 
   - Upload questions JSON to **Cloudflare R2**.
   - Create `Quiz` record in **D1** with `r2_key`.
   - Return success.

### Quiz Attempt
1. **Frontend**: User starts quiz -> POST `/api/attempts`.
2. **Backend**: Create `Attempt` record (status: `in_progress`).
3. **Frontend**: User submits answers -> POST `/api/attempts/:id/submit`.
4. **Backend**: 
   - Fetch questions from R2.
   - Grade answers.
   - Update `Attempt` with score & status.
   - Save `UserAnswer` records for detailed analytics.
   - Return results.
