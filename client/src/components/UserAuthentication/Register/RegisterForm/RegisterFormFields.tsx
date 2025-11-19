import React from 'react'
import { TextField, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material'

type FormState = {
  email: string
  username: string
  password: string
  confirmPassword: string
  role: 'contributor' | 'attempter' | 'admin'
}

type Props = {
  form: FormState
  errors: Partial<FormState>
  onChange: (key: keyof FormState) => (e: any) => void
}

export const RegisterFormFields: React.FC<Props> = ({ form, errors, onChange }) => {
  return (
    <>
      <TextField
        label="Email"
        value={form.email}
        onChange={onChange('email')}
        error={!!errors.email}
        helperText={errors.email}
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
        label="Username"
        value={form.username}
        onChange={onChange('username')}
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
        onChange={onChange('password')}
        error={!!errors.password}
        helperText={errors.password || 'Must be at least 8 characters with uppercase, lowercase, number, and special character'}
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
        label="Re-type Password"
        type="password"
        value={form.confirmPassword}
        onChange={onChange('confirmPassword')}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
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
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          value={form.role}
          label="Role"
          onChange={onChange('role')}
        >
          <MenuItem value="contributor">Contributor</MenuItem>
          <MenuItem value="attempter">Attempter</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>
    </>
  )
}
