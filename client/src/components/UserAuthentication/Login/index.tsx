import React, { useState } from 'react'
import { Box } from '@mui/material'
import LoginForm from './LoginForm'
import ForgotDialog from './ForgotDialog'

const Login: React.FC = () => {
  const [forgotOpen, setForgotOpen] = useState(false)

  return (
    <Box>
      <LoginForm onOpenForgot={() => setForgotOpen(true)} />
      <ForgotDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  )
}

export default Login
