import React, { useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Container } from '@mui/material'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { designTokens } from './theme/designTokens'
import { getMuiTheme } from './theme/designSystem'
import AttempterDashboard from './components/Dashboard/AttempterDashboard'
import ContributorDashboard from './components/Dashboard/ContributorDashboard'
import AdminDashboard from './components/Dashboard/AdminDashboard'
import ContributorQuizBuilder from './components/Dashboard/ContributorDashboard/ContributorQuizBuilder'
import LandingPage from './components/LandingPage/LandingPage'
import QuizCatalog from './components/QuizCatalog'
import Login from './components/UserAuthentication/Login/index'
import Register from './components/UserAuthentication/Register/index'
import Header from './components/Header'

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const theme = useMemo(() => getMuiTheme(mode, designTokens), [mode])
  const [landingStats, setLandingStats] = useState({ totalQuizzes: 0, totalQuestions: 0, totalAttempts: 0, totalUsers: 0, totalContributors: 0 })

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('contributor_quizzes') || '[]')
      const totalQuizzes = Array.isArray(stored) ? stored.length : 0
      const totalQuestions = Array.isArray(stored) ? stored.reduce((s: number, q: any) => s + (Array.isArray(q.questions) ? q.questions.length : (q.questionsCount || 0)), 0) : 0
      const totalAttempts = Math.max(0, totalQuizzes * 7)
      const totalUsers = Math.max(1, Math.floor(totalQuizzes * 2.5))
      const totalContributors = Math.max(1, Math.floor(totalQuizzes * 0.25))
      setLandingStats({ totalQuizzes, totalQuestions, totalAttempts, totalUsers, totalContributors })
    } catch (e) {
      // ignore and keep zeros
    }
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header mode={mode} onToggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')} />

        <Container maxWidth="md" sx={{ mt: 2 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/dashboard/attempter" element={<AttempterDashboard />} />
            <Route path="/dashboard/contributor" element={<ContributorDashboard />} />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/contributor/new-quiz" element={<ContributorQuizBuilder />} />
            <Route path="/landing" element={<LandingPage totalQuizzes={landingStats.totalQuizzes} totalQuestions={landingStats.totalQuestions} totalAttempts={landingStats.totalAttempts} totalUsers={landingStats.totalUsers} totalContributors={landingStats.totalContributors} />} />
            <Route path="/quiz-catalog" element={<QuizCatalog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
