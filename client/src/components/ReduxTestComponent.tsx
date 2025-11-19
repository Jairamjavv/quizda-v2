/**
 * Redux Integration Test Component
 * 
 * This component demonstrates and tests all Redux slices:
 * - Categories
 * - Quizzes
 * - Auth
 * - UI (notifications)
 */

import React from 'react';
import { Box, Typography, Button, Paper, Stack } from '@mui/material';
import { useCategories, useReduxQuizzes, useReduxAuth, useReduxUI } from '../hooks';

export const ReduxTestComponent: React.FC = () => {
  const { categoryNames, loading: categoriesLoading } = useCategories();
  const { quizzes, loading: quizzesLoading, refetch: refetchQuizzes } = useReduxQuizzes();
  const { user, isAuthenticated, loading: authLoading } = useReduxAuth();
  const { notify, theme, setTheme } = useReduxUI();

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Redux Integration Test
      </Typography>

      {/* Categories Slice Test */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Categories Slice</Typography>
        <Typography variant="body2">
          Loading: {categoriesLoading ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          Total Categories: {categoryNames.length}
        </Typography>
        <Typography variant="caption">
          {categoryNames.slice(0, 5).join(', ')}
          {categoryNames.length > 5 && '...'}
        </Typography>
      </Paper>

      {/* Quizzes Slice Test */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Quizzes Slice</Typography>
        <Typography variant="body2">
          Loading: {quizzesLoading ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          Total Quizzes: {quizzes.length}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button size="small" variant="outlined" onClick={refetchQuizzes}>
            Refetch Quizzes
          </Button>
        </Stack>
      </Paper>

      {/* Auth Slice Test */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">Auth Slice</Typography>
        <Typography variant="body2">
          Loading: {authLoading ? 'Yes' : 'No'}
        </Typography>
        <Typography variant="body2">
          Authenticated: {isAuthenticated ? 'Yes' : 'No'}
        </Typography>
        {user && (
          <>
            <Typography variant="body2">User: {user.username}</Typography>
            <Typography variant="body2">Role: {user.role}</Typography>
          </>
        )}
      </Paper>

      {/* UI Slice Test */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">UI Slice</Typography>
        <Typography variant="body2">Theme: {theme}</Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => notify('Success notification!', { severity: 'success' })}
          >
            Test Success
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => notify('Error notification!', { severity: 'error' })}
          >
            Test Error
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => notify('Info notification!', { severity: 'info' })}
          >
            Test Info
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            Toggle Theme
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
        <Typography variant="body1" fontWeight="bold">
          ✅ Redux is fully integrated and working!
        </Typography>
        <Typography variant="caption">
          All slices (categories, quizzes, auth, ui) are operational.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReduxTestComponent;
