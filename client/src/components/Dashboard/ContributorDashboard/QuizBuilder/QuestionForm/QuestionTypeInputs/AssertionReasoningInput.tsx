import React from 'react'
import { Box, TextField } from '@mui/material'

type Props = {
  qAssertionA: string
  qAssertionR: string
}

export const AssertionReasoningInput: React.FC<Props> = ({ qAssertionA, qAssertionR }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Assertion (A)"
        value={qAssertionA}
        fullWidth
        margin="normal"
        disabled
      />
      <TextField
        label="Reason (R)"
        value={qAssertionR}
        fullWidth
        margin="normal"
        disabled
      />
    </Box>
  )
}
