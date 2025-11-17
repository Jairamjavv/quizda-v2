/**
 * Badge Component - Atomic Design (Atom)
 * 
 * Reusable badge/chip component for tags, labels, and status indicators.
 */

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { spacing, borderRadius, typography } from '../../../theme/constants';
import { designTokens } from '../../../theme/designTokens';

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
  const getVariantStyles = () => {
    const lightTokens = designTokens.light;

    switch (variant) {
      case 'success':
        return {
          bgcolor: lightTokens.primaryGreenLight,
          color: lightTokens.primaryGreenDark,
          border: `1px solid ${lightTokens.primaryGreen}`,
        };
      case 'warning':
        return {
          bgcolor: lightTokens.primaryOrangeLight,
          color: lightTokens.primaryOrangeDark,
          border: `1px solid ${lightTokens.warning}`,
        };
      case 'error':
        return {
          bgcolor: '#FFE5E5',
          color: lightTokens.error,
          border: `1px solid ${lightTokens.error}`,
        };
      case 'info':
        return {
          bgcolor: '#E5F2FF',
          color: lightTokens.accentBlue,
          border: `1px solid ${lightTokens.accentBlue}`,
        };
      case 'primary':
        return {
          bgcolor: lightTokens.primaryGreen,
          color: '#fff',
        };
      case 'secondary':
        return {
          bgcolor: lightTokens.primaryOrange,
          color: '#fff',
        };
      default:
        return {
          bgcolor: 'var(--surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--surface-hover)',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: '20px',
          fontSize: typography.fontSize.xs,
          '& .MuiChip-label': {
            padding: `0 ${spacing.xs}`,
          },
        };
      case 'lg':
        return {
          height: '32px',
          fontSize: typography.fontSize.md,
          '& .MuiChip-label': {
            padding: `0 ${spacing.md}`,
          },
        };
      case 'md':
      default:
        return {
          height: '24px',
          fontSize: typography.fontSize.sm,
          '& .MuiChip-label': {
            padding: `0 ${spacing.sm}`,
          },
        };
    }
  };

  return (
    <Chip
      label={label || children}
      sx={{
        borderRadius: borderRadius.sm,
        fontWeight: typography.fontWeight.medium,
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Badge;
