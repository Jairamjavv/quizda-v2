import React, { useEffect, useMemo, useState } from 'react'
import { Box, Grid, Typography, Button } from '@mui/material'
import { apiGetQuizzes } from '../../../services/quizApi'
import StatsCard from '../StatsCard'
import AddQuizDialog from './AddQuizDialog'

type QuizItem = { id: string; title: string; questionsCount: number; category?: string }

const ContributorDashboard: React.FC = () => {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([])
  const [loading, setLoading] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await apiGetQuizzes()
        const mapped: QuizItem[] = data.map((q: any, idx: number) => ({
          id: q.id || `q_${idx + 1}`,
          title: q.title || `Quiz ${idx + 1}`,
          questionsCount: q.questionsCount || q.questions_count || q.questions || 5
        }))
        // merge stored contributor quizzes from localStorage (persisted by the builder)
        const stored = JSON.parse(localStorage.getItem('contributor_quizzes') || '[]')
        const combined = [...stored, ...mapped]
        setQuizzes(combined)
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('contributor_quizzes') || '[]')
        setQuizzes(stored)
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [])

  const totalQuizzes = quizzes.length
  const totalQuestions = useMemo(() => quizzes.reduce((s, q) => s + (q.questionsCount || 0), 0), [quizzes])
  // attempts is mocked for now (sum of random per-quiz attempts)
  const totalAttempts = useMemo(() => quizzes.reduce((s) => s + Math.floor(Math.random() * 200), 0), [quizzes])

  const handleAdd = (q: QuizItem) => setQuizzes((prev) => [q, ...prev])

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
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
          <Button variant="contained" fullWidth sx={{ height: '100%', bgcolor: 'var(--primary-green)', color: '#fff' }} onClick={() => setAddOpen(true)}>
            Add New Quiz
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ p: 1 }}>
        <Typography variant="h6">Your quizzes</Typography>
        {loading ? (
          <Typography variant="body2">Loading…</Typography>
        ) : quizzes.length === 0 ? (
          <Typography variant="body2">No quizzes yet. Create one using the button above.</Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            {quizzes.map((q) => (
              <Box key={q.id} sx={{ p: 1, mb: 1, bgcolor: 'var(--surface)', borderRadius: 1 }}>
                <Typography variant="subtitle1" sx={{ color: 'var(--text-primary)' }}>{q.title}</Typography>
                <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                  {q.questionsCount} questions {q.category ? `· ${q.category}` : ''}
                </Typography>
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
