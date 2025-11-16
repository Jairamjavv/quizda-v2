import React from 'react'
import { Box, Typography } from '@mui/material'

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Admin Dashboard (Placeholder)</Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        This is a placeholder for the Admin dashboard. Admin tools and analytics will be implemented here.
      </Typography>
    </Box>
  )
}

export default AdminDashboard
