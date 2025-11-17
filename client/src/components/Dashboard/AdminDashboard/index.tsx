import React from 'react'
import { Box } from '@mui/material'
import { Text } from '../../ui'
import { spacing } from '../../../theme/constants'

const AdminDashboard: React.FC = () => {
  return (
    <Box sx={{ p: spacing.lg }}>
      <Text as="h5">Admin Dashboard (Placeholder)</Text>
      <Text as="body2" colorType="secondary" sx={{ mt: spacing.xs }}>
        This is a placeholder for the Admin dashboard. Admin tools and analytics will be implemented here.
      </Text>
    </Box>
  )
}

export default AdminDashboard
