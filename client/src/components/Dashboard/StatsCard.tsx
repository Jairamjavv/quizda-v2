import React from 'react'
import { Card, CardContent, Typography } from '@mui/material'

const StatsCard: React.FC<{ title: string; value: React.ReactNode; subtitle?: string; large?: boolean }> = ({
  title,
  value,
  subtitle,
  large = false
}) => {
  return (
    <Card sx={{ bgcolor: 'var(--surface)', p: 1 }}>
      <CardContent>
        <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>
          {title}
        </Typography>
        <Typography variant={large ? 'h3' : 'h4'} sx={{ color: 'var(--text-primary)' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default StatsCard
