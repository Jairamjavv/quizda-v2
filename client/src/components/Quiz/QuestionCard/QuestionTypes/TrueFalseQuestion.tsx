import React from 'react'
import { Box, Typography, Radio } from '@mui/material'

type Props = {
  selected: string
  onChange: (value: string) => void
  questionId: string
}

export const TrueFalseQuestion: React.FC<Props> = ({ selected, onChange, questionId }) => {
  return (
    <Box role="group" aria-label="True or False" sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '6px' }}>
      {['True', 'False'].map((v) => (
        <Box
          key={v}
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
            checked={selected === v}
            onChange={() => onChange(v)}
            name={questionId}
          />
          <Typography sx={{ fontSize: '0.95rem' }}>{v}</Typography>
        </Box>
      ))}
    </Box>
  )
}
