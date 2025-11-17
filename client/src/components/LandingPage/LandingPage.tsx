import React from 'react'
import { Box, Grid, Stack } from '@mui/material'
import StatsOverview from './StatsOverview'
import { useNavigate } from 'react-router-dom'
import { Button, Text } from '../ui'
import { spacing, borderRadius } from '../../theme/constants'

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

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: spacing.lg, md: spacing.xl } }}>
        <Box sx={{ maxWidth: 980, width: '100%', textAlign: 'center' }}>
          <Text as="h3" weight="bold" sx={{ mb: spacing.xs }}>Welcome to Quizda</Text>
          <Text as="h6" colorType="secondary" sx={{ mb: spacing.lg }}>You know it, then test it!</Text>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={10} md={8}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/dashboard/attempter')}
                  sx={{ borderRadius: borderRadius.lg, px: spacing.xl, py: spacing.md }}
                >
                  Attempt Quizzes
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/dashboard/contributor')}
                  sx={{ borderRadius: borderRadius.lg, px: spacing.xl, py: spacing.md }}
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
