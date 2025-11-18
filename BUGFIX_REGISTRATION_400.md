# 🐛 Bug Fix: Registration 400 Error

## Issue Summary

**Error**: POST https://quizda-worker-prod.b-jairam0512.workers.dev/api/register returns 400
**Response**: `{ "error": "Email, username, and firebaseUid are required" }`

---

## Root Cause Analysis

### The Problem

The registration flow was broken due to a mismatch between frontend and backend expectations:

1. **Frontend (RegisterForm.tsx)** was sending:
   ```json
   {
     "email": "user@example.com",
     "username": "username",
     "password": "password123",
     "role": "attempter"
   }
   ```
   ❌ **Missing**: `firebaseUid`

2. **Backend (validation.ts)** was requiring:
   ```typescript
   if (!input.email || !input.username || !input.firebaseUid) {
     return { isValid: false, error: "Email, username, and firebaseUid are required" }
   }
   ```
   ❌ **Incorrectly enforcing**: `firebaseUid` as mandatory

3. **Backend (DTOs)** actually defined:
   ```typescript
   export interface CreateUserDTO {
     firebaseUid?: string;  // ← Optional!
     email: string;
     username: string;
     password?: string;
     role: "admin" | "contributor" | "attempter";
   }
   ```
   ✅ **Correct**: `firebaseUid` is optional

### Why This Happened

The code was refactored to use `AuthService.register()` directly, removing the Firebase registration step. This broke the flow because:

1. **Old working flow**:
   - Call `registerWithFirebase()` → get `firebaseUid`
   - Call backend with `firebaseUid`

2. **New broken flow**:
   - ❌ Skip Firebase registration
   - Call backend without `firebaseUid` → 400 error

---

## Fixes Applied

### Fix 1: Backend Validation (validation.ts)

**Before** (Incorrect):
```typescript
export type RegisterInput = {
  email: string;
  password?: string;
  username: string;
  role?: string;
  firebaseUid: string;  // ❌ Required (wrong!)
};

export function validateRegisterInput(input: any) {
  if (!input.email || !input.username || !input.firebaseUid) {  // ❌ Forces firebaseUid
    return {
      isValid: false,
      error: "Email, username, and firebaseUid are required",
      role: "attempter",
    };
  }
  // ...
}
```

**After** (Correct):
```typescript
export type RegisterInput = {
  email: string;
  password?: string;
  username: string;
  role?: string;
  firebaseUid?: string;  // ✅ Optional (correct!)
};

export function validateRegisterInput(input: any) {
  // Email and username are required
  // FirebaseUid is optional (only for Firebase auth)
  // Password is optional (only for password-based auth)
  if (!input.email || !input.username) {  // ✅ Only require email & username
    return {
      isValid: false,
      error: "Email and username are required",
      role: "attempter",
    };
  }

  // At least one authentication method must be provided
  if (!input.password && !input.firebaseUid) {  // ✅ Require either password OR firebaseUid
    return {
      isValid: false,
      error: "Either password or firebaseUid must be provided",
      role: "attempter",
    };
  }
  // ...
}
```

### Fix 2: Frontend Registration (RegisterForm/index.tsx)

**Before** (Broken):
```tsx
const onSubmit = async (ev: React.FormEvent) => {
  // ...
  
  // ❌ No Firebase registration - missing firebaseUid
  const response = await register({
    email: form.email,
    username: form.username,
    password: form.password,
    role: form.role,
  })
  
  // ...
}
```

**After** (Fixed):
```tsx
import { registerWithFirebase } from '../../../../services/firebase'  // ✅ Import Firebase

const onSubmit = async (ev: React.FormEvent) => {
  // ...
  
  try {
    // Step 1: Register with Firebase to get firebaseUid
    const firebaseUser = await registerWithFirebase(
      form.email,
      form.password,
      form.username
    )

    // Step 2: Register in backend with firebaseUid
    const response = await register({
      email: form.email,
      username: form.username,
      password: form.password,
      role: form.role,
      firebaseUid: firebaseUser.uid,  // ✅ Include firebaseUid from Firebase
    })
    
    // ...
  } catch (err: any) {
    notify(err?.message || 'Registration failed.', { severity: 'error' })
  }
}
```

