import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert
} from '@mui/material'
import { useAuth } from '../../../hooks/useAuth'
import { Button, FormField, Text } from '../../ui'
import { spacing } from '../../../theme/constants'

type LoginFormProps = {
  onOpenForgot: () => void
}

type LoginFormState = {
  email: string
  password: string
  remember: boolean
}

const initial: LoginFormState = { email: '', password: '', remember: false }

const LoginForm: React.FC<LoginFormProps> = ({ onOpenForgot }) => {
  const [form, setForm] = useState<LoginFormState>(initial)
  const [errors, setErrors] = useState<Partial<LoginFormState>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, loading } = useAuth()

  const handle = (k: keyof LoginFormState) => (e: any) => {
    const value = k === 'remember' ? e.target.checked : e.target.value
    setForm((s) => ({ ...s, [k]: value }))
    setErrors((prev) => ({ ...prev, [k]: undefined }))
    setServerError(null)
    setSuccess(null)
  }

  const validate = () => {
    const e: Partial<LoginFormState> = {}
    if (!form.email) e.email = 'Email is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    
    setServerError(null)
    try {
      // Use the new AuthService login
      const response = await login({
        email: form.email,
        password: form.password,
      })
      
      // Navigate based on user role
      const role = response.user?.role
      if (role === 'admin') {
        navigate('/dashboard/admin')
      } else if (role === 'contributor') {
        navigate('/dashboard/contributor')
      } else {
        navigate('/dashboard/attempter')
      }
    } catch (err: any) {
      setServerError(err?.message || 'Login failed.')
    }
  }

  return (
    <Box>
      <Paper sx={{ bgcolor: 'var(--surface)', p: spacing.lg, maxWidth: 540, mx: 'auto' }} component="form" onSubmit={onSubmit}>
        <Text as="h5" sx={{ mb: spacing.md }}>
          Login
        </Text>

        {serverError && (
          <Alert severity="error" sx={{ mb: spacing.md }}>
            {serverError}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: spacing.md }}>
            {success}
          </Alert>
        )}

        <FormField
          label="Email Address"
          type="email"
          value={form.email}
          onChange={handle('email')}
          error={errors.email}
          fullWidth
          margin="normal"
          required
        />

        <FormField
          label="Password"
          type="password"
          value={form.password}
          onChange={handle('password')}
          error={errors.password}
          fullWidth
          margin="normal"
          required
        />

        <Box sx={{ display: 'flex', alignItems: 'center', mt: spacing.xs }}>
          <Checkbox checked={form.remember} onChange={handle('remember')} />
          <Text as="body2">Remember me</Text>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: spacing.md }}>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>

          <Button onClick={onOpenForgot} variant="ghost">
            Forgot password?
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginForm
