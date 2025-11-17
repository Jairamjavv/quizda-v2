import React from 'react'
import { Box, Select, MenuItem } from '@mui/material'

type Props = {
  leftMatch: string[]
  rightMatch: string[]
  selected: Record<number, string>
  onChange: (value: Record<number, string>) => void
}

export const MatchingQuestion: React.FC<Props> = ({ leftMatch, rightMatch, selected, onChange }) => {
  const handleMatchChange = (index: number, value: string) => {
    const next = { ...(selected || {}), [index]: value }
    onChange(next)
  }

  return (
    <Box role="group" aria-label="Matching question" sx={{ mt: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {leftMatch.map((left, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Box sx={{ minWidth: 120 }}>{left}</Box>
            <Select
              value={(selected && selected[i]) || ''}
              onChange={(e: any) => handleMatchChange(i, e.target.value)}
              displayEmpty
              sx={{ flex: 1 }}
            >
              <MenuItem value="">—</MenuItem>
              {rightMatch.map((r, j) => (
                <MenuItem key={j} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
