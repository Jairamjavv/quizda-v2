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
import { apiLogin } from '../../../services/quizApi'
import { loginWithFirebase } from '../../../services/firebase'
import { Button, FormField, Text } from '../../ui'
import { spacing } from '../../../theme/constants'

type LoginFormProps = {
  onOpenForgot: () => void
}

type LoginFormState = {
  email: string
  password: string
  role: 'contributor' | 'attempter' | 'admin'
  remember: boolean
}

const initial: LoginFormState = { email: '', password: '', role: 'attempter', remember: false }

const LoginForm: React.FC<LoginFormProps> = ({ onOpenForgot }) => {
  const [form, setForm] = useState<LoginFormState>(initial)
  const [errors, setErrors] = useState<Partial<LoginFormState>>({})
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const navigate = useNavigate()

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
    setLoading(true)
    setServerError(null)
    try {
      // Step 1: Authenticate with Firebase
      const firebaseUser = await loginWithFirebase(
        form.email,
        form.password
      )
      
      // Step 2: Login to backend with Firebase UID
      const response = await apiLogin({
        email: form.email,
        password: form.password,
        role: form.role,
        remember: form.remember,
        firebaseUid: firebaseUser.uid
      })
      // Navigate to role-specific dashboard
      try {
        // Persisted by apiLogin; also set again here for safety
        localStorage.setItem('user', JSON.stringify(response.user))
      } catch {}
      const role = response.user?.role || form.role
      if (role === 'admin') navigate('/dashboard/admin')
      else if (role === 'contributor') navigate('/dashboard/contributor')
      else navigate('/dashboard/attempter')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || err?.message || 'Login failed.')
    } finally {
      setLoading(false)
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
