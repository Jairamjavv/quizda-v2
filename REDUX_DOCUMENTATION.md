# Redux Integration Documentation

## Overview

The application now uses Redux Toolkit for centralized state management across the entire frontend. This replaces scattered local state and context-based solutions with a unified, predictable state management system.

## Architecture

### Redux Store Structure

```
store/
├── index.ts                    # Store configuration
├── hooks.ts                    # Typed Redux hooks (useAppDispatch, useAppSelector)
└── slices/
    ├── categoriesSlice.ts     # Category management
    ├── quizzesSlice.ts        # Quiz data management
    ├── authSlice.ts           # Authentication state
    └── uiSlice.ts             # UI state (notifications, theme, etc.)
```

## Slices

### 1. Categories Slice (`categoriesSlice.ts`)

**State:**
- `categories`: Full category objects from API
- `categoryNames`: Array of category name strings
- `loading`: Fetch status
- `error`: Error messages
- `lastFetched`: Cache timestamp

**Actions:**
- `fetchCategories()`: Async thunk to fetch from `/api/categories`
- `clearCategoriesError()`: Clear error state

**Hook:** `useCategories()`
- Auto-fetches on mount if cache is stale (5 min)
- Returns: `{ categories, categoryNames, loading, error, refetch }`

### 2. Quizzes Slice (`quizzesSlice.ts`)

**State:**
- `quizzes`: Array of quiz objects
- `selectedQuiz`: Currently selected quiz
- `loading`: Operation status
- `error`: Error messages
- `lastFetched`: Cache timestamp

**Actions:**
- `fetchQuizzes()`: Fetch all quizzes with fallback to local storage
- `saveQuiz(quiz)`: Save new quiz
- `updateQuiz({ quizId, updates })`: Update existing quiz
- `deleteQuiz(quizId)`: Delete quiz
- `setSelectedQuiz(quiz)`: Set currently selected quiz
- `clearSelectedQuiz()`: Clear selection

**Hook:** `useReduxQuizzes()`
- Auto-fetches on mount if cache is stale (5 min)
- Returns: `{ quizzes, selectedQuiz, loading, error, refetch, saveQuiz, updateQuiz, deleteQuiz }`

### 3. Auth Slice (`authSlice.ts`)

**State:**
- `user`: Current user object or null
- `isAuthenticated`: Boolean authentication status
- `loading`: Operation status
- `error`: Error messages

**Actions:**
- `login(credentials)`: Login with email/password
- `register(data)`: Register new user
- `logout()`: Logout current user
- `getCurrentUser()`: Fetch current user from server
- `refreshAuth()`: Refresh authentication state
- `syncSessionManager(state)`: Sync with sessionManager

**Hook:** `useReduxAuth()`
- Auto-fetches current user on mount
- Syncs with sessionManager for multi-tab support
- Returns: `{ user, isAuthenticated, loading, error, login, register, logout, refreshAuth, getCurrentUser }`

**Integration with SessionManager:**
- Redux auth slice works alongside the existing sessionManager
- sessionManager handles HTTP-only cookies, token refresh, and multi-tab sync
- Redux provides predictable state updates and DevTools support

### 4. UI Slice (`uiSlice.ts`)

**State:**
- `notification`: Current notification state
  - `message`: Notification text
  - `severity`: 'success' | 'error' | 'info' | 'warning'
  - `duration`: Display duration in ms
  - `open`: Visibility state
- `sidebarOpen`: Sidebar visibility
- `theme`: 'light' | 'dark'

**Actions:**
- `showNotification({ message, severity?, duration? })`: Display notification
- `hideNotification()`: Hide current notification
- `toggleSidebar()`: Toggle sidebar
- `setSidebarOpen(boolean)`: Set sidebar state
- `setTheme('light' | 'dark')`: Set theme

**Hook:** `useReduxUI()`
- Returns: `{ notification, sidebarOpen, theme, notify, hideNotification, toggleSidebar, setSidebarOpen, setTheme }`

## Custom Hooks

All Redux slices have corresponding custom hooks in `client/src/hooks/`:

- `useCategories.ts` - Category management
- `useReduxQuizzes.ts` - Quiz management (replaces old `useQuizzes`)
- `useReduxAuth.ts` - Authentication (replaces old `useAuth`)
- `useReduxUI.ts` - UI state management

## Migration Guide

### Before (Local State):
```tsx
import { useState, useEffect } from 'react';
import { QuizService } from '../services';

const Component = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await QuizService.getAllQuizzes();
      setQuizzes(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  // ... rest of component
};
```

### After (Redux):
```tsx
import { useReduxQuizzes } from '../hooks';

const Component = () => {
  const { quizzes, loading } = useReduxQuizzes();

  // Data automatically fetched and cached
  // No manual state management needed
};
```

### Notifications Before (Context):
```tsx
import { useNotification } from '../context/NotificationContext';

const Component = () => {
  const notify = useNotification();

  const handleSuccess = () => {
    notify('Success!', { severity: 'success' });
  };
};
```

### Notifications After (Redux):
```tsx
import { useReduxUI } from '../hooks';

const Component = () => {
  const { notify } = useReduxUI();

  const handleSuccess = () => {
    notify('Success!', { severity: 'success' });
  };
};
```

## Benefits

1. **Centralized State**: All application state in one predictable location
2. **DevTools Support**: Redux DevTools for debugging and time-travel
3. **Automatic Caching**: Built-in cache with configurable TTL (5 minutes default)
4. **Type Safety**: Full TypeScript support with typed hooks
5. **Multi-tab Sync**: Auth state syncs across tabs via sessionManager
6. **Error Handling**: Consistent error handling across all slices
7. **Loading States**: Automatic loading state management
8. **Backwards Compatible**: Legacy hooks still work during migration

## Testing

A comprehensive test component is available at:
`client/src/components/ReduxTestComponent.tsx`

This component demonstrates:
- Category fetching
- Quiz operations
- Auth status
- Notification system
- Theme switching

## Best Practices

1. **Use Custom Hooks**: Always use the custom hooks (`useCategories`, `useReduxQuizzes`, etc.) instead of raw Redux hooks
2. **Avoid Direct Dispatch**: Let the custom hooks handle dispatching
3. **Handle Loading States**: Always check `loading` before using data
4. **Error Boundaries**: Wrap components in error boundaries to catch Redux errors
5. **Cache Awareness**: Data is cached for 5 minutes; use `refetch()` to force refresh

## Performance

- **Code Splitting**: Redux slices are lazy-loaded
- **Selective Re-renders**: Components only re-render when their selected state changes
- **Memoization**: Selectors use shallow equality checks
- **Bundle Size**: +5.2KB gzipped (Redux Toolkit + React-Redux)

## Future Enhancements

- [ ] Persist selected slices to localStorage (categories, theme, sidebar state)
- [ ] Add attempts slice for quiz attempt history
- [ ] Add statistics slice for dashboard data
- [ ] Implement optimistic updates for better UX
- [ ] Add undo/redo functionality using Redux DevTools
