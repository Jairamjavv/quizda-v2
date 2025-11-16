import React, { useEffect, useState } from 'react'
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import { QuizMode, Question } from './types'

type Props = {
  open: boolean
  onClose: () => void
  mode: QuizMode
  categoryId: string
  totalTimeSeconds?: number
}

// Simple mock questions generator
function makeQuestions(categoryId: string): Question[] {
  return [
    { id: 'q1', text: `Sample question 1 (${categoryId})`, choices: ['A', 'B', 'C', 'D'], answerIndex: 0 },
    { id: 'q2', text: `Sample question 2 (${categoryId})`, choices: ['True', 'False'], answerIndex: 1 },
    { id: 'q3', text: `Sample question 3 (${categoryId})`, choices: ['1', '2', '3'], answerIndex: 2 }
  ]
}

const QuizWindow: React.FC<Props> = ({ open, onClose, mode, categoryId, totalTimeSeconds }) => {
  const [questions] = useState<Question[]>(() => makeQuestions(categoryId))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})
  const [remaining, setRemaining] = useState<number | null>(null) // overall quiz timer in seconds

  useEffect(() => {
    setIndex(0)
    setSelected(null)
    setAnswers({})
  }, [categoryId, mode])

  // overall countdown when timed mode and totalTimeSeconds provided
  useEffect(() => {
    if (mode !== 'timed' || !totalTimeSeconds || !open) {
      setRemaining(null)
      return
    }

    setRemaining(totalTimeSeconds)
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r === null) return null
        if (r <= 1) {
          clearInterval(t)
          // time up -> prompt submit
          setConfirmOpen(true)
          return 0
        }
        return r - 1
      })
    }, 1000)

    return () => clearInterval(t)
  }, [mode, totalTimeSeconds, open])

  const handleSelect = (i: number) => setSelected(i)

  const toggleBookmark = (questionId: string) => {
    setBookmarks((b) => ({ ...b, [questionId]: !b[questionId] }))
  }

  const handleNext = () => {
    if (selected !== null) {
      setAnswers((a) => ({ ...a, [questions[index].id]: selected }))
    }
    setSelected(null)
    if (index < questions.length - 1) setIndex((s) => s + 1)
    else setConfirmOpen(true)
  }

  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleConfirmSubmit = () => {
    // ensure last answer saved (if any)
    if (selected !== null) {
      setAnswers((a) => ({ ...a, [questions[index].id]: selected }))
    }
    setConfirmOpen(false)
    onClose()
  }

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
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
              {Math.floor(remaining / 60).toString().padStart(2, '0')}:
              {(remaining % 60).toString().padStart(2, '0')}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, bgcolor: 'var(--surface)', width: '80%', mx: 'auto' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 1 }}>
              {questions[index].text}
            </Typography>
            <IconButton onClick={() => toggleBookmark(questions[index].id)} aria-label="bookmark">
              {bookmarks[questions[index].id] ? (
                <BookmarkIcon sx={{ color: 'var(--primary-green)' }} />
              ) : (
                <BookmarkBorderIcon sx={{ color: 'var(--text-primary)' }} />
              )}
            </IconButton>
          </Box>

          <RadioGroup value={selected ?? ''} onChange={(e) => handleSelect(Number(e.target.value))}>
            {questions[index].choices.map((c, i) => (
              <FormControlLabel
                key={i}
                value={i}
                control={<Radio />}
                label={c}
                sx={{ color: 'var(--text-primary)' }}
              />
            ))}
          </RadioGroup>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleNext} variant="contained" sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>
              {index < questions.length - 1 ? 'Next' : 'Finish'}
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Confirmation dialog shown when finishing the quiz */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <Box sx={{ p: 2, minWidth: 320 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Submit quiz?</Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>Are you sure you want to submit your answers now? You can return to the quiz to review.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button onClick={() => setConfirmOpen(false)}>Return to quiz</Button>
            <Button onClick={handleConfirmSubmit} variant="contained" sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>
              Submit
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Dialog>
  )
}

export default QuizWindow
