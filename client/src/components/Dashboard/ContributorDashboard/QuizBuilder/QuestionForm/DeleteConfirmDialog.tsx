import React from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'

type Props = {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

export const DeleteConfirmDialog: React.FC<Props> = ({ open, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirm delete</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this question?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>Delete</Button>
      </DialogActions>
    </Dialog>
  )
}
