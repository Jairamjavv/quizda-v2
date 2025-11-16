import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import { quizCategories } from '../../../data/quizCategories'
import { useNavigate } from 'react-router-dom'

type Props = {
  open: boolean
  onClose: () => void
  onAdd: (quiz: { id: string; title: string; questionsCount: number; category?: string }) => void
}

const AddQuizDialog: React.FC<Props> = ({ open, onClose, onAdd }) => {
  const [title, setTitle] = useState('')
  const [questionsCount, setQuestionsCount] = useState<number>(5)
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number>(5)
  const [category, setCategory] = useState<string>(quizCategories[0])

  const navigate = useNavigate()

  const submit = () => {
    if (!title.trim()) return
    // Navigate to the quiz builder page and pass initial data via location state
    navigate('/contributor/new-quiz', { state: { title: title.trim(), category, totalTimeMinutes } })
    setTitle('')
    setCategory(quizCategories[0] || '')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New Quiz</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <TextField label="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" />

          <FormControl fullWidth margin="normal">
            <InputLabel id="category-select-label">Category</InputLabel>
            <Select labelId="category-select-label" value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
              {quizCategories.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Questions count"
            type="number"
            value={questionsCount}
            onChange={(e) => setQuestionsCount(Number(e.target.value))}
            fullWidth
            margin="normal"
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel id="add-total-time-label">Total time (minutes)</InputLabel>
            <Select labelId="add-total-time-label" value={totalTimeMinutes} label="Total time (minutes)" onChange={(e: any) => setTotalTimeMinutes(Number(e.target.value))}>
              <MenuItem value={1}>1 minute</MenuItem>
              <MenuItem value={3}>3 minutes</MenuItem>
              <MenuItem value={5}>5 minutes</MenuItem>
              <MenuItem value={10}>10 minutes</MenuItem>
              <MenuItem value={15}>15 minutes</MenuItem>
              <MenuItem value={30}>30 minutes</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={submit} variant="contained" sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddQuizDialog
