import React from 'react'
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

type Props = {
  qAnswer: string
  setQAnswer: (v: string) => void
}

export const TrueFalseInput: React.FC<Props> = ({ qAnswer, setQAnswer }) => {
  return (
    <FormControl fullWidth margin="normal">
      <InputLabel id="tf-label">Answer</InputLabel>
      <Select
        labelId="tf-label"
        value={qAnswer || 'True'}
        label="Answer"
        onChange={(e: any) => setQAnswer(e.target.value)}
      >
        <MenuItem value="True">True</MenuItem>
        <MenuItem value="False">False</MenuItem>
      </Select>
    </FormControl>
  )
}