---

## Verification Across All Pages

### Pages Checked ✅

1. **Register Page** (`RegisterForm/index.tsx`) - ✅ Fixed
2. **Login Page** (`LoginForm.tsx`) - ✅ No issues (only sends email + password)
3. **Edit Profile** - ✅ Does not exist in codebase
4. **Onboarding** - ✅ Does not exist in codebase

### API Calls Verified ✅

- ✅ No direct `apiClient.post()` or `apiClient.put()` calls in components
- ✅ All API calls go through `AuthService` abstraction layer
- ✅ `AuthService.register()` correctly passes all fields to backend
- ✅ `AuthService.login()` correctly sends email + password

---

## Test Plan

### 1. Test Registration Flow

**Steps**:
1. Navigate to `/register`
2. Fill in registration form:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `SecurePassword123!`
   - Role: `attempter`
3. Click "Register"

**Expected Result**:
- ✅ Firebase creates user with `uid`
- ✅ Backend receives: `{ email, username, password, role, firebaseUid }`
- ✅ Backend validates successfully
- ✅ User created in database
- ✅ HTTP-only cookies set
- ✅ Redirect to `/dashboard/attempter`

**Verify**:
```bash
# Check browser DevTools → Network tab → POST /api/register
# Request Payload should include:
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "SecurePassword123!",
  "role": "attempter",
  "firebaseUid": "firebase-generated-uid"
}

# Response should be:
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "role": "attempter"
  }
}
```

### 2. Test Login Flow

**Steps**:
1. Navigate to `/login`
2. Fill in login form:
   - Email: `test@example.com`
   - Password: `SecurePassword123!`
3. Click "Sign In"

**Expected Result**:
- ✅ Backend receives: `{ email, password }`
- ✅ Backend validates successfully
- ✅ HTTP-only cookies set
- ✅ Redirect to role-based dashboard

### 3. Test Backend Validation

**Test Case 1**: Missing email
```bash
curl -X POST https://quizda-worker-prod.b-jairam0512.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'

# Expected: 400 "Email and username are required"
```

**Test Case 2**: Missing username
```bash
curl -X POST https://quizda-worker-prod.b-jairam0512.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "test123"}'

# Expected: 400 "Email and username are required"
```

**Test Case 3**: Missing both password AND firebaseUid
```bash
curl -X POST https://quizda-worker-prod.b-jairam0512.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "username": "test"}'

# Expected: 400 "Either password or firebaseUid must be provided"
```

**Test Case 4**: Valid with password (no firebaseUid)
```bash
curl -X POST https://quizda-worker-prod.b-jairam0512.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "username": "test", "password": "test123"}'

# Expected: 201 Created (or 400 if user exists)
```

**Test Case 5**: Valid with firebaseUid (no password)
```bash
curl -X POST https://quizda-worker-prod.b-jairam0512.workers.dev/api/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "username": "test", "firebaseUid": "test-uid"}'

# Expected: 201 Created (or 400 if user exists)
```

---

## Deployment Checklist

- [x] Backend validation updated
- [x] Frontend registration flow restored
- [x] TypeScript errors resolved
- [x] All pages verified
- [ ] Deploy backend to Cloudflare Workers
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Test registration in production
- [ ] Test login in production

---

## Summary

| Component | Status | Change |
|-----------|--------|--------|
| Backend Validation | ✅ Fixed | Made `firebaseUid` optional, require either password OR firebaseUid |
| Frontend RegisterForm | ✅ Fixed | Restored Firebase registration step to get `firebaseUid` |
| Backend DTOs | ✅ Correct | Already had `firebaseUid` as optional |
| Backend Service | ✅ Correct | Already handled `firebaseUid` as optional |
| Login Flow | ✅ No Change | Already working correctly |
| Other Pages | ✅ Verified | No other pages with registration/auth forms |

**Root Cause**: Validation layer enforced `firebaseUid` as required when it should be optional  
**Solution**: Made validation match DTOs (optional `firebaseUid`) + restored Firebase registration in frontend  
**Result**: Registration now works with proper Firebase integration

