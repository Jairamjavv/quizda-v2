import React from 'react'
import { StatsCard as UIStatsCard } from '../ui'

const StatsCard: React.FC<{ title: string; value: React.ReactNode; subtitle?: string; large?: boolean }> = ({
  title,
  value,
  subtitle,
  large = false
}) => {
  return (
    <UIStatsCard
      title={title}
      value={typeof value === 'string' || typeof value === 'number' ? value : String(value)}
      subtitle={subtitle}
      large={large}
    />
  )
}

export default StatsCard
