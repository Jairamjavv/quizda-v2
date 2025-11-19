import React, { useState } from 'react'
import { Box } from '@mui/material'
import { Card, Button, Text } from '../ui'
import NewQuizDialog from '../Quiz/NewQuizDialog'
import { spacing } from '../../theme/constants'

const StartQuizCard: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card padding="md" shadow="sm">
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
          <Box>
            <Text as="body2" weight="medium" colorType="secondary">
              Start a New Quiz
            </Text>
            <Text as="body2" colorType="primary" sx={{ mt: spacing.xs }}>
              Attempt a new quiz challenge now.
            </Text>
          </Box>
          <Button onClick={() => setOpen(true)} variant="primary" size="md">
            New
          </Button>
        </Box>
      </Card>

      <NewQuizDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default StartQuizCard
