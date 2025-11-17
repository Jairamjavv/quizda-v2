/**
 * Card Component - Atomic Design (Molecule)
 * 
 * Reusable card container with consistent styling.
 */

import React from 'react';
import { Paper, PaperProps, Box } from '@mui/material';
import { spacing, borderRadius, shadows } from '../../../theme/constants';
import { Text } from '../atoms';

export interface CardProps extends Omit<PaperProps, 'elevation'> {
  /** Card padding size */
  padding?: 'sm' | 'md' | 'lg' | 'none';
  /** Card shadow */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Card title */
  title?: string;
  /** Title action (e.g., button, icon) */
  titleAction?: React.ReactNode;
  /** Card subtitle */
  subtitle?: string;
  /** Hoverable effect */
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  padding = 'md',
  shadow = 'sm',
  title,
  titleAction,
  subtitle,
  hoverable = false,
  children,
  sx,
  ...props
}) => {
  const getPaddingValue = () => {
    switch (padding) {
      case 'sm':
        return spacing.md;
      case 'lg':
        return spacing.xl;
      case 'none':
        return '0';
      case 'md':
      default:
        return spacing.lg;
    }
  };

  const getShadowValue = () => {
    return shadows[shadow];
  };

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'var(--surface)',
        borderRadius: borderRadius.lg,
        padding: getPaddingValue(),
        boxShadow: getShadowValue(),
        transition: 'all 0.2s ease-in-out',
        ...(hoverable && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: shadows.md,
            transform: 'translateY(-2px)',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {(title || titleAction) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: subtitle ? spacing.xs : spacing.md,
          }}
        >
          {title && (
            <Text as="h6" weight="semibold" colorType="primary">
              {title}
            </Text>
          )}
          {titleAction && <Box>{titleAction}</Box>}
        </Box>
      )}
      
      {subtitle && (
        <Text as="body2" colorType="secondary" sx={{ mb: spacing.md }}>
          {subtitle}
        </Text>
      )}
      
      {children}
    </Paper>
  );
};

export default Card;
