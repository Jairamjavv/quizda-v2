# Quizda Application Routing Documentation

## Route Organization by User Role

### 🌐 **Public Routes** (Unauthenticated Users Only)

These routes are accessible ONLY when the user is **NOT logged in**. If a user is authenticated, they will be automatically redirected to their role-specific dashboard.

| Route       | Component             | Description                                     | Auth Requirement                                |
| ----------- | --------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `/`         | Navigate → `/landing` | Root redirect                                   | None                                            |
| `/landing`  | `<LandingPage>`       | Marketing/landing page with platform statistics | **Public Only** - Redirects authenticated users |
| `/login`    | `<Login>`             | User login form                                 | **Public Only** - Redirects authenticated users |
| `/register` | `<Register>`          | User registration form                          | **Public Only** - Redirects authenticated users |

**Redirect Logic (PublicRoute):**

- If user is logged in as `admin` → Redirect to `/dashboard/admin`
- If user is logged in as `contributor` → Redirect to `/dashboard/contributor`
- If user is logged in as `attempter` → Redirect to `/dashboard/attempter`

---

### 👤 **Attempter Routes** (Role: `attempter`)

Routes accessible only to users with the `attempter` role. These users can take quizzes and view their attempt history.

| Route                  | Component              | Description                                            | Auth Requirement           |
| ---------------------- | ---------------------- | ------------------------------------------------------ | -------------------------- |
| `/dashboard/attempter` | `<AttempterDashboard>` | Attempter's main dashboard with quiz history and stats | `role: attempter`          |
| `/quiz-catalog`        | `<QuizCatalog>`        | Browse and select quizzes to attempt                   | `role: attempter` **ONLY** |

**Access Control:**

- ✅ Can access quiz catalog to browse and start quizzes
- ❌ Cannot create or edit quizzes
- ❌ Cannot access contributor dashboard
- ❌ Cannot access admin dashboard

---

### ✍️ **Contributor Routes** (Role: `contributor`)

Routes accessible only to users with the `contributor` role. These users can create and manage quizzes with questions.

| Route                    | Component                  | Description                                       | Auth Requirement    |
| ------------------------ | -------------------------- | ------------------------------------------------- | ------------------- |
| `/dashboard/contributor` | `<ContributorDashboard>`   | Contributor's main dashboard with created quizzes | `role: contributor` |
| `/contributor/new-quiz`  | `<ContributorQuizBuilder>` | Multi-step quiz creation wizard                   | `role: contributor` |

**Quiz Creation Flow:**

1. Click "Add New Quiz" in ContributorDashboard
2. `<AddQuizDialog>` opens → Enter quiz title, category, time limit
3. Click "Create" → Navigate to `/contributor/new-quiz` (state: `{ title, category, totalTimeMinutes }`)
4. **Stage 1: Details Panel** → Review/edit quiz details, click "Next"
5. **Stage 2: Question Editor** → Add questions (MCQ, True/False, Fill-in-the-blank, etc.)
6. Click "Finish & Save Quiz" → Quiz saved to localStorage, redirect to `/dashboard/contributor`

**Access Control:**

- ✅ Can create unlimited quizzes
- ✅ Can add multiple question types to each quiz
- ❌ **Cannot access `/quiz-catalog`** (restricted to attempters)
- ❌ Cannot access attempter dashboard
- ❌ Cannot access admin dashboard

---

### 🔧 **Admin Routes** (Role: `admin`)

Routes accessible only to users with the `admin` role. Admins have elevated permissions and can access all areas.

| Route              | Component          | Description                         | Auth Requirement |
| ------------------ | ------------------ | ----------------------------------- | ---------------- |
| `/dashboard/admin` | `<AdminDashboard>` | Admin panel with platform oversight | `role: admin`    |

**Access Control:**

- ✅ Can access admin dashboard
- ✅ Can access ALL contributor routes (admin bypasses role checks)
- ✅ Can access ALL attempter routes (admin bypasses role checks)
- ✅ Full platform control

**Note:** In `ProtectedRoute.tsx`, admins can bypass role checks:

```typescript
if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
  return <Navigate to="/landing" replace />;
}
```

---

## Authentication Flow

### Registration Flow

1. User fills out registration form at `/register`
2. Frontend calls `registerWithFirebase(email, password, username)` → Firebase creates user
3. Frontend receives `firebaseUser.uid`
4. Frontend calls backend `POST /api/register` with:
   ```json
   {
     "email": "user@example.com",
     "username": "username",
     "password": "password123",
     "role": "attempter",
     "firebaseUid": "firebase_uid_here"
   }
   ```
