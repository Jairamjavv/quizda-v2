import React, { useEffect, useMemo, useState } from 'react'
import { Grid, Box } from '@mui/material'
import StatsCard from '../StatsCard'
import StartQuizCard from '../StartQuizCard'
import RecentQuizzes from '../RecentQuizzes'
import { RecentQuiz, generatePlaceholders } from '../types'
import { useQuizzes, useUserStatistics, useRecentPerformance } from '../../../hooks'

const AttempterDashboard: React.FC = () => {
  const { quizzes, loading: quizzesLoading } = useQuizzes()
  const { stats } = useUserStatistics()
  const { performance } = useRecentPerformance(10)
  
  const [topN, setTopN] = useState<number>(10)
  const [loading, setLoading] = useState(false)

  // Map performance data to RecentQuiz format
  const recent: RecentQuiz[] = useMemo(() => {
    const mapped = performance.map(p => ({
      id: p.quizId,
      title: p.quizTitle,
      score: p.score,
      date: p.date
    }))
    
    if (mapped.length < topN) {
      const more = generatePlaceholders(topN - mapped.length)
      return [...mapped, ...more].slice(0, topN)
    }
    return mapped.slice(0, topN)
  }, [performance, topN])

  useEffect(() => {
    setLoading(quizzesLoading)
  }, [quizzesLoading])

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatsCard title="Total Quizzes Taken" value={stats.totalQuizzesTaken} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <StatsCard title="Current Streak" value={`${stats.currentStreak} days`} subtitle="Consecutive days" />
        </Grid>

        <Grid item xs={12} sm={12} md={4}>
          <StartQuizCard />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <StatsCard title="Total Average Score" value={`${stats.averageScore}%`} large />
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
