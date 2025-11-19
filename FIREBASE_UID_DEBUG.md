# Firebase UID Null Debug Guide

## Issue Description
When registering a new user, the `firebase_uid` column in the D1 database is being stored as `NULL` instead of the Firebase UID from Firebase Authentication.

## Expected Behavior
1. User fills out registration form
2. Frontend calls `registerWithFirebase(email, password, username)`
3. Firebase creates user and returns `firebaseUser.uid` (e.g., `"abc123xyz456"`)
4. Frontend calls backend API with `firebaseUid: firebaseUser.uid`
5. Backend stores user in D1 with `firebase_uid = "abc123xyz456"`

## Actual Behavior
- `firebase_uid` column shows `NULL` in database
- User can login and use the app
- Other fields (email, username, role) are populated correctly

## Debug Steps

### Step 1: Check Frontend Firebase Integration
Open browser DevTools → Console, then register a new user and watch for:

```javascript
// In RegisterForm/index.tsx - Add console.log
const firebaseUser = await registerWithFirebase(
  form.email,
  form.password,
  form.username
)
console.log('🔥 Firebase User:', firebaseUser)
console.log('🔥 Firebase UID:', firebaseUser.uid)
```

**Expected Output:**
```
🔥 Firebase User: { uid: "abc123xyz456", email: "test@example.com", ... }
🔥 Firebase UID: abc123xyz456
```

**If `firebaseUser.uid` is undefined:**
- Check Firebase console → Authentication → Users
- Verify user was created in Firebase
- Check Firebase config in `.env` file

### Step 2: Check Backend Request Payload
In browser DevTools → Network tab:

1. Register new user
2. Find `POST /api/register` request
3. Click → Request Payload

**Expected Payload:**
```json
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "Password123!",
  "role": "attempter",
  "firebaseUid": "abc123xyz456"  ← Should be present!
}
```

**If `firebaseUid` is missing from payload:**
- Check `RegisterForm/index.tsx` line 47-53
- Verify `firebaseUid: firebaseUser.uid` is included in `register()` call

### Step 3: Check Backend Logs
In Cloudflare Workers dashboard or local wrangler dev:

```bash
# For local development
cd server
npx wrangler dev

# Look for this log in handleRegister
console.log('Registration input:', input)
```

**Expected Log:**
```
Registration input: {
  email: "test@example.com",
  username: "testuser",
  password: "Password123!",
  role: "attempter",
  firebaseUid: "abc123xyz456"  ← Should be present!
}
```

**If `firebaseUid` is missing:**
- Request is malformed or intercepted
- Check middleware (CORS, body parser)

### Step 4: Check Database Insert
Add logging to `UserRepository.create()`:

```typescript
// In server/src/repositories/UserRepository.ts
async create(data: CreateUserDTO & { passwordHash?: string | null }): Promise<User> {
  console.log('🗄️ Creating user with data:', {
    email: data.email,
    username: data.username,
    role: data.role,
    firebaseUid: data.firebaseUid,  // Should be populated!
  })
  
  const result = await this.db
    .insert(users)
    .values({
      firebaseUid: data.firebaseUid || null,  // Check this value
      email: data.email,
      username: data.username,
      role: data.role,
      passwordHash: data.passwordHash || null,
    })
    .returning()
    .get();

  console.log('🗄️ Created user:', result)
  return result as User;
}
```

**Expected Log:**
```
🗄️ Creating user with data: {
  email: "test@example.com",
  username: "testuser",
  role: "attempter",
  firebaseUid: "abc123xyz456"  ← Should be populated!
}
🗄️ Created user: {
  id: 123,
  firebase_uid: "abc123xyz456",  ← Should be populated!
  email: "test@example.com",
  ...
}
```

### Step 5: Check Database Schema
Verify the D1 database schema is correct:

```bash
# Connect to D1 database
cd server
npx wrangler d1 execute quizda-d1-db --local --command="SELECT sql FROM sqlite_master WHERE type='table' AND name='users';"
```

**Expected Schema:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firebase_uid TEXT UNIQUE,  ← Should be TEXT, not INTEGER
  email TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

**If `firebase_uid` column doesn't exist or has wrong type:**
- Run migrations: `npm run db:migrate`
- Check `server/drizzle/` for migration files

### Step 6: Check Existing Database Records
Query the database to see what's stored:

```bash
npx wrangler d1 execute quizda-d1-db --local --command="SELECT id, email, username, firebase_uid, role FROM users ORDER BY id DESC LIMIT 5;"
```

**Expected Output:**
```
┌────┬─────────────────────┬──────────┬─────────────────┬───────────┐
│ id │ email               │ username │ firebase_uid    │ role      │
├────┼─────────────────────┼──────────┼─────────────────┼───────────┤
│ 5  │ test@example.com    │ testuser │ abc123xyz456    │ attempter │
└────┴─────────────────────┴──────────┴─────────────────┴───────────┘
```

