import React from 'react'
import { Box, Typography, Radio } from '@mui/material'

type Props = {
  options: string[]
  selected: string
  onChange: (value: string) => void
  questionId: string
}

export const MCQQuestion: React.FC<Props> = ({ options, selected, onChange, questionId }) => {
  return (
    <Box role="group" aria-label="Multiple choice options" sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '6px' }}>
      {options.map((opt, i) => (
        <Box
          key={i}
          component="label"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: '6px',
            borderRadius: '6px',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <Radio
            checked={selected === opt}
            onChange={() => onChange(opt)}
            name={questionId}
            inputProps={{ 'aria-label': opt }}
          />
          <Typography sx={{ fontSize: '0.95rem' }}>{opt}</Typography>
        </Box>
      ))}
    </Box>
  )
}
