import React, { useState } from 'react'
import { Card, CardContent, Typography, Button } from '@mui/material'
import NewQuizDialog from '../QuizComponents/NewQuizDialog'

const StartQuizCard: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Card sx={{ bgcolor: 'var(--surface)', p: 1 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)' }}>
              Start a New Quiz
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-primary)', mt: 1 }}>
              Attempt a new quiz challenge now.
            </Typography>
          </div>
          <Button onClick={() => setOpen(true)} variant="contained" sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>
            New
          </Button>
        </CardContent>
      </Card>

      <NewQuizDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export default StartQuizCard
