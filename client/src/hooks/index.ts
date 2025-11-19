/**
 * Hooks Barrel Export
 *
 * Centralized export for all custom hooks.
 */

// Legacy hooks (still available for gradual migration)
export { useQuizzes } from './useQuizzes';
export { useAuth } from './useAuth';
export { useUserStatistics, usePlatformStatistics, useRecentPerformance } from './useStatistics';

// New Redux-based hooks (recommended)
export { useCategories } from './useCategories';
export { useReduxQuizzes } from './useReduxQuizzes';
export { useReduxAuth } from './useReduxAuth';
export { useReduxUI } from './useReduxUI';
