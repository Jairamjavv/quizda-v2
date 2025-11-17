import React from 'react'
import { Box, Typography, Checkbox } from '@mui/material'

type Props = {
  options: string[]
  selected: string[]
  onChange: (value: string[]) => void
}

export const MultipleResponseQuestion: React.FC<Props> = ({ options, selected, onChange }) => {
  const handleToggle = (opt: string, checked: boolean) => {
    const set = new Set(selected || [])
    if (checked) {
      set.add(opt)
    } else {
      set.delete(opt)
    }
    onChange(Array.from(set))
  }

  return (
    <Box role="group" aria-label="Multiple response options" sx={{ display: 'flex', flexDirection: 'column', gap: '6px', mt: '6px' }}>
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
          <Checkbox
            checked={(selected || []).includes(opt)}
            onChange={(e) => handleToggle(opt, e.target.checked)}
            inputProps={{ 'aria-label': opt }}
          />
          <Typography sx={{ fontSize: '0.95rem' }}>{opt}</Typography>
        </Box>
      ))}
    </Box>
  )
}
