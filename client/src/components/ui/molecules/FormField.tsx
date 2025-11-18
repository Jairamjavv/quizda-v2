/**
 * FormField Component - Atomic Design (Molecule)
 * 
 * Input field with label and error message.
 */

import React from 'react';
import { Box, FormHelperText } from '@mui/material';
import { Input, InputProps, Text } from '../atoms';
import { spacing } from '../../../theme/constants';

export interface FormFieldProps extends Omit<InputProps, 'error'> {
  /** Field label */
  label?: string;
  /** Field description/helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Required field indicator */
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  helperText,
  error,
  required,
  ...inputProps
}) => {
  return (
    <Box sx={{ mb: spacing.lg }}>
      {label && (
        <Text
          as="body2"
          weight="medium"
          colorType="primary"
          sx={{ mb: spacing.xs, display: 'block' }}
        >
          {label}
          {required && (
            <Text as="caption" sx={{ color: 'error.main', ml: spacing.xs }}>
              *
            </Text>
          )}
        </Text>
      )}
      
      <Input
        {...inputProps}
        error={!!error}
      />
      
      {(error || helperText) && (
        <FormHelperText
          error={!!error}
          sx={{
            mt: spacing.xs,
            color: error ? 'error.main' : 'text.secondary',
          }}
        >
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

export default FormField;
