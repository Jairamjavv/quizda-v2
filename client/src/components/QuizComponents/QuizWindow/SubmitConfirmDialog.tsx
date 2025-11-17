import React from 'react'
import { Dialog, Box, Typography, Button } from '@mui/material'

type Props = {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}

export const SubmitConfirmDialog: React.FC<Props> = ({ open, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <Box sx={{ p: 2, minWidth: 320 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Submit quiz?
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Are you sure you want to submit your answers now? You can return to the quiz to review.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button onClick={onCancel}>Return to quiz</Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}
