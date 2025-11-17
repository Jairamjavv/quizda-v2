import React from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'

type Props = {
  qImageUrl: string
  setQImageUrl: (v: string) => void
  qHotspots: any[]
  setQHotspots: (h: any[]) => void
}

export const HotspotInput: React.FC<Props> = ({ qImageUrl, setQImageUrl, qHotspots, setQHotspots }) => {
  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label="Image URL"
        value={qImageUrl}
        onChange={(e) => setQImageUrl(e.target.value)}
        fullWidth
        margin="normal"
        disabled
      />
      <Typography variant="body2" sx={{ mb: 1 }}>Hotspots (x, y, w, h in %)</Typography>
      {qHotspots.map((h, i) => (
        <Box key={h.id || i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <TextField label="x%" value={String(h.x)} size="small" sx={{ width: 80 }} disabled />
          <TextField label="y%" value={String(h.y)} size="small" sx={{ width: 80 }} disabled />
          <TextField label="w%" value={String(h.w)} size="small" sx={{ width: 80 }} disabled />
          <TextField label="h%" value={String(h.h)} size="small" sx={{ width: 80 }} disabled />
          <TextField label="label" value={h.label || ''} size="small" disabled />
          <Button size="small" disabled>Remove</Button>
        </Box>
      ))}
      <Button size="small" disabled sx={{ mt: 1 }}>Add hotspot</Button>
      <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
        Hotspot authoring is disabled for now — preview will show "Coming soon".
      </Typography>
    </Box>
  )
}
