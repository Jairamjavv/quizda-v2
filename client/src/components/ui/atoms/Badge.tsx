/**
 * Badge Component - Atomic Design (Atom)
 * 
 * Reusable badge/chip component built on MUI Chip with theme-based styling.
 * Uses MUI theme palette - NO hardcoded colors!
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

export interface BadgeProps extends Omit<ChipProps, 'size' | 'color' | 'variant' | 'children'> {
  /** Badge variant */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  /** Badge size */
  size?: 'sm' | 'md' | 'lg';
  /** Badge content (text or React node) */
  children?: React.ReactNode;
  /** Badge label - alternative to children */
  label?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  label,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bgcolor: 'success.light',
          color: 'success.dark',
          border: 1,
          borderColor: 'success.main',
        };
      case 'warning':
        return {
          bgcolor: 'warning.light',
          color: 'warning.dark',
          border: 1,
          borderColor: 'warning.main',
        };
      case 'error':
        return {
          bgcolor: 'error.light',
          color: 'error.main',
          border: 1,
          borderColor: 'error.main',
        };
      case 'info':
        return {
          bgcolor: 'info.light',
          color: 'info.dark',
          border: 1,
          borderColor: 'info.main',
        };
      case 'primary':
        return {
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        };
      case 'secondary':
        return {
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
        };
      default:
        return {
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: 1,
          borderColor: theme.palette.mode === 'light'
            ? theme.palette.grey[300]
            : theme.palette.grey[700],
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: theme.spacing(2.5),
          fontSize: theme.typography.caption.fontSize,
          '& .MuiChip-label': {
            px: theme.spacing(1),
          },
        };
      case 'lg':
        return {
          height: theme.spacing(4),
          fontSize: theme.typography.body1.fontSize,
          '& .MuiChip-label': {
            px: theme.spacing(2),
          },
        };
      case 'md':
      default:
        return {
          height: theme.spacing(3),
          fontSize: theme.typography.body2.fontSize,
          '& .MuiChip-label': {
            px: theme.spacing(1.5),
          },
        };
    }
  };

  return (
    <Chip
      label={label || children}
      sx={{
        borderRadius: theme.shape.borderRadius / 1.5,
        fontWeight: theme.typography.fontWeightMedium,
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Badge;
