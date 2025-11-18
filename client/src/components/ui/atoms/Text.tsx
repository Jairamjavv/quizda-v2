/**
 * Text Component - Atomic Design (Atom)
 * 
 * Typography component with consistent styling.
 */

import React from 'react';
import { Typography, TypographyProps } from '@mui/material';
import { typography } from '../../../theme/constants';

export interface TextProps extends TypographyProps {
  /** Text variant */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'overline' | 'subtitle1' | 'subtitle2';
  /** Text weight */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  /** Text color type */
  colorType?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

export const Text: React.FC<TextProps> = ({
  as = 'body1',
  weight = 'regular',
  colorType,
  sx,
  children,
  ...props
}) => {
  const getWeightValue = () => {
    return typography.fontWeight[weight];
  };

  const getColorValue = () => {
    if (!colorType) return undefined;

    const colorMap = {
      primary: 'text.primary',
      secondary: 'text.secondary',
      success: 'success.main',
      warning: 'warning.main',
      error: 'error.main',
      info: 'info.main',
    };

    return colorMap[colorType];
  };

  return (
    <Typography
      variant={as}
      sx={{
        fontWeight: getWeightValue(),
        color: getColorValue(),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Typography>
  );
};

export default Text;
