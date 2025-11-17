import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Paper, Typography, Button, Box } from '@mui/material'
import { useNotification } from '../../../../context/NotificationContext'
import { apiRegister } from '../../../../services/quizApi'
import { registerWithFirebase } from '../../../../services/firebase'
import { RegisterFormFields } from './RegisterFormFields'
import { FormState, initialFormState, validateRegistrationForm } from './validation'

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState<FormState>(initialFormState)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const notify = useNotification()

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
      // Step 1: Create user in Firebase Authentication
      const firebaseUser = await registerWithFirebase(
        form.email,
        form.password,
        form.username
      )
      
      // Step 2: Register user in D1 database with Firebase UID
      await apiRegister({
        email: form.email,
        username: form.username,
        password: form.password,
        role: form.role,
        firebaseUid: firebaseUser.uid
      })
      
      notify('Registration successful.', { severity: 'success' })
      setForm(initialFormState)
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
