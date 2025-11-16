import React from 'react'
import { AppBar, Toolbar, Box, Button, Typography, Grid, Stack } from '@mui/material'
import StatsOverview from './StatsOverview'
import { useNavigate } from 'react-router-dom'

type Props = {
  totalQuizzes: number
  totalQuestions: number
  totalAttempts: number
  totalUsers: number
  totalContributors: number
}

const LandingPage: React.FC<Props> = ({ totalQuizzes, totalQuestions, totalAttempts, totalUsers, totalContributors }) => {
  const navigate = useNavigate()

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 3, md: 6 } }}>
        <Box sx={{ maxWidth: 980, width: '100%', textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>Welcome to Quizda</Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>You know it, then test it!</Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={10} md={8}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/dashboard/attempter')}
                  sx={{ borderRadius: 3, px: 5, py: 1.8, bgcolor: 'primary.main', color: '#fff', fontWeight: 600 }}
                >
                  Attempt Quizzes
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/dashboard/contributor')}
                  sx={{ borderRadius: 3, px: 5, py: 1.8, borderWidth: 2, fontWeight: 600 }}
                >
                  Contribute Questions
                </Button>
              </Stack>
            </Grid>
          </Grid>

          <StatsOverview
            totalQuizzes={totalQuizzes}
            totalQuestions={totalQuestions}
            totalAttempts={totalAttempts}
            totalUsers={totalUsers}
            totalContributors={totalContributors}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default LandingPage
