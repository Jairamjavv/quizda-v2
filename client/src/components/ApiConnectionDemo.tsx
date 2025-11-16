import React, { useState } from 'react'
import { Box, Button, Card, CardContent, Typography, Alert, CircularProgress } from '@mui/material'
import { apiHello, apiHealth } from '../../services/quizApi'

/**
 * Demo Component: API Connection Test
 * 
 * This component demonstrates how to:
 * 1. Fetch from the Cloudflare Worker /api/hello endpoint
 * 2. Handle loading and error states
 * 3. Display responses with proper error handling
 * 
 * Usage: Import and use this component in your app to verify
 * that the frontend can successfully communicate with the backend.
 */

interface ApiResponse {
  message?: string
  status?: string
  name?: string
  [key: string]: any
}

const ApiConnectionDemo: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleHello = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const data = await apiHello()
      setResponse(data)
      console.log('[Demo] /api/hello response:', data)
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to fetch from /api/hello'
      setError(errorMsg)
      console.error('[Demo] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleHealth = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      const data = await apiHealth()
      setResponse(data)
      console.log('[Demo] /api/health response:', data)
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to fetch from /api/health'
      setError(errorMsg)
      console.error('[Demo] Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto', mt: 3, bgcolor: 'var(--surface)' }}>
      <CardContent>
        <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2 }}>
          🚀 API Connection Test
        </Typography>

        <Typography sx={{ color: 'var(--text-secondary)', mb: 3, fontSize: '0.9rem' }}>
          Click the buttons below to test connectivity with the Cloudflare Worker backend.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {response && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography component="div" sx={{ fontSize: '0.9rem' }}>
              <strong>Response:</strong>
            </Typography>
            <Typography component="pre" sx={{ fontSize: '0.85rem', mt: 1, overflow: 'auto' }}>
              {JSON.stringify(response, null, 2)}
            </Typography>
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={handleHello}
            disabled={loading}
            sx={{
              bgcolor: 'var(--primary-green)',
              '&:hover': { bgcolor: 'var(--primary-green-dark)' },
            }}
          >
            {loading ? <CircularProgress size={20} /> : '→ Test /api/hello'}
          </Button>

          <Button
            variant="contained"
            onClick={handleHealth}
            disabled={loading}
            sx={{
              bgcolor: 'var(--primary-blue)',
              '&:hover': { bgcolor: 'var(--primary-blue-dark)' },
            }}
          >
            {loading ? <CircularProgress size={20} /> : '⚕️ Test /api/health'}
          </Button>
        </Box>

        <Typography sx={{ color: 'var(--text-secondary)', mt: 3, fontSize: '0.85rem' }}>
          📝 Open the browser console (F12) to see detailed logs of API requests and responses.
        </Typography>
      </CardContent>
    </Card>
  )
}

export default ApiConnectionDemo
