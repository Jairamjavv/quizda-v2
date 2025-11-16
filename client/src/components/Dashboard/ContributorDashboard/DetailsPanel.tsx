import React from 'react'
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material'

type Props = {
  name: string
  setName: (v: string) => void
  category: string
  setCategory: (v: string) => void
  subcategory: string
  setSubcategory: (v: string) => void
  tagsText: string
  setTagsText: (v: string) => void
  addTagFromText: () => void
  tags: string[]
  numQuestions: number
  setNumQuestions: (n: number) => void
  totalTimeMinutes: number
  setTotalTimeMinutes: (n: number) => void
  quizCategories: string[]
  onNext: () => void
  onCancel: () => void
}

const DetailsPanel: React.FC<Props> = ({
  name, setName, category, setCategory, subcategory, setSubcategory,
  tagsText, setTagsText, addTagFromText, tags, numQuestions, setNumQuestions,
  totalTimeMinutes, setTotalTimeMinutes, quizCategories, onNext, onCancel
}) => {
  return (
    <Box>
      <TextField label="Quiz name" value={name} onChange={(e) => setName(e.target.value)} fullWidth margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel id="category-label">Category</InputLabel>
        <Select labelId="category-label" value={category} label="Category" onChange={(e) => setCategory(e.target.value)}>
          {quizCategories.map((c) => (
            <MenuItem key={c} value={c}>{c}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField label="Subcategory" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} fullWidth margin="normal" />

      <TextField label="Tags (comma separated)" value={tagsText} onChange={(e) => setTagsText(e.target.value)} fullWidth margin="normal" />
      <Button onClick={addTagFromText} variant="outlined" sx={{ mt: 1 }}>Add tags</Button>

      <Box sx={{ mt: 2 }}>
        {tags.map((t) => <Chip key={t} label={t} sx={{ mr: 0.5, mb: 0.5 }} />)}
      </Box>

      <TextField label="Number of questions" type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} fullWidth margin="normal" />

      <FormControl fullWidth margin="normal">
        <InputLabel id="total-time-label">Total time (minutes)</InputLabel>
        <Select labelId="total-time-label" value={totalTimeMinutes} label="Total time (minutes)" onChange={(e: any) => setTotalTimeMinutes(Number(e.target.value))}>
          <MenuItem value={1}>1 minute</MenuItem>
          <MenuItem value={3}>3 minutes</MenuItem>
          <MenuItem value={5}>5 minutes</MenuItem>
          <MenuItem value={10}>10 minutes</MenuItem>
          <MenuItem value={15}>15 minutes</MenuItem>
          <MenuItem value={30}>30 minutes</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={onNext} sx={{ bgcolor: 'var(--primary-green)', color: '#fff' }}>Create and add questions</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  )
}

export default DetailsPanel
