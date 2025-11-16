import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../../../context/NotificationContext'
import {
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Snackbar
} from '@mui/material'
import { apiRegister } from '../../../services/quizApi'
import { registerWithFirebase } from '../../../services/firebase'

type FormState = {
  email: string
  username: string
  password: string
  confirmPassword: string
  role: 'contributor' | 'attempter' | 'admin'
}

const initialState: FormState = {
  email: '',
  username: '',
  password: '',
  confirmPassword: '',
  role: 'attempter'
}

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const navigate = useNavigate()
  const notify = useNotification()

  const validate = () => {
    const e: Partial<FormState> = {}
    if (!form.email) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Invalid email'

    if (!form.username) e.username = 'Username is required'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters'

    if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match'

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (key: keyof FormState) => (e: any) => {
    setForm((s) => ({ ...s, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setServerError(null)
    setSuccess(null)
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setServerError(null)
    try {
      // Step 1: Create user in Firebase Authentication
      const firebaseUser = await registerWithFirebase(
        form.email,
        form.password,
        form.username
      )
      
      // Step 2: Register user in D1 database with Firebase UID
      const response = await apiRegister({
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        firebaseUid: firebaseUser.uid
      })
      notify('Registration successful.', { severity: 'success' })
      setForm(initialState)
      // Redirect to login after a short delay so user sees success message
      setTimeout(() => navigate('/login'), 1200)
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || 'Registration failed.'
      notify(errMsg, { severity: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Paper sx={{ bgcolor: 'var(--surface)', p: 3 }} component="form" onSubmit={onSubmit}>
      <Typography variant="h5" sx={{ color: 'var(--text-primary)', mb: 2 }}>
        Register
      </Typography>

      {/* Notification toasts are provided globally via NotificationProvider */}

      <TextField
        label="Email"
        value={form.email}
        onChange={handleChange('email')}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        margin="normal"
        required
      />

      <TextField
        label="Username"
        value={form.username}
        onChange={handleChange('username')}
        error={!!errors.username}
        helperText={errors.username}
        fullWidth
        margin="normal"
        required
      />

      <TextField
        label="Password"
        type="password"
        value={form.password}
        onChange={handleChange('password')}
        error={!!errors.password}
        helperText={errors.password}
        fullWidth
        margin="normal"
        required
      />

      <TextField
        label="Re-type Password"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        fullWidth
        margin="normal"
        required
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Role</InputLabel>
        <Select labelId="role-label" value={form.role} label="Role" onChange={handleChange('role')}>
          <MenuItem value="contributor">Contributor</MenuItem>
          <MenuItem value="attempter">Attempter</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>
          {loading ? 'Registering…' : 'Register'}
        </Button>
      </Box>
    </Paper>
  )
}

export default RegisterForm
