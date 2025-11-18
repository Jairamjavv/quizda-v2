/**
 * Button Component - Atomic Design (Atom)
 * 
 * Reusable button component built on MUI Button with theme-based styling.
 * Uses MUI theme palette - NO hardcoded colors!
 */

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'size' | 'variant'> {
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Icon before text */
  startIcon?: React.ReactNode;
  /** Icon after text */
  endIcon?: React.ReactNode;
  /** For React Router Link compatibility */
  to?: string;
  /** Component to use (e.g., Link from react-router-dom) */
  component?: React.ElementType;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        };
      case 'secondary':
        return {
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          '&:hover': {
            bgcolor: 'secondary.dark',
          },
        };
      case 'outline':
        return {
          bgcolor: 'transparent',
          color: 'primary.main',
          border: 2,
          borderColor: 'primary.main',
          '&:hover': {
            bgcolor: 'primary.light',
            borderColor: 'primary.dark',
          },
        };
      case 'ghost':
        return {
          bgcolor: 'transparent',
          color: 'text.primary',
          '&:hover': {
            bgcolor: theme.palette.mode === 'light' 
              ? theme.palette.grey[100]
              : theme.palette.grey[800],
          },
        };
      case 'danger':
        return {
          bgcolor: 'error.main',
          color: 'error.contrastText',
          '&:hover': {
            bgcolor: 'error.dark',
          },
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          minHeight: theme.spacing(4),
          px: theme.spacing(1.5),
          fontSize: theme.typography.body2.fontSize,
        };
      case 'lg':
        return {
          minHeight: theme.spacing(6),
          px: theme.spacing(3),
          fontSize: theme.typography.h6.fontSize,
        };
      case 'md':
      default:
        return {
          minHeight: theme.spacing(5),
          px: theme.spacing(2),
          fontSize: theme.typography.body1.fontSize,
        };
    }
  };

  return (
    <MuiButton
      disabled={disabled || loading}
      disableElevation
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
      endIcon={endIcon}
      sx={{
        borderRadius: theme.shape.borderRadius / 8,
        textTransform: 'none',
        fontWeight: 600,
        transition: 'all 0.2s ease-in-out',
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button;