**If all `firebase_uid` values are NULL:**
- Issue is in the data flow (see steps 1-4)
- Check if old test data before the fix

**If new records have `firebase_uid` but old ones don't:**
- This is expected! Old test data was created before the fix
- Create a new user to verify the fix works

## Common Issues

### Issue 1: Firebase Config Missing
**Symptom:** `firebaseUser.uid` is undefined

**Fix:** Check `client/.env`:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Issue 2: Frontend Not Awaiting Firebase Registration
**Symptom:** Backend receives request before Firebase finishes

**Fix:** Ensure `await` is used:
```typescript
const firebaseUser = await registerWithFirebase(...)  // Must await!
const response = await register({ firebaseUid: firebaseUser.uid })
```

### Issue 3: Backend Validation Rejecting firebaseUid
**Symptom:** 400 error with "Email and username are required"

**Fix:** Check `server/src/auth/validation.ts` line 34-48:
```typescript
// At least one authentication method must be provided
if (!input.password && !input.firebaseUid) {
  return {
    isValid: false,
    error: "Either password or firebaseUid must be provided",
    role: "attempter",
  };
}
```

This should allow either password OR firebaseUid (not both required).

### Issue 4: Old Test Data
**Symptom:** Old users have NULL, new users work fine

**This is expected!** Old test data was created before the fix. Delete old test users or migrate them:

```sql
-- Delete old test users
DELETE FROM users WHERE firebase_uid IS NULL;

-- Or update them with fake Firebase UIDs
UPDATE users SET firebase_uid = 'legacy_' || id WHERE firebase_uid IS NULL;
```

## Verification Steps After Fix

### Test 1: Register New User via Firebase
1. Clear localStorage: `localStorage.clear()`
2. Go to `/register`
3. Fill form with:
   - Email: `newuser@test.com`
   - Username: `newuser123`
   - Password: `Test1234!`
   - Role: `Attempter`
4. Click "Register"
5. Check database:
```bash
npx wrangler d1 execute quizda-d1-db --local --command="SELECT id, email, firebase_uid FROM users WHERE email='newuser@test.com';"
```
6. Verify `firebase_uid` is **NOT NULL**

### Test 2: Login with Firebase UID
1. Logout
2. Login with the email/password from Test 1
3. Verify you can access `/dashboard/attempter`
4. Check browser localStorage → `quizda_session` → should have `firebaseUid` field

### Test 3: Multi-Device Sync
1. Login on one browser tab
2. Open another tab (same browser)
3. Both tabs should show user as logged in
4. Logout on one tab → both tabs should logout

## Code References

### Frontend
- **Registration Form:** `client/src/components/UserAuthentication/Register/RegisterForm/index.tsx` (line 38-53)
- **Firebase Service:** `client/src/services/firebase.ts` (line 27-44)
- **Auth Hook:** `client/src/hooks/useAuth.ts` (line 49-64)

### Backend
- **Register Handler:** `server/src/auth/handlers/register.ts` (line 9-48)
- **Validation:** `server/src/auth/validation.ts` (line 26-90)
- **Auth Service:** `server/src/services/AuthenticationService.ts` (line 23-64)
- **User Repository:** `server/src/repositories/UserRepository.ts` (line 54-72)
- **Database Schema:** `server/src/db/schema.ts` (line 7)

## Current Code Status

✅ **Frontend correctly sends `firebaseUid`:**
```typescript
// RegisterForm/index.tsx
const response = await register({
  email: form.email,
  username: form.username,
  password: form.password,
  role: form.role,
  firebaseUid: firebaseUser.uid,  // ✅ Included
})
```

✅ **Backend correctly accepts `firebaseUid`:**
```typescript
// validation.ts
if (!input.password && !input.firebaseUid) {
  return { isValid: false, error: "Either password or firebaseUid must be provided" }
}
// ✅ Validation allows firebaseUid OR password
```

✅ **Backend correctly stores `firebaseUid`:**
```typescript
// UserRepository.ts
await this.db.insert(users).values({
  firebaseUid: data.firebaseUid || null,  // ✅ Stored
  email: data.email,
  username: data.username,
  role: data.role,
  passwordHash: data.passwordHash || null,
})
```

## Conclusion

If you're still seeing `firebase_uid` as NULL:

1. **Most likely:** You're looking at OLD test data created before the fix
   - Solution: Register a NEW user and check that user's `firebase_uid`

2. **Check Firebase config:** Ensure `.env` has correct Firebase credentials

3. **Check browser console:** Look for errors during registration

4. **Add logging:** Add `console.log` statements in steps 1-4 above to trace the data flow

5. **Check production vs local:** Ensure you're testing against the correct environment

**Next Action:** Register a brand new user and immediately check the database. If that user has a `firebase_uid`, the fix is working! Old users with NULL can be safely deleted or ignored.
