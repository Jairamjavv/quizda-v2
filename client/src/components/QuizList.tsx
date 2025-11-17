import React, { useEffect, useState } from 'react'
import { apiGetQuizzes } from '../services/quizApi'
import { Grid } from '@mui/material'
import { Card, Button, Text } from './ui'
import { spacing } from '../theme/constants'

type Quiz = {
  id: number
  title: string
  questionsCount: number
}

const QuizCard: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
  return (
    <Card padding="md" shadow="sm">
      <Text as="h6">
        {quiz.title}
      </Text>
      <Text as="body2" colorType="secondary" sx={{ mt: spacing.xs }}>
        {quiz.questionsCount} questions
      </Text>
      <Button size="sm" sx={{ mt: spacing.sm }} variant="primary">
        Start
      </Button>
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

  if (loading) return <Text>Loading quizzes…</Text>

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
