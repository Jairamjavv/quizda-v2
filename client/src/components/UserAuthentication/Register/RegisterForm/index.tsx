import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, Button, Box } from '@mui/material'
import { useNotification } from '../../../../context/NotificationContext'
import { useAuth } from '../../../../hooks/useAuth'
import { sessionManager } from '../../../../services/sessionManager'
import { registerWithFirebase } from '../../../../services/firebase'
import { RegisterFormFields } from './RegisterFormFields'
import { FormState, initialFormState, validateRegistrationForm } from './validation'

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const notify = useNotification()
  const { register } = useAuth()

  const handleChange = (key: keyof FormState) => (e: any) => {
    setForm((s) => ({ ...s, [key]: e.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    
    const validationErrors = validateRegistrationForm(form)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      // Step 1: Register with Firebase to get firebaseUid
      const firebaseUser = await registerWithFirebase(
        form.email,
        form.password,
        form.username
      )

      // Step 2: Register in backend with firebaseUid
      const response = await register({
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        firebaseUid: firebaseUser.uid,  // Include firebaseUid from Firebase
      })
      
      // Update sessionManager with registered user
      if (response.user) {
        sessionManager.setUser(response.user)
      }
      
      notify('Registration successful! Redirecting to dashboard...', { severity: 'success' })
      setForm(initialFormState)
      
      // Navigate based on user role
      const role = response.user?.role
      setTimeout(() => {
        if (role === 'admin') {
          navigate('/dashboard/admin')
        } else if (role === 'contributor') {
          navigate('/dashboard/contributor')
        } else {
          navigate('/dashboard/attempter')
        }
      }, 1000)
    } catch (err: any) {
      const errMsg = err?.message || 'Registration failed.'
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

      <RegisterFormFields form={form} errors={errors} onChange={handleChange} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}
        >
          {loading ? 'Registering…' : 'Register'}
        </Button>
      </Box>
    </Paper>
  )
}

export default RegisterForm
