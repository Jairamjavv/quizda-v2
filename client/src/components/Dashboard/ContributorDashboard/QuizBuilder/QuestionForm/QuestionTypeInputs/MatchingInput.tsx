import React from 'react'
import { Box, TextField, Button, Typography, Grid } from '@mui/material'

type Props = {
  qLeftMatch: string[]
  setQLeftMatch: (arr: string[]) => void
  qRightMatch: string[]
  setQRightMatch: (arr: string[]) => void
}

export const MatchingInput: React.FC<Props> = ({
  qLeftMatch,
  setQLeftMatch,
  qRightMatch,
  setQRightMatch
}) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>Matching pairs</Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="caption">Left</Typography>
          {qLeftMatch.map((it, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <TextField
                value={it}
                onChange={(e) => setQLeftMatch(qLeftMatch.map((v, idx) => idx === i ? e.target.value : v))}
                size="small"
                fullWidth
              />
              <Button
                size="small"
                onClick={() => setQLeftMatch(qLeftMatch.filter((_, idx) => idx !== i))}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button size="small" onClick={() => setQLeftMatch([...qLeftMatch, ''])}>
            Add left
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption">Right</Typography>
          {qRightMatch.map((it, i) => (
            <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
              <TextField
                value={it}
                onChange={(e) => setQRightMatch(qRightMatch.map((v, idx) => idx === i ? e.target.value : v))}
                size="small"
                fullWidth
              />
              <Button
                size="small"
                onClick={() => setQRightMatch(qRightMatch.filter((_, idx) => idx !== i))}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button size="small" onClick={() => setQRightMatch([...qRightMatch, ''])}>
            Add right
          </Button>
        </Grid>
      </Grid>
    </Box>
  )
}
