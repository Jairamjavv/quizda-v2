/**
 * Input Component - Atomic Design (Atom)
 * 
 * Reusable input field component with consistent styling.
 */

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { spacing, borderRadius } from '../../../theme/constants';

export interface InputProps extends Omit<TextFieldProps, 'size'> {
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  sx,
  ...props
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          '& .MuiInputBase-root': {
            height: '32px',
            fontSize: '14px',
          },
        };
      case 'lg':
        return {
          '& .MuiInputBase-root': {
            height: '48px',
            fontSize: '18px',
          },
        };
      case 'md':
      default:
        return {
          '& .MuiInputBase-root': {
            height: '40px',
            fontSize: '16px',
          },
        };
    }
  };

  return (
    <TextField
      fullWidth
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: borderRadius.md,
          bgcolor: 'var(--surface)',
          '&:hover': {
            bgcolor: 'var(--surface-hover)',
          },
          '&.Mui-focused': {
            bgcolor: 'var(--surface)',
          },
        },
        '& .MuiInputLabel-root': {
          color: 'var(--text-secondary)',
        },
        '& .MuiOutlinedInput-input': {
          padding: `0 ${spacing.md}`,
          color: 'var(--text-primary)',
        },
        ...getSizeStyles(),
        ...sx,
      }}
      {...props}
    />
  );
};

export default Input;
