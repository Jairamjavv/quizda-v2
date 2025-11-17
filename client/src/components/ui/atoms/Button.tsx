/**
 * Button Component - Atomic Design (Atom)
 * 
 * Reusable button component with consistent styling across the app.
 */

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { designTokens } from '../../../theme/designTokens';
import { spacing, borderRadius, transitions } from '../../../theme/constants';

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
  const getVariantStyles = () => {
    const lightTokens = designTokens.light;
    const darkTokens = designTokens.dark;

    switch (variant) {
      case 'primary':
        return {
          bgcolor: 'var(--primary-green)',
          color: '#fff',
          '&:hover': {
            bgcolor: lightTokens.primaryGreenDark,
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        };
      case 'secondary':
        return {
          bgcolor: 'var(--primary-orange)',
          color: '#fff',
          '&:hover': {
            bgcolor: lightTokens.primaryOrangeDark,
          },
          '&:active': {
            transform: 'scale(0.98)',
          },
        };
      case 'outline':
        return {
          bgcolor: 'transparent',
          color: 'var(--primary-green)',
          border: '2px solid var(--primary-green)',
          '&:hover': {
            bgcolor: 'var(--primary-green-light)',
          },
        };
      case 'ghost':
        return {
          bgcolor: 'transparent',
          color: 'var(--text-primary)',
          '&:hover': {
            bgcolor: 'var(--surface-hover)',
          },
        };
      case 'danger':
        return {
          bgcolor: lightTokens.error,
          color: '#fff',
          '&:hover': {
            bgcolor: '#a33838',
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
          height: '32px',
          padding: `0 ${spacing.md}`,
          fontSize: '14px',
        };
      case 'lg':
        return {
          height: '48px',
          padding: `0 ${spacing.lg}`,
          fontSize: '18px',
        };
      case 'md':
      default:
        return {
          height: '40px',
          padding: `0 ${spacing.lg}`,
          fontSize: '16px',
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
        borderRadius: borderRadius.md,
        textTransform: 'none',
        fontWeight: 600,
        transition: transitions.fast,
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