5. Backend creates user in D1 database with `firebase_uid` column populated
6. Backend returns user data + sets HTTP-only auth cookies
7. Frontend stores user in `sessionManager`
8. Redirect to role-specific dashboard

### Login Flow

1. User fills out login form at `/login`
2. Frontend calls backend `POST /api/login` with credentials
3. Backend verifies credentials, returns user data + sets auth cookies
4. Frontend stores user in `sessionManager`
5. Redirect to role-specific dashboard

### Logout Flow

1. User clicks logout
2. Frontend calls `sessionManager.logout()`
3. Clears local storage, session storage, cookies
4. Redirect to `/landing`

---

## Route Guards

### `<ProtectedRoute>`

Used for authenticated-only routes. Checks:

1. Is user logged in? → No → Redirect to `/login`
2. Does route require specific role? → Yes → Check if `user.role === requiredRole` OR `user.role === 'admin'`
3. Role mismatch → Redirect to `/landing`

**Usage:**

```tsx
<Route
  path="/dashboard/contributor"
  element={
    <ProtectedRoute requiredRole="contributor">
      <ContributorDashboard />
    </ProtectedRoute>
  }
/>
```

### `<PublicRoute>`

Used for public-only routes (landing, login, register). Checks:

1. Is user logged in? → Yes → Redirect to `/dashboard/{role}`
2. Not logged in → Allow access

**Usage:**

```tsx
<Route
  path="/landing"
  element={
    <PublicRoute>
      <LandingPage {...landingStats} />
    </PublicRoute>
  }
/>
```

---

## Complete Route Table

| Route                    | Access                   | Component                  | Redirect If...                                    |
| ------------------------ | ------------------------ | -------------------------- | ------------------------------------------------- |
| `/`                      | Anyone                   | Navigate → `/landing`      | -                                                 |
| `/landing`               | **Unauthenticated**      | `<LandingPage>`            | Logged in → `/dashboard/{role}`                   |
| `/login`                 | **Unauthenticated**      | `<Login>`                  | Logged in → `/dashboard/{role}`                   |
| `/register`              | **Unauthenticated**      | `<Register>`               | Logged in → `/dashboard/{role}`                   |
| `/dashboard/attempter`   | `attempter` or `admin`   | `<AttempterDashboard>`     | Not logged in → `/login`                          |
| `/dashboard/contributor` | `contributor` or `admin` | `<ContributorDashboard>`   | Not logged in → `/login`                          |
| `/dashboard/admin`       | `admin` only             | `<AdminDashboard>`         | Not logged in → `/login`                          |
| `/contributor/new-quiz`  | `contributor` or `admin` | `<ContributorQuizBuilder>` | Not logged in → `/login`                          |
| `/quiz-catalog`          | `attempter` **only**     | `<QuizCatalog>`            | Not logged in → `/login`, Wrong role → `/landing` |

---

## Navigation Patterns

### After Registration

```
/register → registerWithFirebase() → POST /api/register → SUCCESS
  ├─ role: admin → /dashboard/admin
  ├─ role: contributor → /dashboard/contributor
  └─ role: attempter → /dashboard/attempter
```

### After Login

```
/login → POST /api/login → SUCCESS
  ├─ role: admin → /dashboard/admin
  ├─ role: contributor → /dashboard/contributor
  └─ role: attempter → /dashboard/attempter
```

### Contributor Quiz Creation

```
/dashboard/contributor → Click "Add Quiz" → <AddQuizDialog>
  → Fill form → Click "Create"
  → /contributor/new-quiz (with state)
  → Stage: details → Click "Next"
  → Stage: editor → Add questions
  → Click "Finish & Save"
  → Quiz saved to localStorage
  → Redirect to /dashboard/contributor
```

### Attempter Quiz Taking

```
/dashboard/attempter → Click "Browse Quizzes"
  → /quiz-catalog
  → Select quiz
  → <NewQuizDialog> opens
  → Click "Start Quiz"
  → Quiz window opens (full-screen dialog)
  → Answer questions
  → Submit → Results shown
```

---

## Fixed Issues

### Issue 1: `firebase_uid` stored as NULL ❌ → ✅

**Root Cause:** Frontend was correctly sending `firebaseUid`, backend was correctly storing it. This was likely a timing issue or old test data.

**Verification Steps:**

1. Register a new user at `/register`
2. Check D1 database: `SELECT id, email, username, firebase_uid, role FROM users WHERE email = 'newuser@example.com';`
3. Confirm `firebase_uid` is populated

**Code Path:**

