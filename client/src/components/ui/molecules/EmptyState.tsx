/**
 * EmptyState Component - Atomic Design (Molecule)
 * 
 * Component for displaying empty states with icon and message.
 */

import React from 'react';
import { Box } from '@mui/material';
import { Text, Button } from '../atoms';
import { spacing } from '../../../theme/constants';

export interface EmptyStateProps {
  /** Empty state icon */
  icon?: React.ReactNode;
  /** Empty state title */
  title: string;
  /** Empty state description */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action button */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: spacing.xxxl,
        px: spacing.lg,
      }}
    >
      {icon && (
        <Box
          sx={{
            fontSize: '64px',
            color: 'var(--text-secondary)',
            opacity: 0.5,
            mb: spacing.lg,
          }}
        >
          {icon}
        </Box>
      )}
      
      <Text as="h5" weight="semibold" colorType="primary" sx={{ mb: spacing.sm }}>
        {title}
      </Text>
      
      {description && (
        <Text
          as="body1"
          colorType="secondary"
          sx={{ maxWidth: '400px', mb: spacing.lg }}
        >
          {description}
        </Text>
      )}
      
      {(action || secondaryAction) && (
        <Box sx={{ display: 'flex', gap: spacing.md, mt: spacing.md }}>
          {action && (
            <Button variant="primary" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmptyState;
