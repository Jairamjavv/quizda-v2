import React from 'react'
import { Box, Grid, Card, CardContent, Typography } from '@mui/material'

type StatsProps = {
  totalQuizzes: number
  totalQuestions: number
  totalAttempts: number
  totalUsers: number
  totalContributors: number
}

const statItems = (s: StatsProps) => [
  { key: 'totalQuizzes', label: 'Quizzes', value: s.totalQuizzes },
  { key: 'totalQuestions', label: 'Questions', value: s.totalQuestions },
  { key: 'totalAttempts', label: 'Attempts', value: s.totalAttempts },
  { key: 'totalUsers', label: 'Users', value: s.totalUsers },
  { key: 'totalContributors', label: 'Contributors', value: s.totalContributors }
]

const StatsOverview: React.FC<StatsProps> = (props) => {
  const items = statItems(props)

  return (
    <Box sx={{ mt: 4 }}>
      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        {items.map((it) => (
          <Grid key={it.key} item xs={12} sm={6} md={4} lg={3}>
            <Card elevation={1} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {it.value}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {it.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default StatsOverview
