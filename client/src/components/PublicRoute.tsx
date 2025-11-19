/**
 * Public Route Component
 * Redirects authenticated users to their role-specific dashboard
 * Allows unauthenticated users to access public pages (login, register, landing)
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CircularProgress, Box } from '@mui/material';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect authenticated users to their dashboard
  if (user) {
    const dashboardPath = `/dashboard/${user.role}`;
    return <Navigate to={dashboardPath} replace />;
  }

  // Allow unauthenticated users to view public pages
  return <>{children}</>;
};

export default PublicRoute;