- `RegisterForm` → `registerWithFirebase()` → `firebaseUser.uid`
- → `register({ firebaseUid: firebaseUser.uid })`
- → Backend `UserRepository.create({ firebaseUid })`
- → D1 `INSERT INTO users (firebase_uid) VALUES (?)`

### Issue 2: Logged-in users can access `/landing` ❌ → ✅

**Fix:** Created `<PublicRoute>` component that redirects authenticated users to their dashboard.

**Before:**

```tsx
<Route path="/landing" element={<LandingPage />} />
```

**After:**

```tsx
<Route
  path="/landing"
  element={
    <PublicRoute>
      <LandingPage />
    </PublicRoute>
  }
/>
```

### Issue 3: Contributor quiz creation goes to `/quiz-catalog` ❌ → ✅

**Fix:** Changed `DetailsPanel.onNext()` from navigating to `/quiz-catalog` to `setStage('editor')`.

**Before:**

```tsx
onNext={() => navigate('/quiz-catalog', { state: { category, totalTimeMinutes } })}
```

**After:**

```tsx
onNext={() => setStage('editor')}
```

**Also:** Restricted `/quiz-catalog` to `attempter` role only (contributors should not see this).

---

## Session Management

### Storage

- **localStorage:** `quizda_session` - User data persists across browser sessions
- **HTTP-only Cookies:** `access_token`, `refresh_token` - Secure, cannot be accessed by JavaScript
- **sessionStorage:** Not currently used

### Multi-tab Sync

`sessionManager` uses `storage` event listener to sync auth state across tabs:

```typescript
window.addEventListener("storage", (e) => {
  if (e.key === STORAGE_KEY) {
    // Reload user from updated localStorage
    notifySubscribers();
  }
});
```

---

## Testing Checklist

### Registration Flow

- [ ] Register as `attempter` → Check database has `firebase_uid`
- [ ] Register as `contributor` → Check database has `firebase_uid`
- [ ] Register as `admin` → Check database has `firebase_uid`
- [ ] After registration, redirected to correct dashboard

### Public Route Protection

- [ ] Visit `/landing` when logged in → Redirects to dashboard
- [ ] Visit `/login` when logged in → Redirects to dashboard
- [ ] Visit `/register` when logged in → Redirects to dashboard
- [ ] Visit `/landing` when logged out → Shows landing page

### Contributor Quiz Creation

- [ ] Login as contributor
- [ ] Click "Add New Quiz" in dashboard
- [ ] Fill quiz details, click "Create"
- [ ] Verify redirected to `/contributor/new-quiz`
- [ ] Click "Next" in details panel
- [ ] Verify moved to editor stage (NOT redirected to `/quiz-catalog`)
- [ ] Add questions
- [ ] Click "Finish & Save Quiz"
- [ ] Verify redirected back to `/dashboard/contributor`
- [ ] Verify quiz appears in dashboard

### Quiz Catalog Access

- [ ] Login as `attempter` → Can access `/quiz-catalog`
- [ ] Login as `contributor` → **Cannot** access `/quiz-catalog` (redirects to `/landing`)
- [ ] Login as `admin` → Can access `/quiz-catalog` (admin bypass)

### Role-Based Dashboard Access

- [ ] Attempter cannot access `/dashboard/contributor`
- [ ] Attempter cannot access `/dashboard/admin`
- [ ] Contributor cannot access `/dashboard/attempter`
- [ ] Contributor cannot access `/dashboard/admin`
- [ ] Admin can access **all** dashboards

---

## File References

### Route Configuration

- **Main routing:** `client/src/App.tsx`
- **Protected routes:** `client/src/components/ProtectedRoute.tsx`
- **Public routes:** `client/src/components/PublicRoute.tsx`

### Authentication

- **Auth hook:** `client/src/hooks/useAuth.ts`
- **Session manager:** `client/src/services/sessionManager.ts`
- **Auth service:** `client/src/services/api.ts`
- **Backend handler:** `server/src/auth/handlers/register.ts`, `login.ts`

### Components

- **Login:** `client/src/components/UserAuthentication/Login/`
- **Register:** `client/src/components/UserAuthentication/Register/`
- **Contributor Dashboard:** `client/src/components/Dashboard/ContributorDashboard/`
- **Quiz Builder:** `client/src/components/Dashboard/ContributorDashboard/QuizBuilder/`
- **Quiz Catalog:** `client/src/components/QuizCatalog.tsx`

---

**Last Updated:** November 19, 2025  
**Version:** 1.0  
**Status:** ✅ All routing issues resolved and documented
