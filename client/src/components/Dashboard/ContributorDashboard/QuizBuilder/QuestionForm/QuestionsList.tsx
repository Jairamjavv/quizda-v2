import React from 'react'
import { Box, Button, Typography } from '@mui/material'

type Props = {
  questions: any[]
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export const QuestionsList: React.FC<Props> = ({ questions, onEdit, onDelete }) => {
  if (questions.length === 0) {
    return (
      <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No questions added yet. Create your first question above.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Questions ({questions.length})</Typography>
      {questions.map((q) => (
        <Box
          key={q.id}
          sx={{
            p: 1.5,
            mt: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{q.type}</Typography>
            <Typography variant="body2">{q.data.stem}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" onClick={() => onEdit(q.id)}>Edit</Button>
            <Button size="small" color="error" onClick={() => onDelete(q.id)}>Delete</Button>
          </Box>
        </Box>
      ))}
    </Box>
  )
}
