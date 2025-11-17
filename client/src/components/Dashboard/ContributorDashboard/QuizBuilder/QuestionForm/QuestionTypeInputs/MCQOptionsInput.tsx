import React from 'react'
import { Box, TextField, Button, Typography, Radio, FormControlLabel, Checkbox } from '@mui/material'

type Props = {
  qOptionsArr: string[]
  setQOptionsArr: (arr: string[]) => void
  qAnswer: string
  setQAnswer: (v: string) => void
  isMCQ: boolean
}

export const MCQOptionsInput: React.FC<Props> = ({
  qOptionsArr,
  setQOptionsArr,
  qAnswer,
  setQAnswer,
  isMCQ
}) => {
  const handleToggleAnswer = (index: string) => {
    if (isMCQ) {
      setQAnswer(index)
    } else {
      const parts = String(qAnswer || '').split(',').filter(Boolean)
      if (parts.includes(index)) {
        setQAnswer(parts.filter(p => p !== index).join(','))
      } else {
        setQAnswer([...parts, index].join(','))
      }
    }
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>Options</Typography>
      {qOptionsArr.map((opt, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          {isMCQ ? (
            <FormControlLabel
              control={<Radio checked={qAnswer === String(i)} onChange={() => handleToggleAnswer(String(i))} />}
              label=""
              sx={{ mr: 0 }}
            />
          ) : (
            <Checkbox
              checked={String(qAnswer || '').split(',').filter(Boolean).includes(String(i))}
              onChange={() => handleToggleAnswer(String(i))}
            />
          )}
          <TextField
            value={opt}
            onChange={(e) => setQOptionsArr(qOptionsArr.map((v, idx) => idx === i ? e.target.value : v))}
            fullWidth
            size="small"
          />
          <Button
            size="small"
            onClick={() => setQOptionsArr(qOptionsArr.filter((_, idx) => idx !== i))}
          >
            Remove
          </Button>
        </Box>
      ))}
      <Button size="small" onClick={() => setQOptionsArr([...qOptionsArr, ''])}>
        Add option
      </Button>
    </Box>
  )
}
