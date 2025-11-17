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
import { usePlatformStatistics } from './hooks'

const App: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const { stats: landingStats } = usePlatformStatistics()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const theme = useMemo(() => getMuiTheme(mode, designTokens), [mode])

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
            <Route path="/landing" element={<LandingPage {...landingStats} />} />
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
