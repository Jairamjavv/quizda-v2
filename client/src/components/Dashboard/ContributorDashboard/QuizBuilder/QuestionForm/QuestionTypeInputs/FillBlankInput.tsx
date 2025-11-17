import React from 'react'
import { TextField } from '@mui/material'

type Props = {
  qAnswer: string
  setQAnswer: (v: string) => void
}

export const FillBlankInput: React.FC<Props> = ({ qAnswer, setQAnswer }) => {
  return (
    <TextField
      label="Answer"
      value={qAnswer}
      onChange={(e) => setQAnswer(e.target.value)}
      fullWidth
      margin="normal"
    />
  )
}
