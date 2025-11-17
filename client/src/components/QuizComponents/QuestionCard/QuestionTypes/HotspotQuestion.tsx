import React from 'react'
import { Box, Typography } from '@mui/material'

export const HotspotQuestion: React.FC = () => {
  return (
    <Box aria-label="Hotspot (coming soon)" sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        Hotspot questions are temporarily disabled and will be available soon.
      </Typography>
    </Box>
  )
}
