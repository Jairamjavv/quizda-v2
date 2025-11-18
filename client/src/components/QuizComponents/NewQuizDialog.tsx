import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography
} from '@mui/material'
import { QuizMode, QuizCategory } from './types'

const defaultCategories: QuizCategory[] = [
  { id: 'gk', name: 'General Knowledge' },
  { id: 'prog', name: 'Programming' },
  { id: 'math', name: 'Mathematics' }
]

type Props = {
  open: boolean
  onClose: () => void
}

const NewQuizDialog: React.FC<Props> = ({ open, onClose }) => {
  const [mode, setMode] = useState<QuizMode>('timed')
  const [category, setCategory] = useState<string>(defaultCategories[0].id)
  const [minutes, setMinutes] = useState<number>(1)
  const [started] = useState(false)
  const navigate = useNavigate()
  const handleClose = () => onClose()
  const start = () => {
    // navigate to catalog with selected category and duration
    onClose()
    const categoryName = (defaultCategories.find((c) => c.id === category)?.name) || category
    navigate('/quiz-catalog', { state: { category: categoryName, totalTimeMinutes: mode === 'timed' ? minutes : 0 } })
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>New Quiz</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1">Choose mode</Typography>
            <RadioGroup value={mode} onChange={(e) => setMode(e.target.value as QuizMode)} row>
              <FormControlLabel value="timed" control={<Radio />} label="Timed" />
              <FormControlLabel value="zen" control={<Radio />} label="Zen (no timer)" />
            </RadioGroup>
          </Box>

          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="category-label">Category</InputLabel>
              <Select labelId="category-label" value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
                {defaultCategories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {mode === 'timed' && (
              <FormControl fullWidth>
                <InputLabel id="minutes-label">Duration</InputLabel>
                <Select labelId="minutes-label" value={minutes} label="Duration" onChange={(e) => setMinutes(Number(e.target.value))}>
                  <MenuItem value={1}>1 minute</MenuItem>
                  <MenuItem value={3}>3 minutes</MenuItem>
                  <MenuItem value={5}>5 minutes</MenuItem>
                  <MenuItem value={10}>10 minutes</MenuItem>
                  <MenuItem value={15}>15 minutes</MenuItem>
                  <MenuItem value={30}>30 minutes</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              After you click Next, you'll be taken to the Quiz Catalog for the selected category and duration.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={start} variant="contained" sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default NewQuizDialog
