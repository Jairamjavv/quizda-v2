/**
 * Input Component - Atomic Design (Atom)
 * 
 * Reusable input field component built on MUI TextField with theme-based styling.
 * Uses MUI theme palette and spacing - NO hardcoded values!
 */

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export interface InputProps extends Omit<TextFieldProps, 'size'> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  sx,
  ...props
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          '& .MuiInputBase-root': {
            minHeight: theme.spacing(4),
            fontSize: theme.typography.body2.fontSize,
          },
        };
      case 'lg':
        return {
          '& .MuiInputBase-root': {
            minHeight: theme.spacing(6),
            fontSize: theme.typography.h6.fontSize,
          },
        };
      case 'md':
      default:
        return {
          '& .MuiInputBase-root': {
            minHeight: theme.spacing(5),
            fontSize: theme.typography.body1.fontSize,
          },
        };
    }
  };

  return (
    <TextField
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: theme.shape.borderRadius / 8,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
          '&.Mui-focused': {
            bgcolor: 'background.paper',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'text.secondary',
        },
        '& .MuiOutlinedInput-input': {
          px: theme.spacing(2),
          color: 'text.primary',
        },
        ...getSizeStyles(),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Input;
