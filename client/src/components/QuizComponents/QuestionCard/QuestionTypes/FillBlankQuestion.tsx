import React from 'react'
import { Box, TextField } from '@mui/material'

type Props = {
  selected: string
  onChange: (value: string) => void
  questionId: string
}

export const FillBlankQuestion: React.FC<Props> = ({ selected, onChange, questionId }) => {
  return (
    <Box sx={{ mt: 1 }}>
      <TextField
        id={`${questionId}-input`}
        label="Answer"
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
      />
    </Box>
  )
}
