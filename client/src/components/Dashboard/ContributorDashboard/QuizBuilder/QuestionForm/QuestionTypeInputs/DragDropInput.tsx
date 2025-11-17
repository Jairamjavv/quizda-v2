import React from 'react'
import { Box, TextField, Button, Typography } from '@mui/material'

type Props = {
  qDragItems: string[]
  setQDragItems: (arr: string[]) => void
}

export const DragDropInput: React.FC<Props> = ({ qDragItems, setQDragItems }) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="body2" sx={{ mb: 1 }}>Draggable items</Typography>
      {qDragItems.map((it, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
          <TextField
            value={it}
            onChange={(e) => setQDragItems(qDragItems.map((v, idx) => idx === i ? e.target.value : v))}
            size="small"
            fullWidth
          />
          <Button
            size="small"
            onClick={() => setQDragItems(qDragItems.filter((_, idx) => idx !== i))}
          >
            Remove
          </Button>
        </Box>
      ))}
      <Button size="small" onClick={() => setQDragItems([...qDragItems, ''])}>
        Add item
      </Button>
    </Box>
  )
}
