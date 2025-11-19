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
  Alert,
  TextField
} from '@mui/material'
import { useAuth } from '../../../hooks/useAuth'
import { sessionManager } from '../../../services/sessionManager'
import { Button, Text } from '../../ui'
import { spacing } from '../../../theme/constants'

type LoginFormProps = {
  onOpenForgot: () => void
}

type LoginFormState = {
  username: string
  password: string
  role: 'contributor' | 'attempter' | 'admin'
  remember: boolean
}

const initial: LoginFormState = { username: '', password: '', role: 'attempter', remember: false }

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
    if (!form.username) e.username = 'Username is required'
    if (!form.password) e.password = 'Password is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return

    setServerError(null)
    try {
      // Use username instead of email for login
      const response = await login({
        email: form.username, // Backend expects 'email' but we send username
        password: form.password,
      })

      // Update sessionManager with the logged-in user
      if (response.user) {
        sessionManager.setUser(response.user)
      }

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
      <Paper sx={{ bgcolor: 'background.paper', p: spacing.lg, maxWidth: 540, mx: 'auto' }} component="form" onSubmit={onSubmit}>
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

        <TextField
          label="Username"
          type="text"
          value={form.username}
          onChange={handle('username')}
          error={!!errors.username}
          helperText={errors.username}
          fullWidth
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'error.main',
                borderWidth: 2,
              },
            },
          }}
        />

        <TextField
          label="Password"
          type="password"
          value={form.password}
          onChange={handle('password')}
          error={!!errors.password}
          helperText={errors.password}
          fullWidth
          margin="normal"
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-error fieldset': {
                borderColor: 'error.main',
                borderWidth: 2,
              },
            },
          }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="login-role-label">Role</InputLabel>
          <Select labelId="login-role-label" value={form.role} label="Role" onChange={handle('role')}>
            <MenuItem value="attempter">Attempter</MenuItem>
            <MenuItem value="contributor">Contributor</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

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
