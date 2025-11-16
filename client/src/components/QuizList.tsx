import React, { useEffect, useState } from 'react'
import { apiGetQuizzes } from '../services/quizApi'
import { Grid, Card, CardContent, Typography, CardActions, Button } from '@mui/material'

type Quiz = {
  id: number
  title: string
  questionsCount: number
}

const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  return (
    <Card sx={{ bgcolor: 'var(--surface)', borderRadius: 'var(--card-radius)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: 'var(--text-primary)' }}>
          {quiz.title}
        </Typography>
        <Typography sx={{ color: 'var(--text-secondary)', mt: 1 }}>
          {quiz.questionsCount} questions
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" sx={{ color: 'var(--primary-green)' }}>
          Start
        </Button>
      </CardActions>
    </Card>
  )
}

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true)
      try {
        const data = await apiGetQuizzes()
        setQuizzes(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  if (loading) return <Typography>Loading quizzes…</Typography>

  return (
    <Grid container spacing={2}>
      {quizzes.map((q) => (
        <Grid item xs={12} sm={6} key={q.id}>
          <QuizCard quiz={q} />
        </Grid>
      ))}
    </Grid>
  )
}

export default QuizList
