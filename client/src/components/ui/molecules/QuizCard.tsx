/**
 * QuizCard Component - Atomic Design (Molecule)
 * 
 * Card for displaying quiz information.
 */

import React from 'react';
import { Box, IconButton } from '@mui/material';
import { Card } from './Card';
import { Text, Badge, Button } from '../atoms';
import { spacing } from '../../../theme/constants';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface QuizCardProps {
  /** Quiz title */
  title: string;
  /** Quiz description */
  description?: string;
  /** Quiz category */
  category?: string;
  /** Quiz difficulty */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Number of questions */
  questionsCount?: number;
  /** Time limit in minutes */
  timeLimit?: number;
  /** Quiz tags */
  tags?: string[];
  /** Action buttons */
  actions?: React.ReactNode;
  /** On click handler */
  onClick?: () => void;
  /** Menu click handler */
  onMenuClick?: (event: React.MouseEvent) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({
  title,
  description,
  category,
  difficulty,
  questionsCount,
  timeLimit,
  tags,
  actions,
  onClick,
  onMenuClick,
}) => {
  const getDifficultyColor = (): 'success' | 'warning' | 'error' => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
      default:
        return 'error';
    }
  };

  return (
    <Card
      padding="md"
      shadow="sm"
      hoverable={!!onClick}
      onClick={onClick}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: spacing.sm }}>
        <Box sx={{ flex: 1 }}>
          <Text as="h6" weight="semibold" colorType="primary" sx={{ mb: spacing.xs }}>
            {title}
          </Text>
          
          {description && (
            <Text
              as="body2"
              colorType="secondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {description}
            </Text>
          )}
        </Box>
        
        {onMenuClick && (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onMenuClick(e);
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Metadata */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, mb: spacing.md }}>
        {category && <Badge variant="default" size="sm" label={category} />}
        {difficulty && (
          <Badge variant={getDifficultyColor()} size="sm" label={difficulty} />
        )}
        {questionsCount !== undefined && (
          <Badge variant="info" size="sm" label={`${questionsCount} questions`} />
        )}
        {timeLimit && (
          <Badge variant="default" size="sm" label={`${timeLimit} min`} />
        )}
      </Box>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: spacing.xs, mb: spacing.md }}>
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="default" size="sm" label={tag} />
          ))}
          {tags.length > 3 && (
            <Badge variant="default" size="sm" label={`+${tags.length - 3} more`} />
          )}
        </Box>
      )}

      {/* Actions */}
      {actions && (
        <Box sx={{ mt: 'auto', pt: spacing.md }}>
          {actions}
        </Box>
      )}
    </Card>
  );
};

export default QuizCard;
