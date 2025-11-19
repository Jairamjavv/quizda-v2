import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'
import { Card, Button, Text } from '../ui'
import { spacing } from '../../theme/constants'

const StartQuizCard: React.FC = () => {
  const navigate = useNavigate()

  return (
    <Card padding="md" shadow="sm">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
        <Box>
          <Text as="body2" weight="medium" colorType="secondary">
            Start a New Quiz
          </Text>
          <Text as="body2" colorType="primary" sx={{ mt: spacing.xs }}>
            Browse and attempt quiz challenges.
          </Text>
        </Box>
        <Button onClick={() => navigate('/quiz-catalog')} variant="primary" size="md">
          Browse Quizzes
        </Button>
      </Box>
    </Card>
  )
}

export default StartQuizCard
