import React from 'react'
import { Box, Typography, Radio } from '@mui/material'

type Props = {
  assertion: { A: string; R: string }
  selected: string
  onChange: (value: string) => void
  questionId: string
}

export const AssertionReasoningQuestion: React.FC<Props> = ({ assertion, selected, onChange, questionId }) => {
  return (
    <Box role="group" aria-label="Assertion and Reasoning" sx={{ mt: 1 }}>
      <Typography sx={{ mb: 1 }}>
        <strong>A:</strong> {assertion.A}
      </Typography>
      <Typography sx={{ mb: 1 }}>
        <strong>R:</strong> {assertion.R}
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {['A', 'B', 'C', 'D'].map((v) => (
          <Box key={v} component="label" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Radio
              checked={selected === v}
              onChange={() => onChange(v)}
              name={questionId}
            />
            <Typography sx={{ fontSize: '0.95rem' }}>{v}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
