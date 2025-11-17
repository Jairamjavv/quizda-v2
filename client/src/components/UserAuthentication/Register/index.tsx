import React from 'react'
import { Box, Grid } from '@mui/material'
import RegisterForm from './RegisterForm/index'
import NoticeBoard from './NoticeBoard'

const Register: React.FC = () => {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <RegisterForm />
        </Grid>

        <Grid item xs={12} md={5}>
          <NoticeBoard />
        </Grid>
      </Grid>
    </Box>
  )
}

export default Register
