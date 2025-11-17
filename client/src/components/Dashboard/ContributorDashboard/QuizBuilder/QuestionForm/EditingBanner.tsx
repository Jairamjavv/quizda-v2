import React from 'react'
import { Box, Chip, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

type Props = {
  editingId: string | null
  questions: any[]
  onCancel: () => void
}

export const EditingBanner: React.FC<Props> = ({ editingId, questions, onCancel }) => {
  if (!editingId) return null

  const question = questions.find(q => q.id === editingId)
  const stemPreview = question?.data?.stem
    ? `"${String(question.data.stem).slice(0, 80)}${String(question.data.stem).length > 80 ? '...' : ''}"`
    : ''

  return (
    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip label="Editing question" color="primary" sx={{ fontWeight: 600 }} />
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {stemPreview}
      </Typography>
      <Box sx={{ flex: 1 }} />
      <IconButton size="small" onClick={onCancel} aria-label="cancel edit">
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}
