import React, { useMemo, useState } from 'react'
import { Box, Grid } from '@mui/material'
import StatsCard from '../StatsCard'
import AddQuizDialog from './AddQuizDialog'
import { useQuizzes, useUserStatistics } from '../../../hooks'
import { Button, Text, EmptyState } from '../../ui'
import { spacing, borderRadius } from '../../../theme/constants'

type QuizItem = { id: string; title: string; questionsCount: number; category?: string }

const ContributorDashboard: React.FC = () => {
  const { quizzes: fetchedQuizzes, loading } = useQuizzes()
  const { stats } = useUserStatistics()
  const [addOpen, setAddOpen] = useState(false)

  // Transform quizzes to QuizItem format
  const quizzes: QuizItem[] = useMemo(() => 
    fetchedQuizzes.map(q => ({
      id: String(q.id),
      title: q.title,
      questionsCount: q.questions?.length || q.questionsCount || 0,
      category: q.category
    })),
    [fetchedQuizzes]
  )

  const totalQuizzes = stats.totalQuizzesCreated
  const totalQuestions = stats.totalQuestions
  // attempts is mocked for now (sum of random per-quiz attempts)
  const totalAttempts = useMemo(() => quizzes.reduce((s) => s + Math.floor(Math.random() * 200), 0), [quizzes])

  const handleAdd = (q: QuizItem) => {
    // Handled internally by useQuizzes hook
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: spacing.md }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Quizzes Created" value={totalQuizzes} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Times Attempted" value={totalAttempts} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard title="Total Questions" value={totalQuestions} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Button variant="primary" fullWidth sx={{ height: '100%' }} onClick={() => setAddOpen(true)}>
            Add New Quiz
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ p: spacing.sm }}>
        <Text as="h6">Your quizzes</Text>
        {loading ? (
          <Text as="body2">Loading…</Text>
        ) : quizzes.length === 0 ? (
          <EmptyState 
            title="No quizzes yet" 
            description="Create one using the button above."
          />
        ) : (
          <Box sx={{ mt: spacing.sm }}>
            {quizzes.map((q) => (
              <Box 
                key={q.id} 
                sx={{ 
                  p: spacing.sm, 
                  mb: spacing.sm, 
                  bgcolor: 'var(--surface)', 
                  borderRadius: borderRadius.md 
                }}
              >
                <Text as="subtitle1">{q.title}</Text>
                <Text as="body2" colorType="secondary">
                  {q.questionsCount} questions {q.category ? `· ${q.category}` : ''}
                </Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <AddQuizDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAdd} />
    </Box>
  )
}

export default ContributorDashboard
