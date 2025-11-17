/**
 * StatsCard Component - Atomic Design (Molecule)
 * 
 * Specialized card for displaying statistics.
 */

import React from 'react';
import { Box } from '@mui/material';
import { Card } from './Card';
import { Text } from '../atoms';
import { spacing } from '../../../theme/constants';

export interface StatsCardProps {
  /** Statistic title */
  title: string;
  /** Statistic value */
  value: string | number;
  /** Optional subtitle/description */
  subtitle?: string;
  /** Optional icon */
  icon?: React.ReactNode;
  /** Trend indicator */
  trend?: {
    value: number;
    label?: string;
  };
  /** Large display mode */
  large?: boolean;
  /** Card is clickable */
  onClick?: () => void;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  large = false,
  onClick,
}) => {
  return (
    <Card
      padding="md"
      shadow="sm"
      hoverable={!!onClick}
      onClick={onClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: spacing.md }}>
        {icon && (
          <Box
            sx={{
              color: 'var(--primary-green)',
              fontSize: large ? '32px' : '24px',
            }}
          >
            {icon}
          </Box>
        )}
        
        <Box sx={{ flex: 1 }}>
          <Text
            as="body2"
            colorType="secondary"
            weight="medium"
            sx={{ mb: spacing.xs }}
          >
            {title}
          </Text>
          
          <Text
            as={large ? 'h3' : 'h4'}
            weight="bold"
            colorType="primary"
            sx={{ mb: subtitle || trend ? spacing.xs : 0 }}
          >
            {value}
          </Text>
          
          {subtitle && (
            <Text as="caption" colorType="secondary">
              {subtitle}
            </Text>
          )}
          
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: spacing.xs, mt: spacing.xs }}>
              <Text
                as="caption"
                weight="semibold"
                sx={{
                  color: trend.value >= 0 ? 'var(--success)' : 'var(--error)',
                }}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </Text>
              {trend.label && (
                <Text as="caption" colorType="secondary">
                  {trend.label}
                </Text>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Card>
  );
};

export default StatsCard;
