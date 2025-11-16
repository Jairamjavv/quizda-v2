import React, { useEffect, useMemo, useState } from 'react'
import { Grid, Box } from '@mui/material'
import { apiGetQuizzes } from '../../../services/quizApi'
import StatsCard from '../StatsCard'
import StartQuizCard from '../StartQuizCard'
import RecentQuizzes from '../RecentQuizzes'
import { RecentQuiz, generatePlaceholders } from '../types'

const AttempterDashboard: React.FC = () => {
  const [recent, setRecent] = useState<RecentQuiz[]>([])
  const [loading, setLoading] = useState(false)
  const [topN, setTopN] = useState<number>(10)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await apiGetQuizzes()
        const mapped: RecentQuiz[] = data.map((q: any, idx: number) => ({
          id: q.id || idx + 1,
          title: q.title || `Quiz ${idx + 1}`,
          score: Math.floor(Math.random() * 100),
          date: new Date().toISOString().slice(0, 10)
        }))
        if (mapped.length < topN) {
          const more = generatePlaceholders(topN - mapped.length + 5)
          setRecent([...mapped, ...more].slice(0, topN))
        } else setRecent(mapped.slice(0, topN))
      } catch (err) {
        setRecent(generatePlaceholders(topN))
      } finally {
        setLoading(false)
      }
    }

    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setRecent((cur) => {
      if (cur.length >= topN) return cur.slice(0, topN)
      return [...cur, ...generatePlaceholders(topN - cur.length)].slice(0, topN)
    })
  }, [topN])

  const totalTaken = useMemo(() => recent.length, [recent])
  const streak = useMemo(() => Math.floor(Math.random() * 15), [])
  const average = useMemo(() => {
    if (!recent.length) return 0
    const scores = recent.map((r) => r.score || 0)
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [recent])

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard title="Total Quizzes Taken" value={totalTaken} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard title="Current Streak" value={`${streak} days`} subtitle="Consecutive days" />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <StartQuizCard />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <StatsCard title="Total Average Score" value={`${average}%`} large />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <RecentQuizzes
            recent={recent}
            loading={loading}
            topN={topN}
            setTopN={setTopN}
          />
        </Grid>
      </Grid>
    </Box>
  )
}

export default AttempterDashboard
