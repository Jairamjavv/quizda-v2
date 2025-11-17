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
import ProtectedRoute from './components/ProtectedRoute'
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
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<LandingPage {...landingStats} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes - require authentication */}
            <Route 
              path="/dashboard/attempter" 
              element={
                <ProtectedRoute requiredRole="attempter">
                  <AttempterDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/contributor" 
              element={
                <ProtectedRoute requiredRole="contributor">
                  <ContributorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/contributor/new-quiz" 
              element={
                <ProtectedRoute requiredRole="contributor">
                  <ContributorQuizBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quiz-catalog" 
              element={
                <ProtectedRoute>
                  <QuizCatalog />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
