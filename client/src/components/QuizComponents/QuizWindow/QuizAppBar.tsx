import React from 'react'
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { QuizMode } from '../types'

type Props = {
  categoryId: string
  onClose: () => void
  mode: QuizMode
  remaining: number | null
}

export const QuizAppBar: React.FC<Props> = ({ categoryId, onClose, mode, remaining }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
    const secs = (seconds % 60).toString().padStart(2, '0')
    return `${mins}:${secs}`
  }

  return (
    <AppBar sx={{ position: 'relative', bgcolor: 'var(--surface)' }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon sx={{ color: 'var(--text-primary)' }} />
        </IconButton>
        <Typography sx={{ ml: 2, flex: 1, color: 'var(--text-primary)' }} variant="h6" component="div">
          Quiz — {categoryId}
        </Typography>
        {mode === 'timed' && remaining !== null && (
          <Typography sx={{ color: 'var(--text-primary)' }}>
            {formatTime(remaining)}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  )
}
